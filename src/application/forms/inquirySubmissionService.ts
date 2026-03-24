import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
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

export async function submitInquiryForm(
  context: RequestContext,
  body: unknown,
): Promise<ServiceResult<InquirySubmissionServiceResponse>> {
  const rateLimitError = checkRateLimit(context);
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
      company: validation.data.company,
      challenge: validation.data.challenge,
    };

    let submissionId = '';
    try {
      const submission = await persistInquirySubmission(
        entry.name,
        entry.email,
        entry.company,
        entry.challenge,
      );

      submissionId = submission.id;
      const event = buildInquirySubmissionEvent({ submission });
      await enqueueIntegrationJobs({
        submissionId: submission.id,
        event,
      });
    } catch (dbError) {
      console.error(
        'DB log failed for inquiry submission - entry:',
        JSON.stringify(entry),
        dbError,
      );
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
