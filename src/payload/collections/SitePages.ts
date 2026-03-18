import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo';
import { pageSectionBlocks } from '../blocks/pageSections';

export const SitePages: CollectionConfig = {
  slug: 'site-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isActive'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pageMode',
      type: 'select',
      defaultValue: 'builder',
      options: [
        { label: 'Builder', value: 'builder' },
        { label: 'Template', value: 'template' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'templateKey',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'Article', value: 'article' },
        { label: 'Product', value: 'product' },
      ],
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.pageMode === 'template',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
    },
    ...seoFields,
  ],
};
