import { normalizeSafeCssColorValue } from '@/lib/safeCss';

export type GovernedStatus = 'approved' | 'deferred' | 'not_used_current_phase';

export type FamilyId = 'startup_professional';
export type SchemeId =
  | 'professional_cool'
  | 'modern_technical'
  | 'warm_professional';
export type TypographyPresetId = 'tp_editorial_professional';
export type SpacingPresetId = 'sp_relaxed';
export type RadiusPresetId = 'rd_soft_controlled';

export type GovernedInterfaceColorToken =
  | 'primary'
  | 'primary-hover'
  | 'background'
  | 'surface'
  | 'section-alt'
  | 'text'
  | 'text-muted'
  | 'border'
  | 'link'
  | 'focus-ring'
  | 'success'
  | 'warning'
  | 'error'
  | 'dark-bg'
  | 'dark-text';

type SchemeRecord = {
  id: SchemeId;
  label: string;
  parentFamily: FamilyId;
  status: GovernedStatus;
  allowedTypographyPresets: TypographyPresetId[];
  defaultTypographyPreset: TypographyPresetId;
  allowedSpacingPresets: SpacingPresetId[];
  defaultSpacingPreset: SpacingPresetId;
  allowedRadiusPresets: RadiusPresetId[];
  defaultRadiusPreset: RadiusPresetId;
  colors?: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    sectionAlt: string;
    text: string;
    textMuted: string;
    border: string;
    link: string;
    focusRing: string;
    success: string;
    warning: string;
    error: string;
    darkBg: string;
    charcoalBg: string;
    blackBg: string;
    darkText: string;
    darkTextMuted: string;
    heroBackground: string;
    heroText: string;
    heroMutedText: string;
    footerBackground: string;
    footerText: string;
    footerMutedText: string;
    cookieBackground: string;
    cookieText: string;
    cookieLink: string;
    navBackground: string;
    navScrolledBackground: string;
    navBorder: string;
  };
  layout?: {
    containerMaxWidth: string;
    navHeight: number;
    breakpointMobileMax: number;
    breakpointTabletMin: number;
    breakpointTabletMax: number;
    breakpointDesktopMin: number;
  };
  motion?: {
    durationFast: number;
    durationStandard: number;
    durationSlow: number;
    easingStandard: string;
    easingEnter: string;
    easingExit: string;
  };
  buttons?: {
    primaryBackground: string;
    primaryBackgroundHover: string;
    primaryText: string;
    secondaryBackground: string;
    secondaryBackgroundHover: string;
    secondaryText: string;
    secondaryTextHover: string;
    ghostBackground: string;
    ghostBackgroundHover: string;
    ghostText: string;
    navBackground: string;
    navBackgroundHover: string;
    navText: string;
  };
};

type TypographyPresetRecord = {
  id: TypographyPresetId;
  label: string;
  bodyFontFamily: string;
  displayFontFamily: string;
  baseFontSize: number;
  baseLineHeight: number;
  headingLetterSpacing: string;
  sectionLabelLetterSpacing: string;
  textRoles: {
    display: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    h1: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    h2: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    h3: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    body: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    bodySmall: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    label: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    button: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    quote: { fontSize: string; fontWeight: number; lineHeight: number; letterSpacing: string };
    quoteAttribution: {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      letterSpacing: string;
    };
  };
};

type SpacingPresetRecord = {
  id: SpacingPresetId;
  label: string;
  baseUnit: number;
  scale: string[];
  sectionPaddingCompact: string;
  sectionPaddingRegular: string;
  sectionPaddingSpacious: string;
  heroPaddingCompact: string;
  heroPaddingRegular: string;
  heroPaddingSpacious: string;
  mobileSectionPadding: string;
};

type RadiusPresetRecord = {
  id: RadiusPresetId;
  label: string;
  buttonRadius: number;
  cardRadius: number;
  generalRadiusSm: number;
  generalRadiusMd: number;
  generalRadiusLg: number;
  generalRadiusXl: number;
};

export type GovernedThemeSelection = {
  currentFamily?: string | null;
  currentScheme?: string | null;
  currentTypographyPreset?: string | null;
  currentSpacingPreset?: string | null;
  currentRadiusPreset?: string | null;
};

export type ResolvedGovernedTheme = {
  currentFamily: FamilyId;
  currentScheme: SchemeId;
  currentTypographyPreset: TypographyPresetId;
  currentSpacingPreset: SpacingPresetId;
  currentRadiusPreset: RadiusPresetId;
  currentSchemeLabel: string;
  visualSchemeId: SchemeId;
  usedVisualFallback: boolean;
  colors: NonNullable<SchemeRecord['colors']>;
  layout: NonNullable<SchemeRecord['layout']>;
  motion: NonNullable<SchemeRecord['motion']>;
  buttons: NonNullable<SchemeRecord['buttons']>;
  typography: TypographyPresetRecord;
  spacing: SpacingPresetRecord;
  radius: RadiusPresetRecord;
  emailPalette: {
    primary: string;
    muted: string;
    text: string;
    background: string;
    white: string;
    border: string;
    error: string;
  };
};

