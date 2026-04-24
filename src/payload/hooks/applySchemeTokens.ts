/**
 * applySchemeTokens — Payload GlobalBeforeChangeHook for UISettings.
 *
 * Applies governed design token values from the Site Configuration Record
 * when an admin changes the active scheme or any preset selector.
 *
 * Cascade resolution rules (per Handoff Brief §5 / Config Record §1.5):
 *   - Scheme change → all colors, buttons, email palette + full preset cascade
 *   - Spacing preset change → only spacing layout values updated
 *   - Typography preset change → only typography values updated
 *   - Radius preset change → button radius + card radius updated
 *   - No scheme/preset change → all manual overrides preserved unchanged
 */

import type { GlobalBeforeChangeHook } from 'payload'
import {
  SCHEMES,
  TYPOGRAPHY_PRESETS,
  SPACING_PRESETS,
  RADIUS_PRESETS,
} from '../data/designTokens.ts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolvePresetKey(
  requested: string | undefined | null,
  allowedKeys: readonly string[],
  defaultKey: string,
): string {
  if (requested && (allowedKeys as string[]).includes(requested)) {
    return requested
  }
  return defaultKey
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const applySchemeTokensHook: GlobalBeforeChangeHook = async ({ data, originalDoc }) => {
  const schemeKey = data.currentScheme as string | undefined
  if (!schemeKey) return data

  const scheme = SCHEMES[schemeKey as keyof typeof SCHEMES]
  if (!scheme) return data

  const prevSchemeKey = originalDoc?.currentScheme as string | undefined
  const schemeChanged = schemeKey !== prevSchemeKey

  // ── Cascade resolve presets ──────────────────────────────────────────────
  // On scheme change, current preset keys may no longer be in the allowed set.
  // If so, replace with the new scheme's default for that dimension.
  const resolvedTypoKey = resolvePresetKey(
    schemeChanged ? null : (data.currentTypographyPreset as string | undefined),
    scheme.allowedTypographyPresets,
    scheme.defaultTypographyPreset,
  )
  const resolvedSpacingKey = resolvePresetKey(
    schemeChanged ? null : (data.currentSpacingPreset as string | undefined),
    scheme.allowedSpacingPresets,
    scheme.defaultSpacingPreset,
  )
  const resolvedRadiusKey = resolvePresetKey(
    schemeChanged ? null : (data.currentRadiusPreset as string | undefined),
    scheme.allowedRadiusPresets,
    scheme.defaultRadiusPreset,
  )

  // Write resolved keys back so CMS reflects the cascade outcome
  data.currentTypographyPreset = resolvedTypoKey
  data.currentSpacingPreset = resolvedSpacingKey
  data.currentRadiusPreset = resolvedRadiusKey

  const typo = TYPOGRAPHY_PRESETS[resolvedTypoKey as keyof typeof TYPOGRAPHY_PRESETS]
  const spacing = SPACING_PRESETS[resolvedSpacingKey as keyof typeof SPACING_PRESETS]
  const radius = RADIUS_PRESETS[resolvedRadiusKey as keyof typeof RADIUS_PRESETS]

  const prevTypoKey = originalDoc?.currentTypographyPreset as string | undefined
  const prevSpacingKey = originalDoc?.currentSpacingPreset as string | undefined
  const prevRadiusKey = originalDoc?.currentRadiusPreset as string | undefined

  const typoChanged = resolvedTypoKey !== prevTypoKey
  const spacingChanged = resolvedSpacingKey !== prevSpacingKey
  const radiusChanged = resolvedRadiusKey !== prevRadiusKey

  // ── Apply scheme colors + buttons + email palette on scheme change ────────
  if (schemeChanged) {
    data.colors = {
      ...((data.colors as Record<string, unknown>) ?? {}),
      primary: scheme.colors.primary,
      primaryHover: scheme.colors.primaryHover,
      background: scheme.colors.background,
      surface: scheme.colors.surface,
      sectionAlt: scheme.colors.sectionAlt,
      text: scheme.colors.text,
      textMuted: scheme.colors.textMuted,
      border: scheme.colors.border,
      link: scheme.colors.link,
      focusRing: scheme.colors.focusRing,
      // Dark-surface aliases derived from primary
      navyBackground: scheme.colors.primary,
      heroBackground: scheme.colors.primary,
      footerBackground: scheme.colors.primary,
      cookieBackground: scheme.colors.primary,
      navBorder: scheme.colors.border,
    }

    data.buttons = {
      ...((data.buttons as Record<string, unknown>) ?? {}),
      primaryBackground: scheme.buttons.primaryBackground,
      primaryBackgroundHover: scheme.buttons.primaryBackgroundHover,
      primaryText: scheme.buttons.primaryText,
      secondaryBackground: scheme.buttons.secondaryBackground,
      secondaryBackgroundHover: scheme.buttons.secondaryBackgroundHover,
      secondaryText: scheme.buttons.secondaryText,
      secondaryTextHover: scheme.buttons.secondaryTextHover,
      ghostBackground: scheme.buttons.ghostBackground,
      ghostBackgroundHover: scheme.buttons.ghostBackgroundHover,
      ghostText: scheme.buttons.ghostText,
      navBackground: scheme.buttons.navBackground,
      navBackgroundHover: scheme.buttons.navBackgroundHover,
      navText: scheme.buttons.navText,
    }

    data.emailPalette = {
      ...((data.emailPalette as Record<string, unknown>) ?? {}),
      primary: scheme.emailPalette.primary,
      muted: scheme.emailPalette.muted,
      text: scheme.emailPalette.text,
      background: scheme.emailPalette.background,
      white: scheme.emailPalette.white,
      border: scheme.emailPalette.border,
      error: scheme.emailPalette.error,
    }

    // Scheme-level layout (container width + nav height)
    data.layout = {
      ...((data.layout as Record<string, unknown>) ?? {}),
      containerMaxWidth: scheme.layout.containerMaxWidth,
      navHeight: scheme.layout.navHeight,
    }
  }

  // ── Apply spacing preset on spacing or scheme change ─────────────────────
  if (schemeChanged || spacingChanged) {
    data.layout = {
      ...((data.layout as Record<string, unknown>) ?? {}),
      sectionPaddingCompact: `${spacing.sectionPaddingCompact}px 24px`,
      sectionPaddingRegular: `${spacing.sectionPaddingRegular}px 24px`,
      sectionPaddingSpacious: `${spacing.sectionPaddingSpacious}px 24px`,
      heroPaddingCompact: `${spacing.heroPaddingCompact}px 24px ${spacing.heroPaddingCompact + 8}px`,
      heroPaddingRegular: `${spacing.heroPaddingRegular}px 24px ${spacing.heroPaddingRegular + 8}px`,
      heroPaddingSpacious: `${spacing.heroPaddingSpacious}px 24px ${spacing.heroPaddingSpacious + 8}px`,
      mobileSectionPadding: spacing.mobileSectionPadding,
    }
  }

  // ── Apply typography preset on typo or scheme change ─────────────────────
  if (schemeChanged || typoChanged) {
    data.typography = {
      ...((data.typography as Record<string, unknown>) ?? {}),
      bodyFontFamily: typo.bodyFontFamily,
      displayFontFamily: typo.displayFontFamily,
      baseLineHeight: typo.bodyLineHeight,
      headingLetterSpacing: '-0.02em',
      sectionLabelLetterSpacing: typo.labelLetterSpacing,
    }
  }

  // ── Apply radius preset on radius or scheme change ────────────────────────
  if (schemeChanged || radiusChanged) {
    data.layout = {
      ...((data.layout as Record<string, unknown>) ?? {}),
      cardRadius: radius.cardRadius,
    }
    data.buttons = {
      ...((data.buttons as Record<string, unknown>) ?? {}),
      radius: radius.buttonRadius,
    }
  }

  return data
}
