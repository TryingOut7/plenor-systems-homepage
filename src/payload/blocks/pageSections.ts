import type { Block } from 'payload';
import { sectionCommonFields } from '../fields/sectionCommon';

const HeroSection: Block = {
  slug: 'heroSection',
  dbName: 'hero',
  labels: { singular: 'Hero Section', plural: 'Hero Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text' },
    { name: 'primaryCtaHref', type: 'text' },
    { name: 'secondaryCtaLabel', type: 'text' },
    { name: 'secondaryCtaHref', type: 'text' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'backgroundVideo', type: 'text', admin: { description: 'Video URL (mp4) for background video' } },
    {
      name: 'textAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { name: 'minHeight', type: 'number', admin: { description: 'Minimum hero height in pixels (e.g. 600)' } },
  ],
};

const RichTextSection: Block = {
  slug: 'richTextSection',
  dbName: 'richtext',
  labels: { singular: 'Rich Text Section', plural: 'Rich Text Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
  ],
};

const CtaSection: Block = {
  slug: 'ctaSection',
  dbName: 'cta',
  labels: { singular: 'CTA Section', plural: 'CTA Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
  ],
};

const GuideFormSection: Block = {
  slug: 'guideFormSection',
  dbName: 'guide_form',
  labels: { singular: 'Guide Form Section', plural: 'Guide Form Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text', defaultValue: 'Free resource' },
    { name: 'heading', type: 'text', defaultValue: 'Get the free guide' },
    {
      name: 'highlightText',
      type: 'textarea',
      defaultValue: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
    },
    {
      name: 'body',
      type: 'textarea',
      defaultValue:
        'The guide covers common mistakes teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.',
    },
  ],
};

const InquiryFormSection: Block = {
  slug: 'inquiryFormSection',
  dbName: 'inquiry_form',
  labels: { singular: 'Inquiry Form Section', plural: 'Inquiry Form Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text', defaultValue: 'Send an inquiry' },
    { name: 'heading', type: 'text', defaultValue: 'Send a direct inquiry' },
    {
      name: 'subtext',
      type: 'textarea',
      defaultValue:
        'Tell us about your product, your team, and the challenge you are working through.',
    },
    { name: 'nextStepsLabel', type: 'text', defaultValue: 'What happens next' },
    {
      name: 'nextStepsBody',
      type: 'textarea',
      defaultValue:
        'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
    },
    { name: 'directEmailLabel', type: 'text', defaultValue: 'Prefer email directly?' },
    { name: 'emailAddress', type: 'email', defaultValue: 'hello@plenor.ai' },
    { name: 'linkedinLabel', type: 'text', defaultValue: 'Connect on LinkedIn' },
    {
      name: 'linkedinHref',
      type: 'text',
      defaultValue: 'https://www.linkedin.com/company/plenor-ai',
    },
  ],
};

const PrivacyNoteSection: Block = {
  slug: 'privacyNoteSection',
  dbName: 'privacy_note',
  labels: { singular: 'Privacy Note Section', plural: 'Privacy Note Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text', defaultValue: 'By submitting this form, you agree to our' },
    { name: 'policyLinkLabel', type: 'text', defaultValue: 'Privacy Policy' },
    { name: 'policyLinkHref', type: 'text', defaultValue: '/privacy' },
  ],
};

const ImageSection: Block = {
  slug: 'imageSection',
  dbName: 'img_sec',
  labels: { singular: 'Image Section', plural: 'Image Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'displayMode',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Slideshow', value: 'slideshow' },
      ],
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Square (1:1)', value: 'square' },
        { label: 'Landscape (16:9)', value: 'landscape' },
        { label: 'Portrait (3:4)', value: 'portrait' },
      ],
    },
    { name: 'gridColumns', type: 'number', defaultValue: 3, min: 1, max: 6, admin: { description: 'Number of columns in grid mode' } },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'altOverride', type: 'text', admin: { description: 'Override the image alt text' } },
        { name: 'caption', type: 'text', admin: { description: 'Caption shown below this image' } },
        { name: 'linkHref', type: 'text', admin: { description: 'Make image clickable with this URL' } },
      ],
    },
    { name: 'caption', type: 'text', admin: { description: 'Section-level caption below all images' } },
  ],
};

