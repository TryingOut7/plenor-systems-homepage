import Link from 'next/link';
import {
  DEFAULT_BRAND_TAGLINE,
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_FOOTER_LEGAL_HREF,
  DEFAULT_FOOTER_LEGAL_LABEL,
  DEFAULT_SITE_NAME,
} from '@/lib/site-defaults';

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
  siteName = DEFAULT_SITE_NAME,
  brandTagline = DEFAULT_BRAND_TAGLINE,
  contactEmail = DEFAULT_CONTACT_EMAIL,
  footerColumns,
  socialLinks,
  copyrightText,
  footerLegalLabel,
  footerLegalHref,
}: FooterProps) {
  const hasFooterColumnsField = Array.isArray(footerColumns);
  const fallbackColumns: FooterColumn[] = DEFAULT_FOOTER_COLUMNS.map((column) => ({
    title: column.title,
    links: column.links.map((link) => ({
      label: link.label,
      href: link.href,
    })),
  }));
  const sourceColumns: FooterColumn[] = hasFooterColumnsField ? (footerColumns ?? []) : fallbackColumns;
  const normalizedColumns = (sourceColumns?.length ? sourceColumns : []).map((column) => ({
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
    <footer role="contentinfo" className="footer">
      <div className="footer-inner">

        {/* Top row */}
        <div className="footer-top-row">
          {/* Brand */}
          <div className="footer-brand">
            <Link
              href="/"
              className="footer-brand-link"
              aria-label={`${siteName} – home`}
            >
              <span className="footer-brand-dot" aria-hidden="true" />
              {siteName}
            </Link>
            {brandTagline ? (
              <p className="footer-tagline">{brandTagline}</p>
            ) : null}
          </div>

          {/* Footer columns */}
          {normalizedColumns.map((column, index) => (
            <nav aria-label={`${column.title || 'Footer'} navigation`} key={column._key || `${column.title}-${index}`}>
              <p className="footer-column-heading">
                {column.title || 'Pages'}
              </p>
              <ul role="list" className="footer-column-links">
                {(column.links || []).map((link, linkIndex) => (
                  <li key={link._key || `${link.href}-${linkIndex}`}>
                    <Link href={link.href || '/'} className="footer-link">
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
              <p className="footer-column-heading">Get in touch</p>
              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  className="footer-link footer-contact-link"
                  style={{ marginBottom: normalizedSocialLinks.length > 0 ? '12px' : 0 }}
                >
                  {contactEmail}
                </a>
              ) : null}
              {normalizedSocialLinks.length ? (
                <div className="footer-social-links">
                  {normalizedSocialLinks.map((link, linkIndex) => (
                    <a
                      key={link._key || `${link.url}-${linkIndex}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (opens in new tab)`}
                      className="footer-link footer-social-link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {link.label}
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
                        <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" />
                        <polyline points="8 1 11 1 11 4" />
                        <line x1="11" y1="1" x2="5.5" y2="6.5" />
                      </svg>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            {(copyrightText || '© {year} {siteName}. All rights reserved.')
              .replace('{year}', String(new Date().getFullYear()))
              .replace('{siteName}', siteName)}
          </p>
          <Link
            href={footerLegalHref || DEFAULT_FOOTER_LEGAL_HREF}
            className="footer-link footer-legal-link"
          >
            {footerLegalLabel || DEFAULT_FOOTER_LEGAL_LABEL}
          </Link>
        </div>
      </div>
    </footer>
  );
}
