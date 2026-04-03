export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  includeInSitemap?: boolean;
  ogImage?: {
    url?: string;
    alt?: string;
  };
};

export type SiteSettings = {
  siteName?: string;
  brandTagline?: string;
  siteUrl?: string;
  contactEmail?: string;
  logoImage?: { url?: string; alt?: string; width?: number; height?: number };
  logoWidth?: number;
  headerButtons?: Array<{
    id?: string;
    label?: string;
    href?: string;
    variant?: 'primary' | 'ghost';
    isVisible?: boolean;
  }>;
  twitterHandle?: string;
  defaultSeo?: SeoFields;
  defaultMetaDescription?: string;
  navigationLinks?: Array<{
    id?: string;
    label?: string;
    href?: string;
    isVisible?: boolean;
    children?: Array<{ id?: string; label?: string; href?: string }>;
  }>;
  announcementBanner?: {
    enabled?: boolean;
    text?: string;
    linkLabel?: string;
    linkHref?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  footerColumns?: Array<{
    id?: string;
    title?: string;
    links?: Array<{ id?: string; label?: string; href?: string }>;
  }>;
  socialLinks?: Array<{ id?: string; label?: string; url?: string }>;
  copyrightText?: string;
  footerLegalLabel?: string;
  footerLegalHref?: string;
  jsonLd?: {
    organizationName?: string;
    organizationUrl?: string;
    organizationEmail?: string;
    sameAs?: Array<{ url?: string }>;
  };
  guideForm?: {
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
  inquiryForm?: {
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
  cookieBanner?: {
    message?: string;
    acceptLabel?: string;
    declineLabel?: string;
    privacyLabel?: string;
    privacyHref?: string;
  };
  privacyPolicy?: unknown;
  privacyLastUpdated?: string;
  notFoundPage?: {
    metaTitle?: string;
    metaDescription?: string;
    heading?: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  analyticsId?: string;
};

export type UISettings = {
  colors?: {
    primary?: string;
    primaryHover?: string;
    background?: string;
    surface?: string;
    sectionAlt?: string;
    text?: string;
    textMuted?: string;
    border?: string;
    link?: string;
    focusRing?: string;
    navyBackground?: string;
    charcoalBackground?: string;
    blackBackground?: string;
    darkText?: string;
    darkTextMuted?: string;
    heroBackground?: string;
    heroText?: string;
    heroMutedText?: string;
    footerBackground?: string;
    footerText?: string;
    footerMutedText?: string;
    cookieBackground?: string;
    cookieText?: string;
    cookieLink?: string;
    navBackground?: string;
    navScrolledBackground?: string;
    navBorder?: string;
  };
  typography?: {
    bodyFontFamily?: string;
    displayFontFamily?: string;
    baseFontSize?: number;
    baseLineHeight?: number;
    headingLetterSpacing?: string;
    sectionLabelLetterSpacing?: string;
    headingFontUrl?: string;
    bodyFontUrl?: string;
  };
  layout?: {
    containerMaxWidth?: string;
    sectionPaddingCompact?: string;
    sectionPaddingRegular?: string;
    sectionPaddingSpacious?: string;
    heroPaddingCompact?: string;
    heroPaddingRegular?: string;
    heroPaddingSpacious?: string;
    mobileSectionPadding?: string;
    navHeight?: number;
    cardRadius?: number;
  };
  buttons?: {
    radius?: number;
    primaryBackground?: string;
    primaryBackgroundHover?: string;
    primaryText?: string;
    secondaryBackground?: string;
    secondaryBackgroundHover?: string;
    secondaryText?: string;
    secondaryTextHover?: string;
    ghostBackground?: string;
    ghostBackgroundHover?: string;
    ghostText?: string;
    navBackground?: string;
    navBackgroundHover?: string;
    navText?: string;
  };
};

export type PageSection = {
  id?: string;
  blockType: string;
  [key: string]: unknown;
};

export type SitePage = {
  id?: string;
  title?: string;
  slug?: string;
  pageMode?: 'builder' | 'template';
  templateKey?: 'default' | 'landing' | 'article' | 'product';
  presetKey?: 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';
  presetContent?: Record<string, unknown>;
  isActive?: boolean;
  hideNavbar?: boolean;
  hideFooter?: boolean;
  pageBackgroundColor?: string;
  customHeadScripts?: string;
  seo?: SeoFields;
  sections?: PageSection[];
};

export type ServiceItem = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: unknown;
  tags?: Array<{ tag?: string }>;
  isFeatured?: boolean;
  priceFrom?: number;
  currency?: string;
  seo?: SeoFields;
  heroImage?: {
    url?: string;
    alt?: string;
  };
};

export type BlogCategory = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
};

export type TeamMember = {
  id?: string;
  name?: string;
  role?: string;
  bio?: string;
  photo?: { url?: string; alt?: string };
  linkedinUrl?: string;
  twitterUrl?: string;
  order?: number;
};

export type Logo = {
  id?: string;
  name?: string;
  image?: { url?: string; alt?: string };
  url?: string;
  order?: number;
};

export type BlogPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: {
    url?: string;
    alt?: string;
  };
  body?: unknown;
  publishedAt?: string;
  isFeatured?: boolean;
  readingTimeMinutes?: number;
  tags?: Array<{ tag?: string }>;
  category?: BlogCategory;
  resourceUrl?: string;
  seo?: SeoFields;
};

export type Testimonial = {
  id?: string;
  name?: string;
  slug?: string;
  role?: string;
  company?: string;
  quote?: string;
  avatar?: {
    url?: string;
    alt?: string;
  };
  rating?: number;
  details?: unknown;
  isFeatured?: boolean;
  publishedAt?: string;
  tags?: Array<{ tag?: string }>;
  seo?: SeoFields;
};

export type RedirectRule = {
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
  enabled?: boolean;
};

export type CollectionData = {
  serviceItems: ServiceItem[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
};

export type SitemapQueryResult = {
  sitePages: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
  serviceItems: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
};

export type CmsReadOptions = {
  draft?: boolean;
};
