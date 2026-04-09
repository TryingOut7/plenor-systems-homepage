import type { GlobalConfig } from 'payload';
import { validateSafeCssValue } from '@/lib/safeCss';
import { withFieldTier } from '../fields/fieldTier.ts';
import { auditGlobalAfterChange } from '../hooks/auditLog.ts';
import { revalidateGlobalAfterChange } from '../hooks/revalidateCmsContent.ts';

const cssValueHint =
  'Use a single safe CSS value (for example #1B2D4F, rgb(...), 1200px, clamp(...), or var(...)).';

function validateExternalFontUrl(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) return true;
  const trimmed = value.trim();

  if (trimmed.startsWith('/')) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return 'Font URLs must use HTTPS.';
    }
    if (parsed.username || parsed.password) {
      return 'Font URLs cannot include embedded credentials.';
    }
    return true;
  } catch {
    return 'Enter a valid HTTPS URL (or a relative /path).';
  }
}

export const UISettings: GlobalConfig = {
  slug: 'ui-settings',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
  },
  versions: {
    max: 25,
    drafts: {
      autosave: false,
    },
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange, auditGlobalAfterChange],
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Colors',
          fields: [
            {
              name: 'colors',
              type: 'group',
              fields: [
                { name: 'primary', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'primaryHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'background', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'surface', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'sectionAlt', type: 'text', validate: validateSafeCssValue, defaultValue: '#F8F9FA', admin: { description: cssValueHint } },
                { name: 'text', type: 'text', validate: validateSafeCssValue, defaultValue: '#1A1A1A', admin: { description: cssValueHint } },
                { name: 'textMuted', type: 'text', validate: validateSafeCssValue, defaultValue: '#6B7280', admin: { description: cssValueHint } },
                { name: 'border', type: 'text', validate: validateSafeCssValue, defaultValue: '#E5E7EB', admin: { description: cssValueHint } },
                { name: 'link', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'focusRing', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },

                { name: 'navyBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'charcoalBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1F2937', admin: { description: cssValueHint } },
                { name: 'blackBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#111827', admin: { description: cssValueHint } },
                { name: 'darkText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'darkTextMuted', type: 'text', validate: validateSafeCssValue, defaultValue: 'rgba(255,255,255,0.72)', admin: { description: cssValueHint } },

                { name: 'heroBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'heroText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'heroMutedText', type: 'text', validate: validateSafeCssValue, defaultValue: 'rgba(255,255,255,0.72)', admin: { description: cssValueHint } },

                { name: 'footerBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'footerText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'footerMutedText', type: 'text', validate: validateSafeCssValue, defaultValue: 'rgba(255,255,255,0.6)', admin: { description: cssValueHint } },

                { name: 'cookieBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'cookieText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'cookieLink', type: 'text', validate: validateSafeCssValue, defaultValue: '#93C5FD', admin: { description: cssValueHint } },

                { name: 'navBackground', type: 'text', validate: validateSafeCssValue, defaultValue: 'transparent', admin: { description: `Navbar container background color (top of page). ${cssValueHint}` } },
                { name: 'navScrolledBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'navBorder', type: 'text', validate: validateSafeCssValue, defaultValue: '#E5E7EB', admin: { description: cssValueHint } },
              ],
            },
          ],
        },
        {
          label: 'Typography',
          fields: [
            {
              name: 'typography',
              type: 'group',
              fields: [
                {
                  name: 'bodyFontFamily',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'var(--font-sans), system-ui, sans-serif',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'displayFontFamily',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'var(--font-display), Georgia, serif',
                  admin: { description: cssValueHint },
                },
                { name: 'baseFontSize', type: 'number', defaultValue: 16, min: 12, max: 24 },
                { name: 'baseLineHeight', type: 'number', defaultValue: 1.6, min: 1, max: 2 },
                {
                  name: 'headingLetterSpacing',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '-0.02em',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionLabelLetterSpacing',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '0.12em',
                  admin: { description: cssValueHint },
                },
                withFieldTier({
                  name: 'headingFontUrl',
                  type: 'text',
                  validate: validateExternalFontUrl,
                  admin: { description: 'Google Fonts or external URL to load heading/display font (e.g. https://fonts.googleapis.com/css2?family=...)' },
                }, 'system'),
                withFieldTier({
                  name: 'bodyFontUrl',
                  type: 'text',
                  validate: validateExternalFontUrl,
                  admin: { description: 'Google Fonts or external URL to load body font' },
                }, 'system'),
              ],
            },
          ],
        },
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'group',
              fields: [
                {
                  name: 'containerMaxWidth',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '1200px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingCompact',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '72px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingRegular',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '96px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingSpacious',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '124px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingCompact',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '88px 24px 96px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingRegular',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '112px 24px 120px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingSpacious',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '140px 24px 148px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'mobileSectionPadding',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '64px',
                  admin: { description: cssValueHint },
                },
                { name: 'navHeight', type: 'number', defaultValue: 68, min: 40, max: 120 },
                { name: 'cardRadius', type: 'number', defaultValue: 8, min: 0, max: 40 },
              ],
            },
          ],
        },
        {
          label: 'Buttons',
          fields: [
            {
              name: 'buttons',
              type: 'group',
              fields: [
                { name: 'radius', type: 'number', defaultValue: 4, min: 0, max: 40 },
                { name: 'primaryBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'primaryBackgroundHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'primaryText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },

                { name: 'secondaryBackground', type: 'text', validate: validateSafeCssValue, defaultValue: 'transparent', admin: { description: cssValueHint } },
                { name: 'secondaryBackgroundHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'secondaryText', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'secondaryTextHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },

                { name: 'ghostBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'ghostBackgroundHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#F0F4FA', admin: { description: cssValueHint } },
                { name: 'ghostText', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },

                { name: 'navBackground', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: `Navbar CTA button background color (not the navbar container). ${cssValueHint}` } },
                { name: 'navBackgroundHover', type: 'text', validate: validateSafeCssValue, defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'navText', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
              ],
            },
          ],
        },
        {
          label: 'Email',
          fields: [
            {
              name: 'emailPalette',
              type: 'group',
              admin: {
                description:
                  'Transactional email palette used for guide and inquiry notifications.',
              },
              fields: [
                { name: 'primary', type: 'text', validate: validateSafeCssValue, defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'muted', type: 'text', validate: validateSafeCssValue, defaultValue: '#6B7280', admin: { description: cssValueHint } },
                { name: 'text', type: 'text', validate: validateSafeCssValue, defaultValue: '#1A1A1A', admin: { description: cssValueHint } },
                { name: 'background', type: 'text', validate: validateSafeCssValue, defaultValue: '#F8F9FA', admin: { description: cssValueHint } },
                { name: 'white', type: 'text', validate: validateSafeCssValue, defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'border', type: 'text', validate: validateSafeCssValue, defaultValue: '#E5E7EB', admin: { description: cssValueHint } },
                { name: 'error', type: 'text', validate: validateSafeCssValue, defaultValue: '#DC2626', admin: { description: cssValueHint } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
