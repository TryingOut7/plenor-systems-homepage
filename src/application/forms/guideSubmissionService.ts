import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  validateGuideSubmission,
  type GuideSubmissionInput,
} from '@/domain/forms/guideSubmission';
import { getGuideEmailTemplate } from '@/infrastructure/cms/emailTemplateGateway';
import { saveGuideSubmissionToPayloadForm } from '@/infrastructure/cms/formSubmissionGateway';
import { queueCrmEvent } from '@/infrastructure/integrations/crmGateway';
import {
  sendGuideDeliveryEmail,
  type GuideEmailTemplate,
} from '@/infrastructure/integrations/emailGateway';
import { persistGuideSubmission } from '@/infrastructure/persistence/submissionRepository';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  FormSubmissionErrorResponse,
  FormSubmissionSuccessResponse,
} from '@/shared/contracts/forms';

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
      submittedAt: new Date().toISOString(),
    };

    try {
      await persistGuideSubmission(entry.name, entry.email);
    } catch {
      console.error(
        'DB log failed for guide submission - entry:',
        JSON.stringify(entry),
      );
    }

    void queueCrmEvent({
      event: 'guide_download',
      timestamp: entry.submittedAt,
      data: { name: entry.name, email: entry.email },
    }).catch((error) => {
      console.error('CRM webhook failed (guide):', error);
    });

    void saveGuideSubmissionToPayloadForm({
      name: entry.name,
      email: entry.email,
    }).catch((error) => {
      console.error('Payload form-submissions save failed (guide):', error);
    });

    let emailTemplate: GuideEmailTemplate | undefined;
    if (validation.data.templateId != null) {
      try {
        emailTemplate = await getGuideEmailTemplate(validation.data.templateId);
      } catch (error) {
        console.error('Failed to fetch email template:', error);
      }
    }

    await sendGuideDeliveryEmail({
      name: entry.name,
      email: entry.email,
      template: emailTemplate,
    });

    return ok({ success: true });
  } catch (error) {
    console.error('Guide form error:', error);
    return fail(500, { message: 'Server error. Please try again.' });
  }
}
