import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  dispatchInquirySubmissionFallback,
  shouldAttemptSubmissionFallback,
} from '@/application/forms/persistenceFallback';
import {
  validateInquirySubmission,
  type InquirySubmissionInput,
} from '@/domain/forms/inquirySubmission';
import {
  enqueueIntegrationJobs,
  processOutboxTick,
} from '@/infrastructure/integrations/outboxService';
import { buildInquirySubmissionEvent } from '@/infrastructure/integrations/outboundEvents';
import { persistInquirySubmission } from '@/infrastructure/persistence/submissionRepository';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  FormSubmissionErrorResponse,
  FormSubmissionSuccessResponse,
} from '@plenor/contracts/forms';

type InquirySubmissionServiceResponse =
  | FormSubmissionSuccessResponse
  | FormSubmissionErrorResponse;

function redactInquiryLogPayload(input: {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
}) {
  const emailDomain = input.email.includes('@')
    ? input.email.split('@').at(-1) || 'invalid'
    : 'invalid';

  return {
    nameLength: input.name.length,
    emailDomain: emailDomain.toLowerCase(),
    organizationLength: input.organization.length,
    inquiryTypeLength: input.inquiryType.length,
    messageLength: input.message.length,
  };
}

export async function submitInquiryForm(
  context: RequestContext,
  body: unknown,
): Promise<ServiceResult<InquirySubmissionServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  try {
    const input =
      body && typeof body === 'object'
        ? (body as InquirySubmissionInput)
        : ({} as InquirySubmissionInput);
    const validation = validateInquirySubmission(input);

    if (!validation.ok) {
      return fail(400, { message: validation.message, requestId: context.requestId });
    }

    const entry = {
      name: validation.data.name,
      email: validation.data.email,
      organization: validation.data.organization,
      inquiryType: validation.data.inquiryType,
      message: validation.data.message,
    };

    let submissionId = '';
    try {
      const submission = await persistInquirySubmission(
        entry.name,
        entry.email,
        entry.organization,
        entry.inquiryType,
        entry.message,
      );

      submissionId = submission.id;
      const event = buildInquirySubmissionEvent({ submission });
      await enqueueIntegrationJobs({
        submissionId: submission.id,
        event,
      });
    } catch (dbError) {
      const err = dbError instanceof Error ? dbError : new Error(String(dbError));
      if (shouldAttemptSubmissionFallback(err)) {
        console.warn('Inquiry submission persistence unavailable; using direct fallback.', {
          requestId: context.requestId,
          input: redactInquiryLogPayload(entry),
          errorMessage: err.message,
        });

        const fallbackSucceeded = await dispatchInquirySubmissionFallback({
          name: entry.name,
          email: entry.email,
          company: entry.organization,
          challenge: `${entry.inquiryType}\n\n${entry.message}`.trim(),
        });

        if (fallbackSucceeded) {
          return ok({ success: true });
        }
      }

      console.error('Inquiry submission persistence failed.', {
        requestId: context.requestId,
        input: redactInquiryLogPayload(entry),
        errorName: err.name,
        errorMessage: err.message,
      });
      return fail(500, { message: 'Unable to save your submission. Please try again.', requestId: context.requestId });
    }

    if (submissionId) {
      try {
        await processOutboxTick(10);
      } catch (error) {
        console.error(
          'Outbox processing failed for inquiry submission:',
          error,
        );
      }
    }

    return ok({ success: true });
  } catch (error) {
    console.error('Inquiry form error:', error);
    return fail(500, { message: 'Server error. Please try again.', requestId: context.requestId });
  }
}
