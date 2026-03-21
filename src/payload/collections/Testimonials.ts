import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'personName',
    defaultColumns: ['personName', 'company', 'isFeatured', 'rating'],
  },
  access: {
    read: () => true,
  },
  versions: {
    maxPerDoc: 25,
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
      validate: false,
    },
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'personName',
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
      name: 'role',
      type: 'text',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'details',
      type: 'richText',
      admin: {
        description: 'Extended testimonial details',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    ...seoFields,
  ],
};
