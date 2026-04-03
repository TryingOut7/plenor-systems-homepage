import type { GlobalConfig } from 'payload';
import { withFieldTier } from '../fields/fieldTier.ts';
import { auditGlobalAfterChange } from '../hooks/auditLog.ts';

const cssValueHint =
  'Use any valid CSS value (for example #1B2D4F, rgb(...), 1200px, clamp(...), or var(...)).';

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
                { name: 'primary', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'primaryHover', type: 'text', defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'background', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'surface', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'sectionAlt', type: 'text', defaultValue: '#F8F9FA', admin: { description: cssValueHint } },
                { name: 'text', type: 'text', defaultValue: '#1A1A1A', admin: { description: cssValueHint } },
                { name: 'textMuted', type: 'text', defaultValue: '#6B7280', admin: { description: cssValueHint } },
                { name: 'border', type: 'text', defaultValue: '#E5E7EB', admin: { description: cssValueHint } },
                { name: 'link', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'focusRing', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },

                { name: 'navyBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'charcoalBackground', type: 'text', defaultValue: '#1F2937', admin: { description: cssValueHint } },
                { name: 'blackBackground', type: 'text', defaultValue: '#111827', admin: { description: cssValueHint } },
                { name: 'darkText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'darkTextMuted', type: 'text', defaultValue: 'rgba(255,255,255,0.72)', admin: { description: cssValueHint } },

                { name: 'heroBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'heroText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'heroMutedText', type: 'text', defaultValue: 'rgba(255,255,255,0.72)', admin: { description: cssValueHint } },

                { name: 'footerBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'footerText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'footerMutedText', type: 'text', defaultValue: 'rgba(255,255,255,0.6)', admin: { description: cssValueHint } },

                { name: 'cookieBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'cookieText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'cookieLink', type: 'text', defaultValue: '#93C5FD', admin: { description: cssValueHint } },

                { name: 'navBackground', type: 'text', defaultValue: 'transparent', admin: { description: cssValueHint } },
                { name: 'navScrolledBackground', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'navBorder', type: 'text', defaultValue: '#E5E7EB', admin: { description: cssValueHint } },
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
                  defaultValue: 'var(--font-sans), system-ui, sans-serif',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'displayFontFamily',
                  type: 'text',
                  defaultValue: 'var(--font-display), Georgia, serif',
                  admin: { description: cssValueHint },
                },
                { name: 'baseFontSize', type: 'number', defaultValue: 16, min: 12, max: 24 },
                { name: 'baseLineHeight', type: 'number', defaultValue: 1.6, min: 1, max: 2 },
                {
                  name: 'headingLetterSpacing',
                  type: 'text',
                  defaultValue: '-0.02em',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionLabelLetterSpacing',
                  type: 'text',
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
                  defaultValue: '1200px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingCompact',
                  type: 'text',
                  defaultValue: '72px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingRegular',
                  type: 'text',
                  defaultValue: '96px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingSpacious',
                  type: 'text',
                  defaultValue: '124px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingCompact',
                  type: 'text',
                  defaultValue: '88px 24px 96px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingRegular',
                  type: 'text',
                  defaultValue: '112px 24px 120px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingSpacious',
                  type: 'text',
                  defaultValue: '140px 24px 148px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'mobileSectionPadding',
                  type: 'text',
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
                { name: 'primaryBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'primaryBackgroundHover', type: 'text', defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'primaryText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },

                { name: 'secondaryBackground', type: 'text', defaultValue: 'transparent', admin: { description: cssValueHint } },
                { name: 'secondaryBackgroundHover', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'secondaryText', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'secondaryTextHover', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },

                { name: 'ghostBackground', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
                { name: 'ghostBackgroundHover', type: 'text', defaultValue: '#F0F4FA', admin: { description: cssValueHint } },
                { name: 'ghostText', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },

                { name: 'navBackground', type: 'text', defaultValue: '#1B2D4F', admin: { description: cssValueHint } },
                { name: 'navBackgroundHover', type: 'text', defaultValue: '#2A4270', admin: { description: cssValueHint } },
                { name: 'navText', type: 'text', defaultValue: '#FFFFFF', admin: { description: cssValueHint } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
