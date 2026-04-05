import type { Field } from 'payload';
import { withFieldTier } from './fieldTier.ts';

type BuildSeoFieldsOptions = {
  canonicalSystemTier?: boolean;
};

export function buildSeoFields(options: BuildSeoFieldsOptions = {}): Field[] {
  const canonicalTier = options.canonicalSystemTier ? 'system' : 'routine';
  return [
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
      withFieldTier({
        name: 'canonicalUrl',
        type: 'text',
      }, canonicalTier),
      withFieldTier({
        name: 'noindex',
        type: 'checkbox',
        defaultValue: false,
      }, canonicalTier),
      withFieldTier({
        name: 'nofollow',
        type: 'checkbox',
        defaultValue: false,
      }, canonicalTier),
      withFieldTier({
        name: 'includeInSitemap',
        type: 'checkbox',
        defaultValue: true,
      }, canonicalTier),
    ],
  },
];
}

export const seoFields: Field[] = buildSeoFields();
