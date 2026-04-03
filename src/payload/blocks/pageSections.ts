import type { Block } from 'payload';
import { HeroSection } from './sections/HeroSection.ts';
import { RichTextSection } from './sections/RichTextSection.ts';
import { CtaSection } from './sections/CtaSection.ts';
import { StatsSection } from './sections/StatsSection.ts';
import { FaqSection } from './sections/FaqSection.ts';
import { FeatureGridSection } from './sections/FeatureGridSection.ts';
import { FormSection } from './sections/FormSection.ts';
import { TeamSection } from './sections/TeamSection.ts';
import { LogoBandSection } from './sections/LogoBandSection.ts';
import { QuoteSection } from './sections/QuoteSection.ts';
import { TabsSection } from './sections/TabsSection.ts';
import { GuideFormSection } from './sections/GuideFormSection.ts';
import { InquiryFormSection } from './sections/InquiryFormSection.ts';
import { PrivacyNoteSection } from './sections/PrivacyNoteSection.ts';
import { ImageSection } from './sections/ImageSection.ts';
import { VideoSection } from './sections/VideoSection.ts';
import { SimpleTableSection } from './sections/SimpleTableSection.ts';
import { ComparisonTableSection } from './sections/ComparisonTableSection.ts';
import { DynamicListSection } from './sections/DynamicListSection.ts';
import { LegacyHeroSection } from './sections/LegacyHeroSection.ts';
import { LegacyNarrativeSection } from './sections/LegacyNarrativeSection.ts';
import { LegacyNumberedStageSection } from './sections/LegacyNumberedStageSection.ts';
import { LegacyAudienceGridSection } from './sections/LegacyAudienceGridSection.ts';
import { LegacyChecklistSection } from './sections/LegacyChecklistSection.ts';
import { LegacyQuoteSection } from './sections/LegacyQuoteSection.ts';
import { LegacyCenteredCtaSection } from './sections/LegacyCenteredCtaSection.ts';
import { SplitSection } from './sections/SplitSection.ts';
import { ReusableSectionReference } from './sections/ReusableSectionReference.ts';
import { SpacerSection } from './sections/SpacerSection.ts';
import { DividerSection } from './sections/DividerSection.ts';
import { MODERN_SECTION_UI, type SectionUiMeta } from './sectionUiMeta.ts';

function buildBlockPreviewDataUrl(meta: SectionUiMeta): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="#F8FAFC"/><rect x="18" y="18" width="444" height="284" rx="18" fill="white" stroke="#E2E8F0"/><rect x="34" y="36" width="70" height="70" rx="12" fill="${meta.color}"/><text x="69" y="82" text-anchor="middle" fill="white" font-size="34" font-family="Arial, sans-serif">${meta.icon}</text><text x="124" y="70" fill="#0F172A" font-size="26" font-weight="700" font-family="Arial, sans-serif">${meta.singular}</text><text x="124" y="102" fill="#475569" font-size="18" font-family="Arial, sans-serif">${meta.group}</text><rect x="34" y="130" width="412" height="14" rx="7" fill="#E2E8F0"/><rect x="34" y="154" width="372" height="14" rx="7" fill="#E2E8F0"/><rect x="34" y="190" width="132" height="36" rx="10" fill="${meta.color}" opacity="0.18"/><rect x="34" y="238" width="412" height="46" rx="10" fill="#F1F5F9"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function withModernEditorMetadata(block: Block): Block {
  const meta = MODERN_SECTION_UI[block.slug];
  if (!meta) return block;

  const preview = buildBlockPreviewDataUrl(meta);
  return {
    ...block,
    labels: {
      singular: meta.singular,
      plural: meta.plural,
    },
    admin: {
      ...(block.admin || {}),
      group: meta.group,
      components: {
        ...(block.admin?.components || {}),
        Label: '@/payload/admin/components/SectionBlockRowLabel',
      },
      images: {
        ...(block.admin?.images || {}),
        icon: preview,
        thumbnail: preview,
      },
    },
  };
}

function withLegacyEditorMetadata(block: Block): Block {
  const admin = {
    ...(block.admin || {}),
    group: 'Legacy (Migration Only)',
    hidden: true,
  } as Block['admin'] & { hidden?: boolean };

  return {
    ...block,
    admin,
  };
}

export const modernPageSectionBlocks: Block[] = [
  HeroSection,
  RichTextSection,
  CtaSection,
  StatsSection,
  FaqSection,
  FeatureGridSection,
  FormSection,
  TeamSection,
  LogoBandSection,
  QuoteSection,
  TabsSection,
  GuideFormSection,
  InquiryFormSection,
  PrivacyNoteSection,
  ImageSection,
  VideoSection,
  SimpleTableSection,
  ComparisonTableSection,
  DynamicListSection,
  SplitSection,
  ReusableSectionReference,
  SpacerSection,
  DividerSection,
].map(withModernEditorMetadata);

export const legacyPageSectionBlocks: Block[] = [
  LegacyHeroSection,
  LegacyNarrativeSection,
  LegacyNumberedStageSection,
  LegacyAudienceGridSection,
  LegacyChecklistSection,
  LegacyQuoteSection,
  LegacyCenteredCtaSection,
].map(withLegacyEditorMetadata);

export const pageSectionBlocks: Block[] = [
  ...modernPageSectionBlocks,
  ...legacyPageSectionBlocks,
];

export const modernPageSectionBlockSlugs = modernPageSectionBlocks.map((block) => block.slug);