const VideoSection: Block = {
  slug: 'videoSection',
  dbName: 'vid_sec',
  labels: { singular: 'Video Section', plural: 'Video Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'embedUrl',
      type: 'text',
      admin: { description: 'YouTube or Vimeo embed URL' },
    },
    {
      name: 'posterImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};

const SimpleTableSection: Block = {
  slug: 'simpleTableSection',
  dbName: 'simple_table',
  labels: { singular: 'Simple Table', plural: 'Simple Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'columns',
      type: 'array',
      dbName: 'stbl_cols',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      dbName: 'stbl_rows',
      fields: [
        {
          name: 'cells',
          type: 'array',
          dbName: 'stbl_cells',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};

const ComparisonTableSection: Block = {
  slug: 'comparisonTableSection',
  dbName: 'cmp_table',
  labels: { singular: 'Comparison Table', plural: 'Comparison Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'planColumns',
      type: 'array',
      dbName: 'cmp_plan_cols',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'features',
      type: 'array',
      dbName: 'cmp_features',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'values',
          type: 'array',
          dbName: 'cmp_feat_vals',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};

const DynamicListSection: Block = {
  slug: 'dynamicListSection',
  dbName: 'dyn_list',
  labels: { singular: 'Dynamic List', plural: 'Dynamic Lists' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'source',
      type: 'select',
      dbName: 'dl_source',
      required: true,
      options: [
        { label: 'Services', value: 'serviceItem' },
        { label: 'Blog Posts', value: 'blogPost' },
        { label: 'Testimonials', value: 'testimonial' },
      ],
    },
    {
      name: 'viewMode',
      type: 'select',
      dbName: 'dl_view_mode',
      defaultValue: 'cards',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'List', value: 'list' },
        { label: 'Table', value: 'table' },
      ],
    },
    { name: 'filterField', type: 'text' },
    { name: 'filterValue', type: 'text' },
    { name: 'sortField', type: 'text', defaultValue: 'publishedAt' },
    {
      name: 'sortDirection',
      type: 'select',
      dbName: 'dl_sort_dir',
      defaultValue: 'desc',
      options: [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
      ],
    },
    { name: 'limit', type: 'number', defaultValue: 6 },
    { name: 'enablePagination', type: 'checkbox', defaultValue: true },
  ],
};

const LegacyHeroSection: Block = {
  slug: 'legacyHeroSection',
  dbName: 'legacy_hero',
  labels: { singular: 'Legacy Hero', plural: 'Legacy Heroes' },
  fields: [
    ...sectionCommonFields,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text' },
    { name: 'primaryCtaHref', type: 'text' },
    { name: 'secondaryCtaLabel', type: 'text' },
    { name: 'secondaryCtaHref', type: 'text' },
  ],
};

const LegacyNarrativeSection: Block = {
  slug: 'legacyNarrativeSection',
  dbName: 'legacy_narrative',
  labels: { singular: 'Legacy Narrative', plural: 'Legacy Narratives' },
  fields: [
    ...sectionCommonFields,
    { name: 'sectionLabel', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'paragraphs',
      type: 'array',
      dbName: 'lgn_paras',
      fields: [{ name: 'paragraph', type: 'textarea', required: true }],
    },
    { name: 'linkLabel', type: 'text' },
    { name: 'linkHref', type: 'text' },
  ],
};

const LegacyNumberedStageSection: Block = {
  slug: 'legacyNumberedStageSection',
  dbName: 'legacy_stage',
  labels: { singular: 'Legacy Numbered Stage', plural: 'Legacy Numbered Stages' },
  fields: [
    ...sectionCommonFields,
    { name: 'stageNumber', type: 'text', defaultValue: '01' },
    { name: 'stageLabel', type: 'text', defaultValue: 'Stage' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      dbName: 'lgs_items',
      fields: [{ name: 'item', type: 'textarea', required: true }],
    },
    { name: 'whoForHeading', type: 'text', defaultValue: 'Who it is for' },
    { name: 'whoForBody', type: 'textarea' },
  ],
};

const LegacyAudienceGridSection: Block = {
  slug: 'legacyAudienceGridSection',
  dbName: 'legacy_audience',
  labels: { singular: 'Legacy Audience Grid', plural: 'Legacy Audience Grids' },
  fields: [
    ...sectionCommonFields,
    { name: 'sectionLabel', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'audiences',
      type: 'array',
      dbName: 'lga_auds',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'copy', type: 'textarea', required: true },
      ],
    },
    { name: 'footerText', type: 'text' },
  ],
};

const LegacyChecklistSection: Block = {
  slug: 'legacyChecklistSection',
  dbName: 'legacy_checklist',
  labels: { singular: 'Legacy Checklist', plural: 'Legacy Checklists' },
  fields: [
    ...sectionCommonFields,
    { name: 'sectionLabel', type: 'text' },
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      dbName: 'lgc_items',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'footerBody', type: 'textarea' },
  ],
};

