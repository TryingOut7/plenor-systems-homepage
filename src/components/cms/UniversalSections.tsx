import { type CSSProperties, type ReactNode } from 'react';
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
  const MAX_NEST_DEPTH = 5;

  const warnSkippedSection = (
    reason: 'max-depth' | 'cycle',
    sectionKey: string,
    metadata: Record<string, unknown> = {},
  ) => {
    if (process.env.NODE_ENV === 'production') return;
    console.warn('[UniversalSections] Skipping nested section render.', {
      reason,
      sectionKey,
      maxDepth: MAX_NEST_DEPTH,
      ...metadata,
    });
  };

  const makeRenderSection = (
    visited: ReadonlySet<string>,
    depth: number,
  ): ((section: import('@/payload/cms').PageSection, index: number, keyPrefix?: string) => ReactNode) => {
    function renderSectionNode(section: import('@/payload/cms').PageSection, index: number, keyPrefix = ''): ReactNode {
      const sectionId = section.id ? String(section.id) : '';
      const sectionKey = `${keyPrefix}${sectionId || index}`;
      if (depth >= MAX_NEST_DEPTH) {
        warnSkippedSection('max-depth', sectionKey, { depth });
        return null;
      }

      if (sectionId && visited.has(sectionId)) {
        warnSkippedSection('cycle', sectionKey, { sectionId });
        return null;
      }

      const sectionRecord = asSectionRecord(section);

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
      if (!renderer) {
        if (process.env.NODE_ENV !== 'production') {
          return (
            <div
              key={sectionKey}
              style={{
                margin: '16px auto',
                maxWidth: '760px',
                padding: '16px',
                border: '2px dashed #f59e0b',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              <strong>[UniversalSections]</strong> Unknown blockType: &quot;{section.blockType}&quot;
              {sectionId ? ` (id: ${sectionId})` : ''} — add it to{' '}
              <code>src/components/cms/sections/registry.ts</code>.
            </div>
          );
        }
        return null;
      }

      const nextVisited = sectionId ? new Set([...visited, sectionId]) : visited;
      const renderNestedSection = makeRenderSection(nextVisited, depth + 1);

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
        renderNestedSection,
      });
    }
    return renderSectionNode;
  };

  const renderSection = makeRenderSection(new Set(), 0);

  return <>{sections.map((section, index) => renderSection(section, index, `${index}-`))}</>;
}
