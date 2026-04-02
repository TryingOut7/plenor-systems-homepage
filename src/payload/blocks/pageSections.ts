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

export const pageSectionBlocks: Block[] = [
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
  LegacyHeroSection,
  LegacyNarrativeSection,
  LegacyNumberedStageSection,
  LegacyAudienceGridSection,
  LegacyChecklistSection,
  LegacyQuoteSection,
  LegacyCenteredCtaSection,
  SplitSection,
  ReusableSectionReference,
  SpacerSection,
  DividerSection,
];
