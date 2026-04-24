/**
 * Governed design token definitions for the startup_professional family.
 *
 * Source: Site Configuration Record v1.0
 * Authority: Site Configuration Standard v1.0 + Site Configuration Record v1.0
 *
 * IMPORTANT: Do not modify token values here without a corresponding update to
 * the Site Configuration Record. These values are the technical realization of
 * the governed configuration record, not local implementation choices.
 */

// ─── Scheme Definitions ───────────────────────────────────────────────────────

export const SCHEMES = {
  warm_professional: {
    label: 'Warm Professional',
    parentFamily: 'startup_professional',
    colors: {
      primary: '#1E4A59',
      primaryHover: '#173A46',
      background: '#FBF8F2',
      surface: '#FFFFFF',
      sectionAlt: '#F2ECE2',
      text: '#1F2933',
      textMuted: '#5C6670',
      border: '#D8D0C3',
      link: '#1E4A59',
      focusRing: '#0F766E',
      success: '#2F7A3E',
      warning: '#B7791F',
      error: '#C0392B',
    },
    layout: {
      containerMaxWidth: '1200px',
      navHeight: 72,
    },
    buttons: {
      primaryBackground: '#1E4A59',
      primaryBackgroundHover: '#173A46',
      primaryText: '#FFFFFF',
      secondaryBackground: '#F2ECE2',
      secondaryBackgroundHover: '#E8DFD2',
      secondaryText: '#1F2933',
      secondaryTextHover: '#111827',
      ghostBackground: 'transparent',
      ghostBackgroundHover: '#F2ECE2',
      ghostText: '#1E4A59',
      navBackground: '#1E4A59',
      navBackgroundHover: '#173A46',
      navText: '#FFFFFF',
    },
    emailPalette: {
      primary: '#1E4A59',
      muted: '#6B7280',
      text: '#1F2933',
      background: '#FBF8F2',
      white: '#FFFFFF',
      border: '#D8D0C3',
      error: '#C0392B',
    },
    allowedTypographyPresets: ['tp_editorial_professional', 'tp_professional_modern'],
    defaultTypographyPreset: 'tp_editorial_professional',
    allowedSpacingPresets: ['sp_standard', 'sp_relaxed'],
    defaultSpacingPreset: 'sp_relaxed',
    allowedRadiusPresets: ['rd_soft_controlled', 'rd_minimal'],
    defaultRadiusPreset: 'rd_soft_controlled',
  },

  professional_cool: {
    label: 'Professional Cool',
    parentFamily: 'startup_professional',
    colors: {
      primary: '#214A6B',
      primaryHover: '#17354D',
      background: '#F7F9FB',
      surface: '#FFFFFF',
      sectionAlt: '#EEF2F6',
      text: '#1E293B',
      textMuted: '#5B6470',
      border: '#D5DDE6',
      link: '#214A6B',
      focusRing: '#0F766E',
      success: '#2F7A3E',
      warning: '#B7791F',
      error: '#C0392B',
    },
    layout: {
      containerMaxWidth: '1200px',
      navHeight: 72,
    },
    buttons: {
      primaryBackground: '#214A6B',
      primaryBackgroundHover: '#17354D',
      primaryText: '#FFFFFF',
      secondaryBackground: '#EEF2F6',
      secondaryBackgroundHover: '#E2E8F0',
      secondaryText: '#1E293B',
      secondaryTextHover: '#0F172A',
      ghostBackground: 'transparent',
      ghostBackgroundHover: '#EEF2F6',
      ghostText: '#214A6B',
      navBackground: '#214A6B',
      navBackgroundHover: '#17354D',
      navText: '#FFFFFF',
    },
    emailPalette: {
      primary: '#214A6B',
      muted: '#6B7280',
      text: '#1E293B',
      background: '#F7F9FB',
      white: '#FFFFFF',
      border: '#D5DDE6',
      error: '#C0392B',
    },
    allowedTypographyPresets: ['tp_professional_modern', 'tp_editorial_professional'],
    defaultTypographyPreset: 'tp_professional_modern',
    allowedSpacingPresets: ['sp_standard', 'sp_relaxed'],
    defaultSpacingPreset: 'sp_standard',
    allowedRadiusPresets: ['rd_minimal', 'rd_soft_controlled'],
    defaultRadiusPreset: 'rd_minimal',
  },

  modern_technical: {
    label: 'Modern Technical',
    parentFamily: 'startup_professional',
    colors: {
      primary: '#0F4C81',
      primaryHover: '#0B3A63',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      sectionAlt: '#EFF4F8',
      text: '#111827',
      textMuted: '#5B6470',
      border: '#D6DEE7',
      link: '#0F4C81',
      focusRing: '#0EA5A4',
      success: '#2F7A3E',
      warning: '#B7791F',
      error: '#C0392B',
    },
    layout: {
      containerMaxWidth: '1200px',
      navHeight: 72,
    },
    buttons: {
      primaryBackground: '#0F4C81',
      primaryBackgroundHover: '#0B3A63',
      primaryText: '#FFFFFF',
      secondaryBackground: '#EFF4F8',
      secondaryBackgroundHover: '#E5EDF4',
      secondaryText: '#111827',
      secondaryTextHover: '#0B1220',
      ghostBackground: 'transparent',
      ghostBackgroundHover: '#EFF4F8',
      ghostText: '#0F4C81',
      navBackground: '#0F4C81',
      navBackgroundHover: '#0B3A63',
      navText: '#FFFFFF',
    },
    emailPalette: {
      primary: '#0F4C81',
      muted: '#6B7280',
      text: '#111827',
      background: '#F8FAFC',
      white: '#FFFFFF',
      border: '#D6DEE7',
      error: '#C0392B',
    },
    allowedTypographyPresets: ['tp_professional_modern'],
    defaultTypographyPreset: 'tp_professional_modern',
    allowedSpacingPresets: ['sp_standard'],
    defaultSpacingPreset: 'sp_standard',
    allowedRadiusPresets: ['rd_minimal'],
    defaultRadiusPreset: 'rd_minimal',
  },
} as const