const LegacyQuoteSection: Block = {
  slug: 'legacyQuoteSection',
  dbName: 'legacy_quote',
  labels: { singular: 'Legacy Quote', plural: 'Legacy Quotes' },
  fields: [
    ...sectionCommonFields,
    { name: 'sectionLabel', type: 'text' },
    { name: 'quote', type: 'textarea', required: true },
  ],
};

const LegacyCenteredCtaSection: Block = {
  slug: 'legacyCenteredCtaSection',
  dbName: 'legacy_cta',
  labels: { singular: 'Legacy Centered CTA', plural: 'Legacy Centered CTAs' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
    { name: 'secondaryLinkLabel', type: 'text' },
    { name: 'secondaryLinkHref', type: 'text' },
  ],
};

const ReusableSectionReference: Block = {
  slug: 'reusableSectionReference',
  dbName: 'reuse_sec_ref',
  labels: { singular: 'Reusable Section', plural: 'Reusable Sections' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'reusableSection',
      type: 'relationship',
      relationTo: 'reusable-sections',
      required: true,
    },
    {
      name: 'overrideHeading',
      type: 'text',
      admin: { description: 'Override the reusable section heading' },
    },
  ],
};

const StatsSection: Block = {
  slug: 'statsSection',
  dbName: 'stats_sec',
  labels: { singular: 'Stats Section', plural: 'Stats Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      dbName: 'stats_items',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'text' },
      ],
    },
  ],
};

const FaqSection: Block = {
  slug: 'faqSection',
  dbName: 'faq_sec',
  labels: { singular: 'FAQ Section', plural: 'FAQ Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      dbName: 'faq_items',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
};

const FeatureGridSection: Block = {
  slug: 'featureGridSection',
  dbName: 'feat_grid',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      dbName: 'feat_items',
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Emoji or short icon label' } },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
      ],
    },
  ],
};

const FormSection: Block = {
  slug: 'formSection',
  dbName: 'form_sec',
  labels: { singular: 'Form Section', plural: 'Form Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'successMessage',
      type: 'textarea',
      admin: { description: 'Message shown after successful submission (overrides form default)' },
    },
  ],
};

const TeamSection: Block = {
  slug: 'teamSection',
  dbName: 'team_sec',
  labels: { singular: 'Team Section', plural: 'Team Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'team-members',
      hasMany: true,
      admin: { description: 'Select team members to display (leave empty to show all, ordered by order field)' },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
  ],
};

const LogoBandSection: Block = {
  slug: 'logoBandSection',
  dbName: 'logo_band',
  labels: { singular: 'Logo Band Section', plural: 'Logo Band Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text', admin: { description: 'Optional label above logos, e.g. "Trusted by"' } },
    {
      name: 'logos',
      type: 'relationship',
      relationTo: 'logos',
      hasMany: true,
      admin: { description: 'Select logos to display (leave empty to show all, ordered by order field)' },
    },
    {
      name: 'displayMode',
      type: 'select',
      defaultValue: 'static',
      options: [
        { label: 'Static Grid', value: 'static' },
        { label: 'Scrolling Marquee', value: 'marquee' },
      ],
    },
    { name: 'logoHeight', type: 'number', defaultValue: 40, admin: { description: 'Logo height in pixels' } },
  ],
};

