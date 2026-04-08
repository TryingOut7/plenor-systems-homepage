export async function saveGuideSubmissionToPayloadForm(input: {
  name: string;
  email: string;
  formId?: string | number;
}): Promise<void> {
  const [{ getGuideFormEmailConfig }, { getPayload }] = await Promise.all([
    import('./guideFormEmailGateway'),
    import('../../payload/client'),
  ]);

  const [guideFormEmailConfig, payload] = await Promise.all([
    getGuideFormEmailConfig(input.formId),
    getPayload(),
  ]);

  const targetFormId = guideFormEmailConfig.formId;
  if (targetFormId == null) {
    throw new Error('Unable to resolve a guide form ID for form-submissions persistence.');
  }
  const targetFormIdNumber =
    typeof targetFormId === 'number' ? targetFormId : Number(targetFormId);
  if (!Number.isFinite(targetFormIdNumber)) {
    throw new Error('Resolved guide form ID is not a valid number.');
  }

  await payload.create({
    collection: 'form-submissions',
    data: {
      form: targetFormIdNumber,
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
  const [{ getInquiryFormId }, { getPayload }] = await Promise.all([
    import('../../lib/payload-form-stubs'),
    import('../../payload/client'),
  ]);

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
