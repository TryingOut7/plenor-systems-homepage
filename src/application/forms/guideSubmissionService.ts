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

export async function submitGuideForm(
  context: RequestContext,
  body: unknown,
): Promise<ServiceResult<GuideSubmissionServiceResponse>> {
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
        ? (body as GuideSubmissionInput)
        : ({} as GuideSubmissionInput);
    const validation = validateGuideSubmission(input);

    if (!validation.ok) {
      return fail(400, { message: validation.message });
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
    } catch {
      console.error(
        'DB log failed for guide submission - entry:',
        JSON.stringify(entry),
      );
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
    return fail(500, { message: 'Server error. Please try again.' });
  }
}
