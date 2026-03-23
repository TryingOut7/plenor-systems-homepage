import { getGuideFormId, getInquiryFormId } from '@/lib/payload-form-stubs';
import { getPayload } from '@/payload/client';

export async function saveGuideSubmissionToPayloadForm(input: {
  name: string;
  email: string;
}): Promise<void> {
  const [formId, payload] = await Promise.all([getGuideFormId(), getPayload()]);

  await payload.create({
    collection: 'form-submissions',
    data: {
      form: formId,
      formType: 'Guide Download',
      submissionData: [
        { field: 'name', value: input.name },
        { field: 'email', value: input.email },
      ],
    },
    overrideAccess: true,
  });
}

export async function saveInquirySubmissionToPayloadForm(input: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}): Promise<void> {
  const [formId, payload] = await Promise.all([getInquiryFormId(), getPayload()]);

  await payload.create({
    collection: 'form-submissions',
    data: {
      form: formId,
      formType: 'Inquiry',
      submissionData: [
        { field: 'name', value: input.name },
        { field: 'email', value: input.email },
        { field: 'company', value: input.company },
        { field: 'challenge', value: input.challenge },
      ],
    },
    overrideAccess: true,
  });
}
