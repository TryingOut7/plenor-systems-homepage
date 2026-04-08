import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgLearningDetailSection: Block = {
  slug: 'orgLearningDetailSection',
  dbName: 'org_learn_detail',
  labels: { singular: 'Org Learning Detail', plural: 'Org Learning Details' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'learningEntry',
      type: 'relationship',
      relationTo: 'org-learning',
      required: true,
      admin: {
        description: 'The learning resource to display on this page.',
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
