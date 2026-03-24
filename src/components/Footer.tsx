import Link from 'next/link';

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
  copyrightText?: string;
  footerLegalLabel?: string;
  footerLegalHref?: string;
}

export default function Footer({
  siteName = 'Website',
  brandTagline = '',
  contactEmail = '',
  footerColumns,
  socialLinks,
  copyrightText,
  footerLegalLabel,
  footerLegalHref,
}: FooterProps) {
  const normalizedColumns = (footerColumns?.length ? footerColumns : []).map((column) => ({
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
        backgroundColor: 'var(--ui-color-footer-bg)',
        padding: '64px 32px 40px',
      }}
    >
      <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>

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
                fontFamily: 'var(--ui-font-display)',
                fontWeight: 700,
                fontSize: '20px',
                letterSpacing: '-0.03em',
                color: 'var(--ui-color-footer-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              aria-label={`${siteName} – home`}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ui-color-footer-muted)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              {siteName}
            </Link>
            {brandTagline ? (
              <p
                style={{
                  color: 'var(--ui-color-footer-muted)',
                  fontSize: '14px',
                  marginTop: '12px',
                  lineHeight: 1.6,
                }}
              >
                {brandTagline}
              </p>
            ) : null}
          </div>

          {/* Footer columns */}
          {normalizedColumns.map((column, index) => (
            <nav aria-label={`${column.title || 'Footer'} navigation`} key={column._key || `${column.title}-${index}`}>
              <p
                style={{
                  fontFamily: 'var(--ui-font-body)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ui-color-footer-muted)',
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
                        color: 'var(--ui-color-footer-muted)',
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
          {(contactEmail || normalizedSocialLinks.length > 0) ? (
            <div>
              <p
                style={{
                  fontFamily: 'var(--ui-font-body)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ui-color-footer-muted)',
                  marginBottom: '16px',
                }}
              >
                Get in touch
              </p>
              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'var(--ui-color-footer-muted)',
                    textDecoration: 'none',
                    marginBottom: normalizedSocialLinks.length > 0 ? '12px' : 0,
                    transition: 'color 0.2s ease',
                  }}
                  className="footer-link"
                >
                  {contactEmail}
                </a>
              ) : null}
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
                        color: 'var(--ui-color-footer-muted)',
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
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--ui-color-footer-muted)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ color: 'var(--ui-color-footer-muted)', fontSize: '13px', margin: 0 }}>
            {(copyrightText || '© {year} {siteName}. All rights reserved.')
              .replace('{year}', String(new Date().getFullYear()))
              .replace('{siteName}', siteName)}
          </p>
          <Link
            href={footerLegalHref || '/privacy'}
            style={{
              color: 'var(--ui-color-footer-muted)',
              fontSize: '13px',
              textDecoration: 'underline',
              transition: 'color 0.2s ease',
            }}
            className="footer-link"
          >
            {footerLegalLabel || 'Cookie Notice & Privacy Policy'}
          </Link>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: var(--ui-color-footer-text) !important; }
      `}</style>
    </footer>
  );
}
