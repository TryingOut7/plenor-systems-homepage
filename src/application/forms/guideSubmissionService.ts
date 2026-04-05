import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  validateGuideSubmission,
  type GuideSubmissionInput,
} from '@/domain/forms/guideSubmission';
import {
  enqueueIntegrationJobs,
  processOutboxTick,
} from '@/infrastructure/integrations/outboxService';
import { buildGuideSubmissionEvent } from '@/infrastructure/integrations/outboundEvents';
import { persistGuideSubmission } from '@/infrastructure/persistence/submissionRepository';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  FormSubmissionErrorResponse,
  FormSubmissionSuccessResponse,
} from '@plenor/contracts/forms';

type GuideSubmissionServiceResponse =
  | FormSubmissionSuccessResponse
  | FormSubmissionErrorResponse;

function redactGuideLogPayload(input: { name: string; email: string }) {
  const emailDomain = input.email.includes('@')
    ? input.email.split('@').at(-1) || 'invalid'
    : 'invalid';

  return {
    nameLength: input.name.length,
    emailDomain: emailDomain.toLowerCase(),
  };
}

export async function submitGuideForm(
  context: RequestContext,
  body: unknown,
): Promise<ServiceResult<GuideSubmissionServiceResponse>> {
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
        ? (body as GuideSubmissionInput)
        : ({} as GuideSubmissionInput);
    const validation = validateGuideSubmission(input);

    if (!validation.ok) {
      return fail(400, { message: validation.message, requestId: context.requestId });
    }

    const entry = {
      name: validation.data.name,
      email: validation.data.email,
    };

    let submissionId = '';
    try {
      const submission = await persistGuideSubmission(entry.name, entry.email);
      submissionId = submission.id;

      const event = buildGuideSubmissionEvent({
        submission,
        templateId: validation.data.templateId,
      });

      await enqueueIntegrationJobs({
        submissionId: submission.id,
        event,
      });
    } catch (dbError) {
      const err = dbError instanceof Error ? dbError : new Error(String(dbError));
      console.error('Guide submission persistence failed.', {
        requestId: context.requestId,
        input: redactGuideLogPayload(entry),
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
          'Outbox processing failed for guide submission:',
          error,
        );
      }
    }

    return ok({ success: true });
  } catch (error) {
    console.error('Guide form error:', error);
    return fail(500, { message: 'Server error. Please try again.', requestId: context.requestId });
  }
}
