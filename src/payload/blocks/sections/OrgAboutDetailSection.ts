import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgAboutDetailSection: Block = {
  slug: 'orgAboutDetailSection',
  dbName: 'org_about_detail',
  labels: { singular: 'Org About Detail', plural: 'Org About Details' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'org-about-profiles',
      required: true,
      admin: {
        description: 'The about profile to display on this page.',
      },
    },
    {
      name: 'showCategoryNav',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show the category navigation bar.',
      },
    },
  ],
};
