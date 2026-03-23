import type { SectionRenderer } from './types';
import ComparisonTableSection from './ComparisonTableSection';
import CtaSection from './CtaSection';
import DividerSection from './DividerSection';
import DynamicListSection from './DynamicListSection';
import FaqSection from './FaqSection';
import FeatureGridSection from './FeatureGridSection';
import FormSection from './FormSection';
import GuideFormSection from './GuideFormSection';
import HeroSection from './HeroSection';
import ImageSection from './ImageSection';
import InquiryFormSection from './InquiryFormSection';
import LegacyAudienceGridSection from './LegacyAudienceGridSection';
import LegacyCenteredCtaSection from './LegacyCenteredCtaSection';
import LegacyChecklistSection from './LegacyChecklistSection';
import LegacyHeroSection from './LegacyHeroSection';
import LegacyNarrativeSection from './LegacyNarrativeSection';
import LegacyNumberedStageSection from './LegacyNumberedStageSection';
import LegacyQuoteSection from './LegacyQuoteSection';
import LogoBandSection from './LogoBandSection';
import PrivacyNoteSection from './PrivacyNoteSection';
import QuoteSection from './QuoteSection';
import ReusableSectionReference from './ReusableSectionReference';
import RichTextSection from './RichTextSection';
import SimpleTableSection from './SimpleTableSection';
import SpacerSection from './SpacerSection';
import SplitSection from './SplitSection';
import StatsSection from './StatsSection';
import TabsSection from './TabsSection';
import TeamSection from './TeamSection';
import VideoSection from './VideoSection';

export const SECTION_RENDERERS: Record<string, SectionRenderer> = {
  heroSection: HeroSection,
  richTextSection: RichTextSection,
  ctaSection: CtaSection,
  statsSection: StatsSection,
  faqSection: FaqSection,
  featureGridSection: FeatureGridSection,
  formSection: FormSection,
  teamSection: TeamSection,
  logoBandSection: LogoBandSection,
  quoteSection: QuoteSection,
  tabsSection: TabsSection,
  guideFormSection: GuideFormSection,
  inquiryFormSection: InquiryFormSection,
  privacyNoteSection: PrivacyNoteSection,
  imageSection: ImageSection,
  videoSection: VideoSection,
  simpleTableSection: SimpleTableSection,
  comparisonTableSection: ComparisonTableSection,
  dynamicListSection: DynamicListSection,
  legacyHeroSection: LegacyHeroSection,
  legacyNarrativeSection: LegacyNarrativeSection,
  legacyNumberedStageSection: LegacyNumberedStageSection,
  legacyAudienceGridSection: LegacyAudienceGridSection,
  legacyChecklistSection: LegacyChecklistSection,
  legacyQuoteSection: LegacyQuoteSection,
  legacyCenteredCtaSection: LegacyCenteredCtaSection,
  splitSection: SplitSection,
  reusableSectionReference: ReusableSectionReference,
  spacerSection: SpacerSection,
  dividerSection: DividerSection,
};
