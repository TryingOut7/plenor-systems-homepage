import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  versions: {
    max: 25,
    drafts: {
      autosave: {
        interval: 1000,
      },
    },
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
      defaultValue: 'hello@plenor.ai',
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      defaultValue: 'Get the Free Guide',
      admin: {
        description: 'Legacy single CTA label. Use Header Buttons below for flexible add/remove controls.',
      },
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
      defaultValue: '/contact#guide',
      admin: {
        description: 'Legacy single CTA link. Use Header Buttons below for flexible add/remove controls.',
      },
    },
    {
      name: 'headerButtons',
      type: 'array',
      defaultValue: [
        {
          label: 'Get the Free Guide',
          href: '/contact#guide',
          variant: 'primary',
          isVisible: true,
        },
      ],
      admin: {
        description:
          'Add, remove, and hide top-right navbar buttons directly from the dashboard.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Ghost', value: 'ghost' },
          ],
        },
        { name: 'isVisible', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'twitterHandle',
      type: 'text',
    },

    // ─── Navigation ───────────────────────────────────────────────────────
    {
      name: 'navigationLinks',
      type: 'array',
      defaultValue: [
        { label: 'Home', href: '/', isVisible: true },
        { label: 'Services', href: '/services', isVisible: true },
        { label: 'Pricing', href: '/pricing', isVisible: true },
        { label: 'About', href: '/about', isVisible: true },
        { label: 'Contact', href: '/contact', isVisible: true },
      ],
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
      defaultValue: [
        {
          title: 'Pages',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
          ],
        },
      ],
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
      defaultValue: [
        { label: 'LinkedIn', url: 'https://www.linkedin.com/company/plenor-ai' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© {year} {siteName}. All rights reserved.',
    },
    {
      name: 'footerLegalLabel',
      type: 'text',
      defaultValue: 'Cookie Notice & Privacy Policy',
    },
    {
      name: 'footerLegalHref',
      type: 'text',
      defaultValue: '/privacy',
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
        {
          name: 'message',
          type: 'textarea',
          defaultValue:
            'We use privacy-friendly analytics to improve this website. You can accept or decline analytics cookies.',
        },
        { name: 'acceptLabel', type: 'text', defaultValue: 'Accept' },
        { name: 'declineLabel', type: 'text', defaultValue: 'Decline' },
        { name: 'privacyLabel', type: 'text', defaultValue: 'Privacy Policy' },
        { name: 'privacyHref', type: 'text', defaultValue: '/privacy' },
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
