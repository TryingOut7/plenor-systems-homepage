import type { GlobalConfig } from 'payload'
import { validateSafeCssValue } from '@/lib/safeCss'
import { withFieldTier } from '../fields/fieldTier.ts'
import { auditGlobalAfterChange } from '../hooks/auditLog.ts'
import { revalidateGlobalAfterChange } from '../hooks/revalidateCmsContent.ts'
import { applySchemeTokensHook } from '../hooks/applySchemeTokens.ts'

const cssValueHint =
  'Use a single safe CSS value (for example #1B2D4F, rgb(...), 1200px, clamp(...), or var(...)).'

function validateExternalFontUrl(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) return true
  const trimmed = value.trim()

  if (trimmed.startsWith('/')) return true

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') {
      return 'Font URLs must use HTTPS.'
    }
    if (parsed.username || parsed.password) {
      return 'Font URLs cannot include embedded credentials.'
    }
    return true
  } catch {
    return 'Enter a valid HTTPS URL (or a relative /path).'
  }
}

export const UISettings: GlobalConfig = {
  slug: 'ui-settings',
  access: {
    read: () => true,
    update: ({ req }) =>
      !!req.user &&
      ['admin', 'editor'].includes(
        (req.user as unknown as Record<string, unknown>).role as string,
      ),
  },
  versions: {
    max: 25,
    drafts: {
      autosave: false,
    },
  },
  hooks: {
    // applySchemeTokensHook runs before save to cascade-resolve preset values
    // when the active scheme or any preset selector is changed.
    beforeChange: [applySchemeTokensHook],
    afterChange: [revalidateGlobalAfterChange, auditGlobalAfterChange],
  },
  admin: {
    group: 'Site',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── SCHEME TAB ────────────────────────────────────────────────────────
        // Governs the active visual theme. Changing scheme auto-populates all
        // design tokens in the other tabs via the applySchemeTokensHook.
        // Authority: Site Configuration Record v1.0 §1.6 + §1.7
        {
          label: 'Scheme',
          fields: [
            {
              name: 'currentScheme',
              label: 'Active Scheme',
              type: 'select',
              defaultValue: 'warm_professional',
              options: [
                { label: 'Warm Professional', value: 'warm_professional' },
                { label: 'Professional Cool', value: 'professional_cool' },
                { label: 'Modern Technical', value: 'modern_technical' },
              ],
              admin: {
                description:
                  'Governs the startup_professional Family (fixed for the current phase). ' +
                  'Changing scheme triggers a full cascade: all colours, buttons, and email ' +
                  'palette are overwritten, and the three preset selectors are validated ' +
                  'against the new scheme\'s allowed sets.',
              },
            },
            {
              name: 'currentTypographyPreset',
              label: 'Typography Preset',
              type: 'select',
              defaultValue: 'tp_editorial_professional',
              options: [
                {
                  label: 'Editorial Professional — Newsreader (display) + Inter (body)',
                  value: 'tp_editorial_professional',
                },
                {
                  label: 'Professional Modern — Inter (all roles)',
                  value: 'tp_professional_modern',
                },
              ],
              admin: {
                description:
                  'Must be within the active scheme\'s allowed typography presets. ' +
                  'On scheme switch, cascade resolution replaces this with the new scheme\'s ' +
                  'default if the current preset is not in the allowed set.',
              },
            },
            {
              name: 'currentSpacingPreset',
              label: 'Spacing Preset',
              type: 'select',
              defaultValue: 'sp_relaxed',
              options: [
                { label: 'Relaxed — sectionPadding 56 / 80 / 112 px', value: 'sp_relaxed' },
                { label: 'Standard — sectionPadding 48 / 72 / 96 px', value: 'sp_standard' },
              ],
              admin: {
                description:
                  'Controls section and hero padding scale. Cascade resolution enforced on scheme switch.',
              },
            },
            {
              name: 'currentRadiusPreset',
              label: 'Radius Preset',
              type: 'select',
              defaultValue: 'rd_soft_controlled',
              options: [
                {
                  label: 'Soft Controlled — button 10px / card 16px',
                  value: 'rd_soft_controlled',
                },
                { label: 'Minimal — button 6px / card 10px', value: 'rd_minimal' },
              ],
              admin: {
                description:
                  'Controls button and card corner radius. Cascade resolution enforced on scheme switch.',
              },
            },
          ],
        },

        // ── COLORS TAB ────────────────────────────────────────────────────────
        // Defaults reflect the active warm_professional scheme.
        // All values here can be manually overridden after scheme selection.
        {
          label: 'Colors',
          fields: [
            {
              name: 'colors',
              type: 'group',
              fields: [
                {
                  name: 'primary',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'primaryHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#173A46',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'background',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FBF8F2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'surface',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: {
                    description:
                      'Card and elevated surface colour — must differ from background to provide depth separation. ' +
                      cssValueHint,
                  },
                },
                {
                  name: 'sectionAlt',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#F2ECE2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'text',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1F2933',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'textMuted',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#5C6670',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'border',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#D8D0C3',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'link',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'focusRing',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#0F766E',
                  admin: {
                    description:
                      'Accessibility focus ring colour (WCAG 2.2). Must satisfy contrast requirements. ' +
                      cssValueHint,
                  },
                },

                {
                  name: 'navyBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'charcoalBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1F2933',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'blackBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#111827',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'darkText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'darkTextMuted',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'rgba(255,255,255,0.72)',
                  admin: { description: cssValueHint },
                },

                {
                  name: 'heroBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroMutedText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'rgba(255,255,255,0.72)',
                  admin: { description: cssValueHint },
                },

                {
                  name: 'footerBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'footerText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'footerMutedText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'rgba(255,255,255,0.6)',
                  admin: { description: cssValueHint },
                },

                {
                  name: 'cookieBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'cookieText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'cookieLink',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#93C5FD',
                  admin: { description: cssValueHint },
                },

                {
                  name: 'navBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'transparent',
                  admin: {
                    description: `Navbar container background (top of page). ${cssValueHint}`,
                  },
                },
                {
                  name: 'navScrolledBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'navBorder',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#D8D0C3',
                  admin: { description: cssValueHint },
                },
              ],
            },
          ],
        },

        // ── TYPOGRAPHY TAB ────────────────────────────────────────────────────
        // Defaults reflect tp_editorial_professional (active preset).
        {
          label: 'Typography',
          fields: [
            {
              name: 'typography',
              type: 'group',
              fields: [
                {
                  name: 'bodyFontFamily',
                  label: 'Body Font Family',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'var(--font-sans), system-ui, sans-serif',
                  admin: {
                    description: `Body font (navigation, buttons, and body copy). ${cssValueHint}`,
                  },
                },
                {
                  // Hidden legacy field — kept for backwards compatibility only.
                  name: 'displayFontFamily',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: "var(--font-newsreader), 'Newsreader', Georgia, serif",
                  admin: {
                    hidden: true,
                    condition: () => false,
                    description:
                      'Legacy display-font override — kept only for backwards compatibility.',
                  },
                },
                { name: 'baseFontSize', type: 'number', defaultValue: 16, min: 12, max: 24 },
                {
                  name: 'baseLineHeight',
                  type: 'number',
                  // tp_editorial_professional body lineHeight = 1.7
                  defaultValue: 1.7,
                  min: 1,
                  max: 2,
                },
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
                  // tp_editorial_professional label letterSpacing = 0.06em
                  defaultValue: '0.06em',
                  admin: { description: cssValueHint },
                },
                withFieldTier(
                  {
                    name: 'headingFontUrl',
                    type: 'text',
                    validate: validateExternalFontUrl,
                    admin: {
                      hidden: true,
                      condition: () => false,
                      description:
                        'Legacy heading-font stylesheet URL — kept only for backwards compatibility.',
                    },
                  },
                  'system',
                ),
                withFieldTier(
                  {
                    name: 'bodyFontUrl',
                    label: 'Site Font Stylesheet URL',
                    type: 'text',
                    validate: validateExternalFontUrl,
                    admin: {
                      description:
                        'Optional Google Fonts or external stylesheet URL for the site font.',
                    },
                  },
                  'system',
                ),
              ],
            },
          ],
        },

        // ── LAYOUT TAB ────────────────────────────────────────────────────────
        // Defaults reflect sp_relaxed spacing + rd_soft_controlled radius +
        // warm_professional layout (containerMaxWidth / navHeight).
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
                // sp_relaxed spacing values
                {
                  name: 'sectionPaddingCompact',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '56px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingRegular',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '80px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'sectionPaddingSpacious',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '112px 24px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingCompact',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '72px 24px 80px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingRegular',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '96px 24px 104px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'heroPaddingSpacious',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '128px 24px 136px',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'mobileSectionPadding',
                  type: 'text',
                  validate: validateSafeCssValue,
                  // sp_relaxed mobileSectionPadding = 40px
                  defaultValue: '40px',
                  admin: { description: cssValueHint },
                },
                // warm_professional navHeight = 72
                { name: 'navHeight', type: 'number', defaultValue: 72, min: 40, max: 120 },
                // rd_soft_controlled cardRadius = 16
                { name: 'cardRadius', type: 'number', defaultValue: 16, min: 0, max: 40 },
              ],
            },
          ],
        },

        // ── BUTTONS TAB ───────────────────────────────────────────────────────
        // Defaults reflect warm_professional buttons + rd_soft_controlled radius.
        {
          label: 'Buttons',
          fields: [
            {
              name: 'buttons',
              type: 'group',
              fields: [
                // rd_soft_controlled buttonRadius = 10
                { name: 'radius', type: 'number', defaultValue: 10, min: 0, max: 40 },

                // warm_professional primary button
                {
                  name: 'primaryBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'primaryBackgroundHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#173A46',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'primaryText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },

                // warm_professional secondary button — filled warm-cream, dark text
                {
                  name: 'secondaryBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#F2ECE2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'secondaryBackgroundHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#E8DFD2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'secondaryText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1F2933',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'secondaryTextHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#111827',
                  admin: { description: cssValueHint },
                },

                // warm_professional ghost button — transparent, fills on hover
                {
                  name: 'ghostBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: 'transparent',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'ghostBackgroundHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#F2ECE2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'ghostText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },

                // warm_professional nav CTA button (inside navbar — not the container)
                {
                  name: 'navBackground',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: {
                    description: `Navbar CTA button background (not the navbar container). ${cssValueHint}`,
                  },
                },
                {
                  name: 'navBackgroundHover',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#173A46',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'navText',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
              ],
            },
          ],
        },

        // ── EMAIL TAB ─────────────────────────────────────────────────────────
        // Defaults reflect warm_professional emailPalette.
        {
          label: 'Email',
          fields: [
            {
              name: 'emailPalette',
              type: 'group',
              admin: {
                description: 'Transactional email palette for inquiry and notification emails.',
              },
              fields: [
                {
                  name: 'primary',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1E4A59',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'muted',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#6B7280',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'text',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#1F2933',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'background',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FBF8F2',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'white',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#FFFFFF',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'border',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#D8D0C3',
                  admin: { description: cssValueHint },
                },
                {
                  name: 'error',
                  type: 'text',
                  validate: validateSafeCssValue,
                  defaultValue: '#C0392B',
                  admin: { description: cssValueHint },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
