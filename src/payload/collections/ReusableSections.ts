import type { CollectionConfig } from 'payload';
import { pageSectionBlocks } from '../blocks/pageSections';

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
    },
  ],
};
