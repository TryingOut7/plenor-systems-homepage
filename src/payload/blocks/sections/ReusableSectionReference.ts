import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const ReusableSectionReference: Block = {
  slug: 'reusableSectionReference',
  dbName: 'reuse_sec_ref',
  labels: { singular: 'Reusable Section', plural: 'Reusable Sections' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'reusableSection',
      type: 'relationship',
      relationTo: 'reusable-sections',
      required: true,
    },
    {
      name: 'overrideHeading',
      type: 'text',
      admin: { description: 'Override the reusable section heading' },
    },
  ],
};
