import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const InquiryFormSection: Block = {
  slug: 'inquiryFormSection',
  dbName: 'inquiry_form',
  labels: { singular: 'Inquiry Form Section', plural: 'Inquiry Form Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text', defaultValue: 'Send an inquiry' },
    { name: 'heading', type: 'text', defaultValue: 'Send a direct inquiry' },
    {
      name: 'subtext',
      type: 'textarea',
      defaultValue:
        'Tell us about your product, your team, and the challenge you are working through.',
    },
    { name: 'nextStepsLabel', type: 'text', defaultValue: 'What happens next' },
    {
      name: 'nextStepsBody',
      type: 'textarea',
      defaultValue:
        'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
    },
    { name: 'directEmailLabel', type: 'text', defaultValue: 'Prefer email directly?' },
    { name: 'emailAddress', type: 'email', defaultValue: 'hello@plenor.ai' },
    { name: 'linkedinLabel', type: 'text', defaultValue: 'Connect on LinkedIn' },
    {
      name: 'linkedinHref',
      type: 'text',
      defaultValue: 'https://www.linkedin.com/company/plenor-ai',
    },
  ],
};
