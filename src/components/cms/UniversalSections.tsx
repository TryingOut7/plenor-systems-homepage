'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { SECTION_RENDERERS } from './sections/registry';
import type { UniversalSectionsProps } from './sections/types';
import {
  HEADING_FONT_SIZE,
  asSectionRecord,
  bodyColor,
  getDarkBackgroundColor,
  getLightBackgroundColor,
  headingColor,
  innerStyle,
  isSectionVisible,
  mutedColor,
  normalizeCustomBackgroundColor,
  normalizeHeadingSize,
  normalizeHeadingTag,
  normalizeSize,
  normalizeTextAlign,
  normalizeTheme,
  resolveColorDarkness,
  sectionPadding,
} from './sections/utils';

export default function UniversalSections({
  sections,
  collections,
  guideFormLabels,
  inquiryFormLabels,
}: UniversalSectionsProps) {
  const [listPages, setListPages] = useState<Record<string, number>>({});

  const renderSection = (
    section: import('@/payload/cms').PageSection,
    index: number,
    keyPrefix = '',
  ): ReactNode => {
    const sectionRecord = asSectionRecord(section);
    const sectionKey = `${keyPrefix}${section.id || index}`;

    if (!isSectionVisible(sectionRecord)) return null;

    const size = normalizeSize(sectionRecord.size);
    const baseTheme = normalizeTheme(sectionRecord.theme);
    const padding = sectionPadding[size];

    const customBackgroundColor = normalizeCustomBackgroundColor(sectionRecord.backgroundColor);
    const customBackgroundIsDark =
      customBackgroundColor !== undefined
        ? resolveColorDarkness(customBackgroundColor)
        : undefined;

    const theme =
      customBackgroundColor && customBackgroundIsDark !== undefined
        ? customBackgroundIsDark
          ? 'navy'
          : 'white'
        : baseTheme;

    const resolvedBackgroundColor =
      customBackgroundColor ??
      (baseTheme === 'white' || baseTheme === 'light'
        ? getLightBackgroundColor(baseTheme)
        : getDarkBackgroundColor(baseTheme));

    const hSize = normalizeHeadingSize(sectionRecord.headingSize);
    const hTag = normalizeHeadingTag(sectionRecord.headingTag);
    const hFontSize = HEADING_FONT_SIZE[hSize];

    const sectionTextAlign = normalizeTextAlign(sectionRecord.textAlign);
    const sectionStyle: CSSProperties = {
      padding,
      backgroundColor: resolvedBackgroundColor,
      ...(sectionTextAlign ? { textAlign: sectionTextAlign } : {}),
    };

    const renderer = SECTION_RENDERERS[section.blockType];
    if (!renderer) return null;

    return renderer({
      section,
      sectionKey,
      sectionStyle,
      size,
      theme,
      resolvedBackgroundColor,
      resolvedHeadingColor: headingColor(theme),
      resolvedBodyColor: bodyColor(theme),
      resolvedMutedColor: mutedColor(theme),
      hSize,
      hTag,
      hFontSize,
      innerStyle,
      collections,
      guideFormLabels,
      inquiryFormLabels,
      listPages,
      setListPages,
      renderNestedSection: renderSection,
    });
  };

  return <>{sections.map((section, index) => renderSection(section, index, `${index}-`))}</>;
}
