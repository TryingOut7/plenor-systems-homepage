export interface ContentPageSection {
  id?: string;
  blockType: string;
  [key: string]: unknown;
}

export interface ContentPageResponse {
  page: {
    id?: string;
    title?: string;
    slug?: string;
    pageMode?: 'builder' | 'template';
    templateKey?: 'default' | 'landing' | 'article' | 'product';
    presetKey?: 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';
    hideNavbar?: boolean;
    hideFooter?: boolean;
    pageBackgroundColor?: string;
    sections: ContentPageSection[];
  };
}

export interface ContentNavigationLink {
  id?: string;
  label?: string;
  href?: string;
  isVisible?: boolean;
  children?: Array<{ id?: string; label?: string; href?: string }>;
}

export interface ContentNavigationResponse {
  siteName?: string;
  navigationLinks: ContentNavigationLink[];
  headerButtons: Array<{
    id?: string;
    label?: string;
    href?: string;
    variant?: 'primary' | 'ghost';
    isVisible?: boolean;
  }>;
}
