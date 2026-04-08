import type { SectionRenderer } from './types';
import ComparisonTableSection from './ComparisonTableSection';
import CtaSection from './CtaSection';
import DividerSection from './DividerSection';
import DynamicListSection from './DynamicListSection';
import FaqSection from './FaqSection';
import FeatureGridSection from './FeatureGridSection';
import FormSection from './FormSection';
import HeroSection from './HeroSection';
import ImageSection from './ImageSection';
import LogoBandSection from './LogoBandSection';
import OrgAboutDetailSection from './OrgAboutDetailSection';
import OrgEventDetailSection from './OrgEventDetailSection';
import OrgEventRegistrationSection from './OrgEventRegistrationSection';
import OrgFeedSection from './OrgFeedSection';
import OrgLearningDetailSection from './OrgLearningDetailSection';
import OrgSpotlightDetailSection from './OrgSpotlightDetailSection';
import OrgSponsorsSection from './OrgSponsorsSection';
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
  privacyNoteSection: PrivacyNoteSection,
  imageSection: ImageSection,
  videoSection: VideoSection,
  simpleTableSection: SimpleTableSection,
  comparisonTableSection: ComparisonTableSection,
  dynamicListSection: DynamicListSection,
  orgFeedSection: OrgFeedSection,
  orgEventDetailSection: OrgEventDetailSection,
  orgEventRegistrationSection: OrgEventRegistrationSection,
  orgSpotlightDetailSection: OrgSpotlightDetailSection,
  orgLearningDetailSection: OrgLearningDetailSection,
  orgAboutDetailSection: OrgAboutDetailSection,
  orgSponsorsSection: OrgSponsorsSection,
  splitSection: SplitSection,
  reusableSectionReference: ReusableSectionReference,
  spacerSection: SpacerSection,
  dividerSection: DividerSection,
};
