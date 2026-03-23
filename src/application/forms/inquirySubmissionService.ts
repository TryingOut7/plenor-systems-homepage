import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  validateInquirySubmission,
  type InquirySubmissionInput,
} from '@/domain/forms/inquirySubmission';
import { saveInquirySubmissionToPayloadForm } from '@/infrastructure/cms/formSubmissionGateway';
import { queueCrmEvent } from '@/infrastructure/integrations/crmGateway';
import { sendInquiryRoutingEmails } from '@/infrastructure/integrations/emailGateway';
import { persistInquirySubmission } from '@/infrastructure/persistence/submissionRepository';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  FormSubmissionErrorResponse,
  FormSubmissionSuccessResponse,
} from '@/shared/contracts/forms';

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
      return fail(400, { message: validation.message });
    }

    const entry = {
      name: validation.data.name,
      email: validation.data.email,
      company: validation.data.company,
      challenge: validation.data.challenge,
      submittedAt: new Date().toISOString(),
    };

    try {
      await persistInquirySubmission(
        entry.name,
        entry.email,
        entry.company,
        entry.challenge,
      );
    } catch {
      console.error(
        'DB log failed for inquiry submission - entry:',
        JSON.stringify(entry),
      );
    }

    void queueCrmEvent({
      event: 'inquiry',
      timestamp: entry.submittedAt,
      data: {
        name: entry.name,
        email: entry.email,
        company: entry.company,
        challenge: entry.challenge,
      },
    }).catch((error) => {
      console.error('CRM webhook failed (inquiry):', error);
    });

    void saveInquirySubmissionToPayloadForm({
      name: entry.name,
      email: entry.email,
      company: entry.company,
      challenge: entry.challenge,
    }).catch((error) => {
      console.error('Payload form-submissions save failed (inquiry):', error);
    });

    await sendInquiryRoutingEmails({
      name: entry.name,
      email: entry.email,
      company: entry.company,
      challenge: entry.challenge,
    });

    return ok({ success: true });
  } catch (error) {
    console.error('Inquiry form error:', error);
    return fail(500, { message: 'Server error. Please try again.' });
  }
}
