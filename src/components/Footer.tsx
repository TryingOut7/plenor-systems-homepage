import Link from 'next/link';

const PAGE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
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
              Plenor Systems
            </Link>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                marginTop: '12px',
                lineHeight: 1.6,
              }}
            >
              A product development framework for Testing & QA and Launch & Go-to-Market.
            </p>
          </div>

          {/* Page links */}
          <nav aria-label="Footer navigation">
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
              Pages
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
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
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
              href="mailto:hello@plenor.ai"
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
              hello@plenor.ai
            </a>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452H17.21v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.985V9h3.102v1.561h.044c.432-.82 1.487-1.685 3.059-1.685 3.27 0 3.874 2.153 3.874 4.953v6.623zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm1.553 13.019H3.784V9h3.106v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
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
