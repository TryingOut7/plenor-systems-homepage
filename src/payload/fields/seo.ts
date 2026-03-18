import type { Field } from 'payload';

export const seoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    admin: {
      description: 'SEO & Open Graph settings',
    },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
      },
      {
        name: 'metaDescription',
        type: 'textarea',
      },
      {
        name: 'ogTitle',
        type: 'text',
      },
      {
        name: 'ogDescription',
        type: 'textarea',
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'canonicalUrl',
        type: 'text',
      },
      {
        name: 'noindex',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'nofollow',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'includeInSitemap',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
];
