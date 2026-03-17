import Link from 'next/link';

const FALLBACK_PAGE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

type FooterLink = {
  _key?: string;
  label?: string;
  href?: string;
};

type FooterColumn = {
  _key?: string;
  title?: string;
  links?: FooterLink[];
};

type SocialLink = {
  _key?: string;
  label?: string;
  url?: string;
};

interface FooterProps {
  siteName?: string;
  brandTagline?: string;
  contactEmail?: string;
  footerColumns?: FooterColumn[];
  socialLinks?: SocialLink[];
}

export default function Footer({
  siteName = 'Plenor Systems',
  brandTagline = 'A product development framework for Testing & QA and Launch & Go-to-Market.',
  contactEmail = 'hello@plenor.ai',
  footerColumns,
  socialLinks,
}: FooterProps) {
  const fallbackColumns: FooterColumn[] = [
    { title: 'Pages', links: FALLBACK_PAGE_LINKS },
  ];

  const normalizedColumns = (footerColumns?.length ? footerColumns : fallbackColumns).map((column) => ({
    ...column,
    links:
      column.links
        ?.map((link) => ({ _key: link._key, label: link.label?.trim(), href: link.href?.trim() }))
        .filter((link) => link.label && link.href) || [],
  }));

  const normalizedSocialLinks =
    socialLinks
      ?.map((link) => ({ _key: link._key, label: link.label?.trim(), url: link.url?.trim() }))
      .filter((link) => link.label && link.url) || [];

  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: '#1B2D4F',
        padding: '64px 32px 40px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '48px',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: '280px' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontWeight: 700,
                fontSize: '20px',
                letterSpacing: '-0.03em',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              aria-label="Plenor Systems – home"
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              {siteName}
            </Link>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                marginTop: '12px',
                lineHeight: 1.6,
              }}
            >
              {brandTagline}
            </p>
          </div>

          {/* Footer columns */}
          {normalizedColumns.map((column, index) => (
            <nav aria-label={`${column.title || 'Footer'} navigation`} key={column._key || `${column.title}-${index}`}>
              <p
                style={{
                  fontFamily: 'var(--font-sans), system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: '16px',
                }}
              >
                {column.title || 'Pages'}
              </p>
              <ul
                role="list"
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {(column.links || []).map((link, linkIndex) => (
                  <li key={link._key || `${link.href}-${linkIndex}`}>
                    <Link
                      href={link.href || '/'}
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      className="footer-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact + Social */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans), system-ui, sans-serif',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '16px',
              }}
            >
              Get in touch
            </p>
            <a
              href={`mailto:${contactEmail}`}
              style={{
                display: 'block',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                marginBottom: '12px',
                transition: 'color 0.2s ease',
              }}
              className="footer-link"
            >
              {contactEmail}
            </a>
            {normalizedSocialLinks.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {normalizedSocialLinks.map((link, linkIndex) => (
                  <a
                    key={link._key || `${link.url}-${linkIndex}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.label} (opens in new tab)`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : (
              <a
                href="https://www.linkedin.com/company/plenor-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Plenor Systems on LinkedIn (opens in new tab)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                className="footer-link"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            © 2026 Plenor Systems. All rights reserved.
          </p>
          <Link
            href="/privacy"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '13px',
              textDecoration: 'underline',
              transition: 'color 0.2s ease',
            }}
            className="footer-link"
          >
            Cookie Notice & Privacy Policy
          </Link>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: rgba(255,255,255,0.9) !important; }
      `}</style>
    </footer>
  );
}