const QuoteSection: Block = {
  slug: 'quoteSection',
  dbName: 'quote_sec',
  labels: { singular: 'Quote Section', plural: 'Quote Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'quote', type: 'textarea', required: true, admin: { description: 'The quote text (without quotation marks)' } },
    { name: 'attribution', type: 'text', admin: { description: 'Author name, e.g. "Jane Smith"' } },
    { name: 'attributionRole', type: 'text', admin: { description: 'Author role/company, e.g. "CEO, Acme Inc."' } },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Optional author photo' } },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'centered',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Left with border', value: 'left-border' },
        { label: 'Large pull quote', value: 'pull' },
      ],
    },
  ],
};

const TabsSection: Block = {
  slug: 'tabsSection',
  dbName: 'tabs_sec',
  labels: { singular: 'Tabs Section', plural: 'Tabs Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'tabs',
      type: 'array',
      dbName: 'tabs_items',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'Tab button label' } },
        { name: 'heading', type: 'text', admin: { description: 'Content heading for this tab' } },
        { name: 'body', type: 'textarea', admin: { description: 'Main body text for this tab' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Optional image for this tab' } },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
      ],
    },
  ],
};

const SplitSection: Block = {
  slug: 'splitSection',
  dbName: 'split_sec',
  labels: { singular: 'Split / Two-Column Section', plural: 'Split Sections' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: '50-50',
      options: [
        { label: 'Left Heavy (60/40)', value: '60-40' },
        { label: 'Equal (50/50)', value: '50-50' },
        { label: 'Right Heavy (40/60)', value: '40-60' },
      ],
    },
    {
      name: 'reverseOnMobile',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Reverse column order on mobile (right column shown first)' },
    },
    {
      name: 'verticalAlign',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
    {
      name: 'leftType',
      type: 'select',
      defaultValue: 'richText',
      options: [
        { label: 'Rich Text', value: 'richText' },
        { label: 'Image', value: 'image' },
        { label: 'Video Embed', value: 'video' },
      ],
    },
    { name: 'leftHeading', type: 'text' },
    { name: 'leftContent', type: 'richText', admin: { condition: (_, siblingData) => siblingData?.leftType === 'richText' } },
    { name: 'leftImage', type: 'upload', relationTo: 'media', admin: { condition: (_, siblingData) => siblingData?.leftType === 'image' } },
    { name: 'leftVideoUrl', type: 'text', admin: { description: 'YouTube or Vimeo embed URL', condition: (_, siblingData) => siblingData?.leftType === 'video' } },
    { name: 'leftCtaLabel', type: 'text', admin: { description: 'Optional CTA button' } },
    { name: 'leftCtaHref', type: 'text' },
    {
      name: 'rightType',
      type: 'select',
      defaultValue: 'image',
      options: [
        { label: 'Rich Text', value: 'richText' },
        { label: 'Image', value: 'image' },
        { label: 'Video Embed', value: 'video' },
      ],
    },
    { name: 'rightHeading', type: 'text' },
    { name: 'rightContent', type: 'richText', admin: { condition: (_, siblingData) => siblingData?.rightType === 'richText' } },
    { name: 'rightImage', type: 'upload', relationTo: 'media', admin: { condition: (_, siblingData) => siblingData?.rightType === 'image' } },
    { name: 'rightVideoUrl', type: 'text', admin: { description: 'YouTube or Vimeo embed URL', condition: (_, siblingData) => siblingData?.rightType === 'video' } },
    { name: 'rightCtaLabel', type: 'text', admin: { description: 'Optional CTA button' } },
    { name: 'rightCtaHref', type: 'text' },
  ],
};

const SpacerSection: Block = {
  slug: 'spacerSection',
  dbName: 'spacer',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  fields: [
    { name: 'height', type: 'number', defaultValue: 40 },
  ],
};

const DividerSection: Block = {
  slug: 'dividerSection',
  dbName: 'divider',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text' },
  ],
};

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
