export const DEFAULT_SITE_NAME = 'Plenor Systems';
export const DEFAULT_BRAND_TAGLINE =
  'Structured product development for Testing & QA and Launch & Go-to-Market.';
export const DEFAULT_CONTACT_EMAIL = 'hello@plenor.ai';
export const DEFAULT_FOOTER_LEGAL_LABEL = 'Cookie Notice & Privacy Policy';
export const DEFAULT_FOOTER_LEGAL_HREF = '/privacy';

export const DEFAULT_NAVIGATION_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const DEFAULT_HEADER_BUTTONS = [
  { label: 'Get the Free Guide', href: '/contact#guide', variant: 'primary' as const },
] as const;

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
] as const;
