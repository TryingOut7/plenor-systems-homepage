import type { UISettings } from '@/payload/cms';
import { normalizeSafeCssValue } from '@/lib/safeCss';

export function buildUIVariableStyles(uiSettings: UISettings | null): Record<string, string> {
  const variables: Record<string, string> = {};

  const setVar = (name: string, value: unknown) => {
    const normalized = normalizeSafeCssValue(value);
    if (!normalized) return;
    variables[name] = normalized;
  };

  const setPixelVar = (name: string, value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    variables[name] = `${value}px`;
  };

  const setNumericVar = (name: string, value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    variables[name] = String(value);
  };

  const colors = uiSettings?.colors;
  setVar('--ui-color-primary', colors?.primary);
  setVar('--ui-color-primary-hover', colors?.primaryHover);
  setVar('--ui-color-background', colors?.background);
  setVar('--ui-color-surface', colors?.surface);
  setVar('--ui-color-section-alt', colors?.sectionAlt);
  setVar('--ui-color-text', colors?.text);
  setVar('--ui-color-text-muted', colors?.textMuted);
  setVar('--ui-color-border', colors?.border);
  setVar('--ui-color-link', colors?.link);
  setVar('--ui-color-focus', colors?.focusRing);
  setVar('--ui-color-dark-bg', colors?.navyBackground);
  setVar('--ui-color-charcoal-bg', colors?.charcoalBackground);
  setVar('--ui-color-black-bg', colors?.blackBackground);
  setVar('--ui-color-dark-text', colors?.darkText);
  setVar('--ui-color-dark-text-muted', colors?.darkTextMuted);
  setVar('--ui-color-hero-bg', colors?.heroBackground);
  setVar('--ui-color-hero-text', colors?.heroText);
  setVar('--ui-color-hero-muted', colors?.heroMutedText);
  setVar('--ui-color-footer-bg', colors?.footerBackground);
  setVar('--ui-color-footer-text', colors?.footerText);
  setVar('--ui-color-footer-muted', colors?.footerMutedText);
  setVar('--ui-color-cookie-bg', colors?.cookieBackground);
  setVar('--ui-color-cookie-text', colors?.cookieText);
  setVar('--ui-color-cookie-link', colors?.cookieLink);
  setVar('--ui-nav-background', colors?.navBackground);
  setVar('--ui-nav-scrolled-background', colors?.navScrolledBackground);
  setVar('--ui-nav-border', colors?.navBorder);

  const typography = uiSettings?.typography;
  setVar('--ui-font-body', typography?.bodyFontFamily);
  setVar('--ui-font-display', typography?.bodyFontFamily ?? typography?.displayFontFamily);
  setPixelVar('--ui-font-size-base', typography?.baseFontSize);
  setNumericVar('--ui-line-height-base', typography?.baseLineHeight);
  setVar('--ui-heading-letter-spacing', typography?.headingLetterSpacing);
  setVar('--ui-section-label-letter-spacing', typography?.sectionLabelLetterSpacing);

  const layout = uiSettings?.layout;
  setPixelVar('--ui-nav-height', layout?.navHeight);
  setVar('--ui-layout-container-max-width', layout?.containerMaxWidth);
  setVar('--ui-spacing-section-compact', layout?.sectionPaddingCompact);
  setVar('--ui-spacing-section-regular', layout?.sectionPaddingRegular);
  setVar('--ui-spacing-section-spacious', layout?.sectionPaddingSpacious);
  setVar('--ui-spacing-hero-compact', layout?.heroPaddingCompact);
  setVar('--ui-spacing-hero-regular', layout?.heroPaddingRegular);
  setVar('--ui-spacing-hero-spacious', layout?.heroPaddingSpacious);
  setVar('--ui-spacing-mobile-section', layout?.mobileSectionPadding);

  const buttons = uiSettings?.buttons;
  setPixelVar('--ui-button-radius', buttons?.radius);
  setVar('--ui-button-primary-bg', buttons?.primaryBackground);
  setVar('--ui-button-primary-bg-hover', buttons?.primaryBackgroundHover);
  setVar('--ui-button-primary-text', buttons?.primaryText);
  setVar('--ui-button-secondary-bg', buttons?.secondaryBackground);
  setVar('--ui-button-secondary-bg-hover', buttons?.secondaryBackgroundHover);
  setVar('--ui-button-secondary-text', buttons?.secondaryText);
  setVar('--ui-button-secondary-text-hover', buttons?.secondaryTextHover);
  setVar('--ui-button-ghost-bg', buttons?.ghostBackground);
  setVar('--ui-button-ghost-bg-hover', buttons?.ghostBackgroundHover);
  setVar('--ui-button-ghost-text', buttons?.ghostText);
  setVar('--ui-button-nav-bg', buttons?.navBackground);
  setVar('--ui-button-nav-bg-hover', buttons?.navBackgroundHover);
  setVar('--ui-button-nav-text', buttons?.navText);
  setPixelVar('--ui-card-radius', layout?.cardRadius);

  return variables;
}

export default function UIStyleInjector({ uiSettings }: { uiSettings: UISettings | null }) {
  const variables = buildUIVariableStyles(uiSettings);
  const entries = Object.entries(variables);
  if (entries.length === 0) return null;
  const css = `:root {\n${entries.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
  return <style>{css}</style>;
}
