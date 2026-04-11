export const DEFAULT_SITE_NAME = 'Plenor.ai';
export const DEFAULT_BRAND_TAGLINE =
  'Professional services and advisory for CMS-driven websites and structured delivery.';
export const DEFAULT_CONTACT_EMAIL = 'hello@plenor.ai';
export const DEFAULT_FOOTER_LEGAL_LABEL = 'Cookie Notice & Privacy Policy';
export const DEFAULT_FOOTER_LEGAL_HREF = '/privacy';

export const DEFAULT_NAVIGATION_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Framework', href: '/framework' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const DEFAULT_HEADER_BUTTONS = [
  { label: 'Start a Conversation', href: '/contact', variant: 'primary' as const },
] as const;

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Framework', href: '/framework' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Insights', href: '/insights' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
] as const;
