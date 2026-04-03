import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';
import type { CollectionData, PageSection } from '@/payload/cms';

export type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
export type SectionSize = 'compact' | 'regular' | 'spacious';
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4';

export type GuideFormLabels = {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footerText?: string;
  privacyLabel?: string;
  privacyHref?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
};

export type InquiryFormLabels = {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  consentText?: string;
  privacyLabel?: string;
  privacyHref?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  companyPlaceholder?: string;
  challengePlaceholder?: string;
};

export interface UniversalSectionsProps {
  sections: PageSection[];
  collections: CollectionData;
  guideFormLabels?: GuideFormLabels;
  inquiryFormLabels?: InquiryFormLabels;
}

export type SectionRecord = PageSection & Record<string, unknown>;

export interface SectionRendererProps {
  section: PageSection;
  sectionKey: string;
  sectionStyle: CSSProperties;
  size: SectionSize;
  theme: SectionTheme;
  resolvedBackgroundColor: string;
  resolvedHeadingColor: string;
  resolvedBodyColor: string;
  resolvedMutedColor: string;
  hSize: HeadingSize;
  hTag: HeadingTag;
  hFontSize: string;
  innerStyle: CSSProperties;
  collections: CollectionData;
  guideFormLabels?: GuideFormLabels;
  inquiryFormLabels?: InquiryFormLabels;
  listPages: Record<string, number>;
  setListPages: Dispatch<SetStateAction<Record<string, number>>>;
  renderNestedSection: (section: PageSection, index: number, keyPrefix?: string) => ReactNode;
}

export type SectionRenderer = (props: SectionRendererProps) => ReactNode;
