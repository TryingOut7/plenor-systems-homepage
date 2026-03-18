import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    // ─── Branding ─────────────────────────────────────────────────────────
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Plenor Systems',
    },
    {
      name: 'brandTagline',
      type: 'text',
    },
    {
      name: 'siteUrl',
      type: 'text',
      defaultValue: 'https://plenor.ai',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
    },
    {
      name: 'twitterHandle',
      type: 'text',
    },

    // ─── Navigation ───────────────────────────────────────────────────────
    {
      name: 'navigationLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'isVisible', type: 'checkbox', defaultValue: true },
      ],
    },

    // ─── Footer ───────────────────────────────────────────────────────────
    {
      name: 'footerColumns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
    },
    {
      name: 'footerLegalLabel',
      type: 'text',
    },
    {
      name: 'footerLegalHref',
      type: 'text',
    },

    // ─── Default SEO ──────────────────────────────────────────────────────
    {
      name: 'defaultSeo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogTitle', type: 'text' },
        { name: 'ogDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'canonicalUrl', type: 'text' },
        { name: 'noindex', type: 'checkbox', defaultValue: false },
        { name: 'nofollow', type: 'checkbox', defaultValue: false },
        { name: 'includeInSitemap', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'defaultMetaDescription',
      type: 'textarea',
    },

    // ─── JSON-LD ──────────────────────────────────────────────────────────
    {
      name: 'jsonLd',
      type: 'group',
      fields: [
        { name: 'organizationName', type: 'text' },
        { name: 'organizationUrl', type: 'text' },
        { name: 'organizationEmail', type: 'email' },
        {
          name: 'sameAs',
          type: 'array',
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },

    // ─── Forms ────────────────────────────────────────────────────────────
    {
      name: 'guideForm',
      type: 'group',
      fields: [
        { name: 'submitLabel', type: 'text' },
        { name: 'submittingLabel', type: 'text' },
        { name: 'successHeading', type: 'text' },
        { name: 'successBody', type: 'text' },
        { name: 'footerText', type: 'text' },
        { name: 'namePlaceholder', type: 'text' },
        { name: 'emailPlaceholder', type: 'text' },
      ],
    },
    {
      name: 'inquiryForm',
      type: 'group',
      fields: [
        { name: 'submitLabel', type: 'text' },
        { name: 'submittingLabel', type: 'text' },
        { name: 'successHeading', type: 'text' },
        { name: 'successBody', type: 'text' },
        { name: 'consentText', type: 'text' },
        { name: 'namePlaceholder', type: 'text' },
        { name: 'emailPlaceholder', type: 'text' },
        { name: 'companyPlaceholder', type: 'text' },
        { name: 'challengePlaceholder', type: 'text' },
      ],
    },

    // ─── Cookie Banner ────────────────────────────────────────────────────
    {
      name: 'cookieBanner',
      type: 'group',
      fields: [
        { name: 'message', type: 'textarea' },
        { name: 'acceptLabel', type: 'text' },
        { name: 'declineLabel', type: 'text' },
        { name: 'privacyLabel', type: 'text' },
        { name: 'privacyHref', type: 'text' },
      ],
    },

    // ─── Legal ────────────────────────────────────────────────────────────
    {
      name: 'privacyPolicy',
      type: 'richText',
    },
    {
      name: 'privacyLastUpdated',
      type: 'text',
    },

    // ─── Error Pages ──────────────────────────────────────────────────────
    {
      name: 'notFoundPage',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonHref', type: 'text' },
      ],
    },

    // ─── Analytics ────────────────────────────────────────────────────────
    {
      name: 'analyticsId',
      type: 'text',
      admin: {
        description: 'Cloudflare Web Analytics token or similar',
      },
    },
  ],
};
