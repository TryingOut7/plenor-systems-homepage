import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const PrivacyNoteSection: Block = {
  slug: 'privacyNoteSection',
  dbName: 'privacy_note',
  labels: { singular: 'Privacy Note Section', plural: 'Privacy Note Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text', defaultValue: 'By submitting this form, you agree to our' },
    { name: 'policyLinkLabel', type: 'text', defaultValue: 'Privacy Policy' },
    { name: 'policyLinkHref', type: 'text', defaultValue: '/privacy' },
  ],
};