export const FIXED_CURRENT_FAMILY: FamilyId = 'startup_professional';
export const DEFAULT_CURRENT_SCHEME: SchemeId = 'warm_professional';
export const DEFAULT_TYPOGRAPHY_PRESET: TypographyPresetId = 'tp_editorial_professional';
export const DEFAULT_SPACING_PRESET: SpacingPresetId = 'sp_relaxed';
export const DEFAULT_RADIUS_PRESET: RadiusPresetId = 'rd_soft_controlled';

const TYPOGRAPHY_PRESET_RECORDS: Record<TypographyPresetId, TypographyPresetRecord> = {
  tp_editorial_professional: {
    id: 'tp_editorial_professional',
    label: 'Editorial Professional',
    bodyFontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    displayFontFamily: '"Newsreader", Georgia, serif',
    baseFontSize: 16,
    baseLineHeight: 1.7,
    headingLetterSpacing: '-0.02em',
    sectionLabelLetterSpacing: '0.06em',
    textRoles: {
      display: { fontSize: '3.125rem', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' },
      h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.02em' },
      h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.015em' },
      h3: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
      body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, letterSpacing: '0' },
      bodySmall: {
        fontSize: '0.9375rem',
        fontWeight: 400,
        lineHeight: 1.65,
        letterSpacing: '0',
      },
      label: {
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.06em',
      },
      button: {
        fontSize: '0.9375rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
      },
      quote: {
        fontSize: '1.1875rem',
        fontWeight: 400,
        lineHeight: 1.65,
        letterSpacing: '0',
      },
      quoteAttribution: {
        fontSize: '0.9375rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
    },
  },
};

const SPACING_PRESET_RECORDS: Record<SpacingPresetId, SpacingPresetRecord> = {
  sp_relaxed: {
    id: 'sp_relaxed',
    label: 'Relaxed',
    baseUnit: 8,
    scale: ['8px', '16px', '24px', '32px', '40px', '48px', '56px', '64px'],
    sectionPaddingCompact: '56px 24px',
    sectionPaddingRegular: '80px 24px',
    sectionPaddingSpacious: '112px 24px',
    heroPaddingCompact: '72px 24px 80px',
    heroPaddingRegular: '96px 24px 104px',
    heroPaddingSpacious: '128px 24px 136px',
    mobileSectionPadding: '40px',
  },
};

const RADIUS_PRESET_RECORDS: Record<RadiusPresetId, RadiusPresetRecord> = {
  rd_soft_controlled: {
    id: 'rd_soft_controlled',
    label: 'Soft Controlled',
    buttonRadius: 10,
    cardRadius: 16,
    generalRadiusSm: 8,
    generalRadiusMd: 12,
    generalRadiusLg: 16,
    generalRadiusXl: 24,
  },
};

const WARM_PROFESSIONAL_VISUALS = {
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
    darkBg: '#1E4A59',
    charcoalBg: '#1F2933',
    blackBg: '#111827',
    darkText: '#FFFFFF',
    darkTextMuted: 'rgba(255,255,255,0.72)',
    heroBackground: '#1E4A59',
    heroText: '#FFFFFF',
    heroMutedText: 'rgba(255,255,255,0.72)',
    footerBackground: '#1E4A59',
    footerText: '#FFFFFF',
    footerMutedText: 'rgba(255,255,255,0.6)',
    cookieBackground: '#1E4A59',
    cookieText: '#FFFFFF',
    cookieLink: '#FFFFFF',
    navBackground: 'transparent',
    navScrolledBackground: '#FBF8F2',
    navBorder: '#D8D0C3',
  },
  layout: {
    containerMaxWidth: '1200px',
    navHeight: 72,
    breakpointMobileMax: 767,
    breakpointTabletMin: 768,
    breakpointTabletMax: 1023,
    breakpointDesktopMin: 1024,
  },
  motion: {
    durationFast: 120,
    durationStandard: 180,
    durationSlow: 240,
    easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
    easingEnter: 'cubic-bezier(0, 0, 0, 1)',
    easingExit: 'cubic-bezier(0.4, 0, 1, 1)',
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
} satisfies Pick<
  Required<SchemeRecord>,
  'colors' | 'layout' | 'motion' | 'buttons'
>;

const SCHEME_RECORDS: Record<SchemeId, SchemeRecord> = {
  // The brief named these schemes as approved options but did not include their
  // full visual records in the local workspace. We keep them selectable so the
  // governance model is complete, and fall back to warm_professional visuals
  // until the external Site Configuration Record values are supplied.
  professional_cool: {
    id: 'professional_cool',
    label: 'Professional Cool',
    parentFamily: FIXED_CURRENT_FAMILY,
    status: 'approved',
    allowedTypographyPresets: [DEFAULT_TYPOGRAPHY_PRESET],
    defaultTypographyPreset: DEFAULT_TYPOGRAPHY_PRESET,
    allowedSpacingPresets: [DEFAULT_SPACING_PRESET],
    defaultSpacingPreset: DEFAULT_SPACING_PRESET,
    allowedRadiusPresets: [DEFAULT_RADIUS_PRESET],
    defaultRadiusPreset: DEFAULT_RADIUS_PRESET,
  },
  modern_technical: {
    id: 'modern_technical',
    label: 'Modern Technical',
    parentFamily: FIXED_CURRENT_FAMILY,
    status: 'approved',
    allowedTypographyPresets: [DEFAULT_TYPOGRAPHY_PRESET],
    defaultTypographyPreset: DEFAULT_TYPOGRAPHY_PRESET,
    allowedSpacingPresets: [DEFAULT_SPACING_PRESET],
    defaultSpacingPreset: DEFAULT_SPACING_PRESET,
    allowedRadiusPresets: [DEFAULT_RADIUS_PRESET],
    defaultRadiusPreset: DEFAULT_RADIUS_PRESET,
  },
  warm_professional: {
    id: 'warm_professional',
    label: 'Warm Professional',
    parentFamily: FIXED_CURRENT_FAMILY,
    status: 'approved',
    allowedTypographyPresets: [DEFAULT_TYPOGRAPHY_PRESET],
    defaultTypographyPreset: DEFAULT_TYPOGRAPHY_PRESET,
    allowedSpacingPresets: [DEFAULT_SPACING_PRESET],
    defaultSpacingPreset: DEFAULT_SPACING_PRESET,
    allowedRadiusPresets: [DEFAULT_RADIUS_PRESET],
    defaultRadiusPreset: DEFAULT_RADIUS_PRESET,
    ...WARM_PROFESSIONAL_VISUALS,
  },
};

export const GOVERNED_SCHEME_OPTIONS = [
  { label: 'Professional Cool', value: 'professional_cool' },
  { label: 'Modern Technical', value: 'modern_technical' },
  { label: 'Warm Professional', value: 'warm_professional' },
] as const;

export const GOVERNED_INTERFACE_COLOR_OPTIONS = [
  { label: 'Primary Brand', value: 'primary' },
  { label: 'Primary Hover', value: 'primary-hover' },
  { label: 'Page Background', value: 'background' },
  { label: 'Surface', value: 'surface' },
  { label: 'Alternate Section', value: 'section-alt' },
  { label: 'Body Text', value: 'text' },
  { label: 'Supporting Text', value: 'text-muted' },
  { label: 'Border', value: 'border' },
  { label: 'Link', value: 'link' },
  { label: 'Focus Ring', value: 'focus-ring' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Dark Surface', value: 'dark-bg' },
  { label: 'On Dark Text', value: 'dark-text' },
] as const;

const INTERFACE_COLOR_VALUE_MAP: Record<GovernedInterfaceColorToken, string> = {
  primary: 'var(--ui-color-primary)',
  'primary-hover': 'var(--ui-color-primary-hover)',
  background: 'var(--ui-color-background)',
  surface: 'var(--ui-color-surface)',
  'section-alt': 'var(--ui-color-section-alt)',
  text: 'var(--ui-color-text)',
  'text-muted': 'var(--ui-color-text-muted)',
  border: 'var(--ui-color-border)',
  link: 'var(--ui-color-link)',
  'focus-ring': 'var(--ui-color-focus)',
  success: 'var(--ui-color-success)',
  warning: 'var(--ui-color-warning)',
  error: 'var(--ui-color-error)',
  'dark-bg': 'var(--ui-color-dark-bg)',
  'dark-text': 'var(--ui-color-dark-text)',
};

function isSchemeId(value: unknown): value is SchemeId {
  return typeof value === 'string' && value in SCHEME_RECORDS;
}

function isTypographyPresetId(value: unknown): value is TypographyPresetId {
  return typeof value === 'string' && value in TYPOGRAPHY_PRESET_RECORDS;
}

function isSpacingPresetId(value: unknown): value is SpacingPresetId {
  return typeof value === 'string' && value in SPACING_PRESET_RECORDS;
}

function isRadiusPresetId(value: unknown): value is RadiusPresetId {
  return typeof value === 'string' && value in RADIUS_PRESET_RECORDS;
}

function resolveSchemeId(value: unknown): SchemeId {
  const candidate = isSchemeId(value) ? value : DEFAULT_CURRENT_SCHEME;
  const scheme = SCHEME_RECORDS[candidate];
  if (scheme.parentFamily !== FIXED_CURRENT_FAMILY || scheme.status !== 'approved') {
    return DEFAULT_CURRENT_SCHEME;
  }
  return candidate;
}

function resolveTypographyPreset(
  scheme: SchemeRecord,
  value: unknown,
): TypographyPresetId {
  if (
    isTypographyPresetId(value) &&
    scheme.allowedTypographyPresets.includes(value)
  ) {
    return value;
  }
  return scheme.defaultTypographyPreset;
}

function resolveSpacingPreset(scheme: SchemeRecord, value: unknown): SpacingPresetId {
  if (isSpacingPresetId(value) && scheme.allowedSpacingPresets.includes(value)) {
    return value;
  }
  return scheme.defaultSpacingPreset;
}

function resolveRadiusPreset(scheme: SchemeRecord, value: unknown): RadiusPresetId {
  if (isRadiusPresetId(value) && scheme.allowedRadiusPresets.includes(value)) {
    return value;
  }
  return scheme.defaultRadiusPreset;
}

function resolveVisualScheme(schemeId: SchemeId): {
  visualSchemeId: SchemeId;
  usedVisualFallback: boolean;
  scheme: Required<SchemeRecord>;
} {
  const selected = SCHEME_RECORDS[schemeId];
  if (selected.colors && selected.layout && selected.motion && selected.buttons) {
    return {
      visualSchemeId: schemeId,
      usedVisualFallback: false,
      scheme: selected as Required<SchemeRecord>,
    };
  }

  const fallback = SCHEME_RECORDS[DEFAULT_CURRENT_SCHEME] as Required<SchemeRecord>;
  return {
    visualSchemeId: DEFAULT_CURRENT_SCHEME,
    usedVisualFallback: true,
    scheme: fallback,
  };
}

export function resolveGovernedThemeSelection(
  selection?: GovernedThemeSelection | null,
): ResolvedGovernedTheme {
  const currentScheme = resolveSchemeId(selection?.currentScheme);
  const schemeRecord = SCHEME_RECORDS[currentScheme];
  const currentTypographyPreset = resolveTypographyPreset(
    schemeRecord,
    selection?.currentTypographyPreset,
  );
  const currentSpacingPreset = resolveSpacingPreset(
    schemeRecord,
    selection?.currentSpacingPreset,
  );
  const currentRadiusPreset = resolveRadiusPreset(
    schemeRecord,
    selection?.currentRadiusPreset,
  );

  const visual = resolveVisualScheme(currentScheme);
  const typography = TYPOGRAPHY_PRESET_RECORDS[currentTypographyPreset];
  const spacing = SPACING_PRESET_RECORDS[currentSpacingPreset];
  const radius = RADIUS_PRESET_RECORDS[currentRadiusPreset];

  return {
    currentFamily: FIXED_CURRENT_FAMILY,
    currentScheme,
    currentTypographyPreset,
    currentSpacingPreset,
    currentRadiusPreset,
    currentSchemeLabel: schemeRecord.label,
    visualSchemeId: visual.visualSchemeId,
    usedVisualFallback: visual.usedVisualFallback,
    colors: visual.scheme.colors,
    layout: visual.scheme.layout,
    motion: visual.scheme.motion,
    buttons: visual.scheme.buttons,
    typography,
    spacing,
    radius,
    emailPalette: {
      primary: visual.scheme.colors.primary,
      muted: visual.scheme.colors.textMuted,
      text: visual.scheme.colors.text,
      background: visual.scheme.colors.background,
      white: visual.scheme.colors.surface,
      border: visual.scheme.colors.border,
      error: visual.scheme.colors.error,
    },
  };
}

export function resolveGovernedInterfaceColorValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed in INTERFACE_COLOR_VALUE_MAP) {
    return INTERFACE_COLOR_VALUE_MAP[trimmed as GovernedInterfaceColorToken];
  }

  return normalizeSafeCssColorValue(trimmed);
}

export function getApprovedSchemeOptionsForFamily(
  family: FamilyId = FIXED_CURRENT_FAMILY,
) {
  return GOVERNED_SCHEME_OPTIONS.filter((option) => {
    const scheme = SCHEME_RECORDS[option.value];
    return scheme.parentFamily === family && scheme.status === 'approved';
  });
}
