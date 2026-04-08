import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgSpotlightDetailSection: Block = {
  slug: 'orgSpotlightDetailSection',
  dbName: 'org_spot_detail',
  labels: { singular: 'Org Spotlight Detail', plural: 'Org Spotlight Details' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'spotlightEntry',
      type: 'relationship',
      relationTo: 'org-spotlight',
      required: true,
      admin: {
        description: 'The spotlight entry to display on this page.',
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
