export const DEFAULT_SITE_NAME = 'Plenor Systems';
export const DEFAULT_BRAND_TAGLINE =
  'A Governed Definition Platform for creating ready-to-build product and system specifications.';
export const DEFAULT_CONTACT_EMAIL = 'contact@plenor.ai';
export const DEFAULT_FOOTER_LEGAL_LABEL = 'Privacy Policy';
export const DEFAULT_FOOTER_LEGAL_HREF = '/privacy';

export const DEFAULT_NAVIGATION_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
] as const;

export const DEFAULT_HEADER_BUTTONS: ReadonlyArray<{
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
}> = [];

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
] as const;