export type SchemeKey = keyof typeof SCHEMES

// ─── Typography Preset Definitions ───────────────────────────────────────────

export const TYPOGRAPHY_PRESETS = {
  tp_editorial_professional: {
    label: 'Editorial Professional',
    bodyFontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayFontFamily: "'Newsreader', Georgia, serif",
    bodyLineHeight: 1.7,
    labelLetterSpacing: '0.06em',
  },
  tp_professional_modern: {
    label: 'Professional Modern',
    bodyFontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayFontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    bodyLineHeight: 1.65,
    labelLetterSpacing: '0.06em',
  },
} as const

export type TypographyPresetKey = keyof typeof TYPOGRAPHY_PRESETS

// ─── Spacing Preset Definitions ───────────────────────────────────────────────

export const SPACING_PRESETS = {
  sp_relaxed: {
    label: 'Relaxed',
    sectionPaddingCompact: 56,
    sectionPaddingRegular: 80,
    sectionPaddingSpacious: 112,
    heroPaddingCompact: 72,
    heroPaddingRegular: 96,
    heroPaddingSpacious: 128,
    mobileSectionPadding: '40px',
  },
  sp_standard: {
    label: 'Standard',
    sectionPaddingCompact: 48,
    sectionPaddingRegular: 72,
    sectionPaddingSpacious: 96,
    heroPaddingCompact: 64,
    heroPaddingRegular: 88,
    heroPaddingSpacious: 120,
    mobileSectionPadding: '32px',
  },
} as const

export type SpacingPresetKey = keyof typeof SPACING_PRESETS

// ─── Radius Preset Definitions ────────────────────────────────────────────────

export const RADIUS_PRESETS = {
  rd_soft_controlled: {
    label: 'Soft Controlled',
    buttonRadius: 10,
    cardRadius: 16,
  },
  rd_minimal: {
    label: 'Minimal',
    buttonRadius: 6,
    cardRadius: 10,
  },
} as const

export type RadiusPresetKey = keyof typeof RADIUS_PRESETS

// ─── Active Plenor Phase 1 Selection (from Config Record §1.7) ───────────────

export const ACTIVE_SELECTION = {
  currentFamily: 'startup_professional',
  currentScheme: 'warm_professional' as SchemeKey,
  currentTypographyPreset: 'tp_editorial_professional' as TypographyPresetKey,
  currentSpacingPreset: 'sp_relaxed' as SpacingPresetKey,
  currentRadiusPreset: 'rd_soft_controlled' as RadiusPresetKey,
} as const
