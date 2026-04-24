export type SectionUiMeta = {
  singular: string;
  plural: string;
  group: 'Text' | 'Media' | 'Forms' | 'Data' | 'Layout';
  color: string;
  icon: string;
};

export const MODERN_SECTION_UI: Record<string, SectionUiMeta> = {
  heroSection: { singular: 'Hero Banner', plural: 'Hero Banners', group: 'Text', color: '#1D4ED8', icon: 'H' },
  richTextSection: { singular: 'Text Block', plural: 'Text Blocks', group: 'Text', color: '#0F766E', icon: 'T' },
  ctaSection: { singular: 'Call To Action', plural: 'Call To Action Blocks', group: 'Text', color: '#B45309', icon: 'C' },
  statsSection: { singular: 'Stats', plural: 'Stats Blocks', group: 'Data', color: '#7C3AED', icon: 'S' },
  faqSection: { singular: 'FAQ', plural: 'FAQ Blocks', group: 'Text', color: '#0E7490', icon: 'Q' },
  featureGridSection: { singular: 'Feature Cards', plural: 'Feature Card Grids', group: 'Data', color: '#4338CA', icon: 'F' },
  formSection: { singular: 'Form Embed', plural: 'Form Embeds', group: 'Forms', color: '#BE185D', icon: 'F' },
  teamSection: { singular: 'Team Profiles', plural: 'Team Profile Blocks', group: 'Media', color: '#0369A1', icon: 'P' },
  logoBandSection: { singular: 'Logo Strip', plural: 'Logo Strips', group: 'Media', color: '#334155', icon: 'L' },
  quoteSection: { singular: 'Quote', plural: 'Quote Blocks', group: 'Text', color: '#475569', icon: '"' },
  tabsSection: { singular: 'Tabbed Content', plural: 'Tabbed Content Blocks', group: 'Layout', color: '#1E40AF', icon: 'T' },
  privacyNoteSection: { singular: 'Privacy Note', plural: 'Privacy Notes', group: 'Forms', color: '#0F766E', icon: 'P' },
  imageSection: { singular: 'Image Gallery', plural: 'Image Galleries', group: 'Media', color: '#0284C7', icon: 'I' },
  videoSection: { singular: 'Video', plural: 'Video Blocks', group: 'Media', color: '#DC2626', icon: 'V' },
  simpleTableSection: { singular: 'Basic Table', plural: 'Basic Tables', group: 'Data', color: '#4F46E5', icon: 'T' },
  comparisonTableSection: { singular: 'Comparison Table', plural: 'Comparison Tables', group: 'Data', color: '#6D28D9', icon: 'C' },
  dynamicListSection: { singular: 'Auto List', plural: 'Auto Lists', group: 'Data', color: '#7C2D12', icon: 'A' },

  orgAboutDetailSection: { singular: 'About Profile', plural: 'About Profiles', group: 'Data', color: '#4338CA', icon: 'A' },
  orgSponsorsSection: { singular: 'Sponsors Page', plural: 'Sponsors Pages', group: 'Data', color: '#BE185D', icon: '$' },
  splitSection: { singular: 'Two Column Content', plural: 'Two Column Content Blocks', group: 'Layout', color: '#1E3A8A', icon: '2' },
  reusableSectionReference: { singular: 'Section Library Embed', plural: 'Section Library Embeds', group: 'Layout', color: '#0F172A', icon: 'R' },
  spacerSection: { singular: 'Spacer', plural: 'Spacers', group: 'Layout', color: '#6B7280', icon: '+' },
  dividerSection: { singular: 'Divider', plural: 'Dividers', group: 'Layout', color: '#64748B', icon: '-' },
};

export function getSectionSingularLabel(blockType?: string, fallback = 'Section'): string {
  if (!blockType) return fallback;
  return MODERN_SECTION_UI[blockType]?.singular || fallback;
}
