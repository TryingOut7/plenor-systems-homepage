import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'branding', title: 'Branding', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'footer', title: 'Footer' },
    { name: 'seo', title: 'SEO Defaults' },
    { name: 'forms', title: 'Forms' },
    { name: 'legal', title: 'Legal & Cookies' },
    { name: 'errorPages', title: 'Error Pages' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    // ── Branding ──────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      group: 'branding',
      initialValue: 'Plenor Systems',
    }),
    defineField({
      name: 'brandTagline',
      title: 'Brand Tagline',
      type: 'string',
      group: 'branding',
      initialValue: 'A product development framework for Testing & QA and Launch & Go-to-Market.',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      description: 'Base URL used for canonical links, sitemaps, JSON-LD, etc.',
      type: 'url',
      group: 'branding',
      initialValue: 'https://plenor.ai',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Primary CTA Label',
      type: 'string',
      group: 'branding',
      initialValue: 'Get the Free Guide',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'Primary CTA URL',
      type: 'string',
      group: 'branding',
      initialValue: '/contact#guide',
    }),
    defineField({
      name: 'twitterHandle',
      title: 'Twitter / X Handle',
      type: 'string',
      group: 'branding',
      initialValue: '@plenor_ai',
    }),

    // ── Navigation ────────────────────────────────────────
    defineField({
      name: 'navigationLinks',
      title: 'Navigation Links',
      type: 'array',
      group: 'navigation',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'href', title: 'Href', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'isVisible', title: 'Visible', type: 'boolean', initialValue: true }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        }),
      ],
    }),

    // ── Footer ────────────────────────────────────────────
    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Column Title', type: 'string' }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'href', title: 'Href', type: 'string' }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'href' },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        }),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'footer',
      initialValue: 'hello@plenor.ai',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      description: 'Footer copyright line. Use {year} for current year and {siteName} for site name.',
      type: 'string',
      group: 'footer',
      initialValue: '© {year} {siteName}. All rights reserved.',
    }),
    defineField({
      name: 'footerLegalLabel',
      title: 'Footer Legal Link Label',
      type: 'string',
      group: 'footer',
      initialValue: 'Cookie Notice & Privacy Policy',
    }),
    defineField({
      name: 'footerLegalHref',
      title: 'Footer Legal Link URL',
      type: 'string',
      group: 'footer',
      initialValue: '/privacy',
    }),

    // ── SEO Defaults ──────────────────────────────────────
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seoFields',
      group: 'seo',
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default Meta Description',
      description: 'Used in root layout when no page-specific description is set.',
      type: 'text',
      rows: 3,
      group: 'seo',
      initialValue: 'Plenor Systems provides a structured product development framework for Testing & QA and Launch & Go-to-Market — the two stages most likely to cause rework or failed launches.',
    }),
    defineField({
      name: 'jsonLd',
      title: 'JSON-LD / Structured Data',
      description: 'Organization-level structured data for search engines.',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'organizationName', title: 'Organization Name', type: 'string' }),
        defineField({ name: 'organizationUrl', title: 'Organization URL', type: 'url' }),
        defineField({ name: 'organizationEmail', title: 'Organization Email', type: 'string' }),
        defineField({
          name: 'sameAs',
          title: 'Same As (social URLs)',
          type: 'array',
          of: [defineArrayMember({ type: 'url' })],
        }),
      ],
    }),

    // ── Forms ─────────────────────────────────────────────
    defineField({
      name: 'guideForm',
      title: 'Guide Form Labels',
      type: 'object',
      group: 'forms',
      fields: [
        defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string', initialValue: 'Send me the guide' }),
        defineField({ name: 'submittingLabel', title: 'Submitting Label', type: 'string', initialValue: 'Sending\u2026' }),
        defineField({ name: 'successHeading', title: 'Success Heading', type: 'string', initialValue: 'Guide on its way!' }),
        defineField({ name: 'successBody', title: 'Success Body', type: 'string', initialValue: 'Check your inbox \u2014 the PDF will arrive shortly from Plenor Systems.' }),
        defineField({ name: 'footerText', title: 'Footer Text', type: 'string', initialValue: 'The PDF will be sent to your email automatically. No spam, no mailing lists.' }),
        defineField({ name: 'namePlaceholder', title: 'Name Placeholder', type: 'string', initialValue: 'Your name' }),
        defineField({ name: 'emailPlaceholder', title: 'Email Placeholder', type: 'string', initialValue: 'you@company.com' }),
      ],
    }),
    defineField({
      name: 'inquiryForm',
      title: 'Inquiry Form Labels',
      type: 'object',
      group: 'forms',
      fields: [
        defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string', initialValue: 'Send inquiry' }),
        defineField({ name: 'submittingLabel', title: 'Submitting Label', type: 'string', initialValue: 'Sending\u2026' }),
        defineField({ name: 'successHeading', title: 'Success Heading', type: 'string', initialValue: 'Inquiry received' }),
        defineField({ name: 'successBody', title: 'Success Body', type: 'string', initialValue: 'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.' }),
        defineField({ name: 'consentText', title: 'Consent Footer Text', type: 'string', initialValue: 'By submitting, you agree to our' }),
        defineField({ name: 'namePlaceholder', title: 'Name Placeholder', type: 'string', initialValue: 'Your name' }),
        defineField({ name: 'emailPlaceholder', title: 'Email Placeholder', type: 'string', initialValue: 'you@company.com' }),
        defineField({ name: 'companyPlaceholder', title: 'Company Placeholder', type: 'string', initialValue: 'Your company' }),
        defineField({ name: 'challengePlaceholder', title: 'Challenge Placeholder', type: 'string', initialValue: 'Tell us about your product stage, team size, and what you\u2019re trying to solve.' }),
      ],
    }),

    // ── Legal & Cookies ───────────────────────────────────
    defineField({
      name: 'cookieBanner',
      title: 'Cookie Banner',
      type: 'object',
      group: 'legal',
      fields: [
        defineField({ name: 'message', title: 'Banner Message', type: 'text', rows: 2, initialValue: 'We use analytics cookies to understand how visitors use this site. No cookies are set before you consent.' }),
        defineField({ name: 'acceptLabel', title: 'Accept Button Label', type: 'string', initialValue: 'Accept' }),
        defineField({ name: 'declineLabel', title: 'Decline Button Label', type: 'string', initialValue: 'Decline' }),
        defineField({ name: 'privacyLabel', title: 'Privacy Link Label', type: 'string', initialValue: 'Privacy Policy' }),
        defineField({ name: 'privacyHref', title: 'Privacy Link URL', type: 'string', initialValue: '/privacy' }),
      ],
    }),
    defineField({
      name: 'privacyPolicy',
      title: 'Privacy Policy',
      description: 'Full privacy policy content rendered on /privacy.',
      type: 'array',
      group: 'legal',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'privacyLastUpdated',
      title: 'Privacy Policy Last Updated',
      type: 'string',
      group: 'legal',
      initialValue: 'March 2026',
    }),

    // ── Error Pages ───────────────────────────────────────
    defineField({
      name: 'notFoundPage',
      title: '404 Page',
      type: 'object',
      group: 'errorPages',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Page not found' }),
        defineField({ name: 'body', title: 'Body Text', type: 'text', rows: 2, initialValue: "The page you\u2019re looking for doesn\u2019t exist or has moved. Head back to the homepage to find what you need." }),
        defineField({ name: 'buttonLabel', title: 'Button Label', type: 'string', initialValue: 'Back to Home' }),
        defineField({ name: 'buttonHref', title: 'Button URL', type: 'string', initialValue: '/' }),
      ],
    }),

    // ── Advanced ──────────────────────────────────────────
    defineField({
      name: 'cookieNotice',
      title: 'Cookie Notice (legacy)',
      type: 'text',
      rows: 2,
      group: 'advanced',
      hidden: true,
    }),
    defineField({
      name: 'analyticsId',
      title: 'Analytics ID',
      description: 'Cloudflare Web Analytics beacon token or GA4 measurement ID.',
      type: 'string',
      group: 'advanced',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Site Settings',
      subtitle: 'Global site configuration',
    }),
  },
});
