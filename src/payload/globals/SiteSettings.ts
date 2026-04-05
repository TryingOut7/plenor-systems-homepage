import type { GlobalConfig } from 'payload';
import { withFieldTier } from '../fields/fieldTier.ts';
import { auditGlobalAfterChange } from '../hooks/auditLog.ts';
import { validateHttpUrl, validatePathOrHttpUrl } from '../validation/url.ts';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Site',
  },
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
  hooks: {
    afterChange: [auditGlobalAfterChange],
  },
  fields: [
    // ─── Branding ─────────────────────────────────────────────────────────
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Website',
    },
    {
      name: 'logoImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Optional logo image. If not set, the site name text is used.',
      },
    },
    {
      name: 'logoWidth',
      type: 'number',
      defaultValue: 120,
      min: 40,
      max: 400,
      admin: {
        position: 'sidebar',
        description: 'Logo display width in pixels',
      },
    },
    {
      name: 'brandTagline',
      type: 'text',
    },
    {
      name: 'siteUrl',
      type: 'text',
      defaultValue: 'https://example.com',
      validate: validateHttpUrl,
    },
    {
      name: 'contactEmail',
      type: 'email',
      defaultValue: 'contact@example.com',
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
        { name: 'href', type: 'text', required: true, validate: validatePathOrHttpUrl },
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
    {
      name: 'contentRouting',
      label: 'Content Routing',
      type: 'group',
      admin: {
        description:
          'Central URLs and email routing used across guide delivery, legal links, and workflow notifications.',
      },
      fields: [
        {
          name: 'guideTitle',
          type: 'text',
          defaultValue: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them',
        },
        {
          name: 'guidePdfUrl',
          type: 'text',
          validate: validatePathOrHttpUrl,
          admin: {
            description: 'PDF download URL used by guide delivery emails.',
          },
        },
        {
          name: 'guidePageUrl',
          type: 'text',
          defaultValue: '/contact#guide',
          validate: validatePathOrHttpUrl,
          admin: {
            description: 'Guide landing URL used in acknowledgement emails.',
          },
        },
        {
          name: 'privacyPolicyUrl',
          type: 'text',
          defaultValue: '/privacy',
          validate: validatePathOrHttpUrl,
          admin: {
            description: 'Privacy policy URL used in transactional emails and legal links.',
          },
        },
        withFieldTier({
          name: 'workflowNotifyEmail',
          type: 'email',
          admin: {
            description: 'Optional inbox for workflow status notifications (review/approve/publish/reject).',
          },
        }, 'system'),
      ],
    },
    {
      name: 'emailDefaults',
      label: 'Email Defaults',
      type: 'group',
      admin: {
        description:
          'Fallback copy for transactional emails when a section-specific template is not selected.',
      },
      fields: [
        { name: 'brandName', type: 'text', admin: { description: 'Optional override for brand name in emails.' } },
        {
          name: 'guideSubject',
          type: 'text',
          defaultValue: 'Your free guide from {brandName}',
          admin: {
            description: 'Guide delivery subject. Supported tokens: {brandName}, {name}.',
          },
        },
        {
          name: 'guideHeading',
          type: 'text',
          defaultValue: "Here's your guide, {name}.",
          admin: {
            description: 'Guide delivery heading. Supported tokens: {brandName}, {name}.',
          },
        },
        {
          name: 'guideBody',
          type: 'textarea',
          defaultValue:
            'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.',
        },
        {
          name: 'guideButtonLabel',
          type: 'text',
          defaultValue: 'Download the guide',
        },
        {
          name: 'inquiryNotificationSubject',
          type: 'text',
          defaultValue: 'New inquiry from {name} ({company})',
          admin: {
            description: 'Internal inquiry alert subject. Supported tokens: {name}, {company}.',
          },
        },
        {
          name: 'inquiryAckSubject',
          type: 'text',
          defaultValue: 'We received your inquiry — {brandName}',
          admin: {
            description: 'Inquiry acknowledgment subject. Supported tokens: {brandName}, {name}.',
          },
        },
        {
          name: 'inquiryAckHeading',
          type: 'text',
          defaultValue: 'We received your inquiry, {name}.',
          admin: {
            description: 'Inquiry acknowledgment heading. Supported tokens: {brandName}, {name}.',
          },
        },
        {
          name: 'inquiryAckBody',
          type: 'textarea',
          defaultValue:
            'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
        },
      ],
    },
    {
      name: 'corePresetContent',
      label: 'Core Page Preset Content',
      type: 'group',
      admin: {
        description:
          'Global source of truth for Home/Services/About/Pricing/Contact fixed-template copy. Individual pages can still keep local overrides.',
      },
      fields: [
        {
          name: 'home',
          type: 'json',
          defaultValue: {},
          admin: {
            description: 'Key-value overrides for Home preset copy.',
          },
        },
        {
          name: 'services',
          type: 'json',
          defaultValue: {},
          admin: {
            description: 'Key-value overrides for Services preset copy.',
          },
        },
        {
          name: 'about',
          type: 'json',
          defaultValue: {},
          admin: {
            description: 'Key-value overrides for About preset copy.',
          },
        },
        {
          name: 'pricing',
          type: 'json',
          defaultValue: {},
          admin: {
            description: 'Key-value overrides for Pricing preset copy.',
          },
        },
        {
          name: 'contact',
          type: 'json',
          defaultValue: {},
          admin: {
            description: 'Key-value overrides for Contact preset copy.',
          },
        },
      ],
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
        { name: 'href', type: 'text', required: true, validate: validatePathOrHttpUrl },
        { name: 'isVisible', type: 'checkbox', defaultValue: true },
        {
          name: 'children',
          type: 'array',
          dbName: 'nav_children',
          admin: { description: 'Optional dropdown links shown on hover' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true, validate: validatePathOrHttpUrl },
          ],
        },
      ],
    },

    // ─── Announcement Banner ──────────────────────────────────────────────
    {
      name: 'announcementBanner',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'text', type: 'text' },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text', validate: validatePathOrHttpUrl },
        { name: 'backgroundColor', type: 'text', defaultValue: '#1B2D4F', admin: { description: 'Hex, rgb, or CSS value' } },
        { name: 'textColor', type: 'text', defaultValue: '#FFFFFF', admin: { description: 'Hex, rgb, or CSS value' } },
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
            { name: 'href', type: 'text', required: true, validate: validatePathOrHttpUrl },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, validate: validateHttpUrl },
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
      validate: validatePathOrHttpUrl,
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
        withFieldTier({ name: 'canonicalUrl', type: 'text', validate: validateHttpUrl }, 'system'),
        withFieldTier({ name: 'noindex', type: 'checkbox', defaultValue: false }, 'system'),
        withFieldTier({ name: 'nofollow', type: 'checkbox', defaultValue: false }, 'system'),
        withFieldTier({ name: 'includeInSitemap', type: 'checkbox', defaultValue: true }, 'system'),
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
        { name: 'organizationUrl', type: 'text', validate: validateHttpUrl },
        { name: 'organizationEmail', type: 'email' },
        {
          name: 'sameAs',
          type: 'array',
          fields: [{ name: 'url', type: 'text', required: true, validate: validateHttpUrl }],
        },
      ],
    },

    // ─── Forms ────────────────────────────────────────────────────────────
    {
      name: 'guideForm',
      label: 'Guide Form Defaults',
      type: 'group',
      admin: {
        description:
          'Default labels/messages for guide forms. Individual pages can override content in their Form Embed section.',
      },
      fields: [
        { name: 'submitLabel', type: 'text' },
        { name: 'submittingLabel', type: 'text' },
        { name: 'successHeading', type: 'text' },
        { name: 'successBody', type: 'text' },
        { name: 'footerText', type: 'text' },
        { name: 'privacyLabel', type: 'text', defaultValue: 'Privacy Policy' },
        { name: 'privacyHref', type: 'text', defaultValue: '/privacy', validate: validatePathOrHttpUrl },
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
        { name: 'privacyLabel', type: 'text', defaultValue: 'Privacy Policy' },
        { name: 'privacyHref', type: 'text', defaultValue: '/privacy', validate: validatePathOrHttpUrl },
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
        { name: 'privacyHref', type: 'text', defaultValue: '/privacy', validate: validatePathOrHttpUrl },
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
        { name: 'metaTitle', type: 'text', defaultValue: 'Page Not Found' },
        {
          name: 'metaDescription',
          type: 'textarea',
          defaultValue: 'The page you requested could not be found.',
        },
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonHref', type: 'text', validate: validatePathOrHttpUrl },
      ],
    },

    // ─── Analytics ────────────────────────────────────────────────────────
    withFieldTier({
      name: 'analyticsId',
      type: 'text',
      admin: {
        description: 'Cloudflare Web Analytics token or similar',
      },
    }, 'system'),
  ],
};
