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
        backgroundColor: '#ffffff',
        borderTop: '1px solid #E5E7EB',
        padding: '48px 24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '40px',
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#1B2D4F',
                textDecoration: 'none',
              }}
              aria-label="Plenor Systems – home"
            >
              Plenor Systems
            </Link>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px', maxWidth: '260px' }}>
              A product development framework for Testing & QA and Launch & Go-to-Market.
            </p>
          </div>

          {/* Page links */}
          <nav aria-label="Footer navigation">
            <ul
              role="list"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 32px',
              }}
            >
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      textDecoration: 'none',
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* LinkedIn */}
          <div>
            <a
              href="https://www.linkedin.com/company/plenorsystems"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Plenor Systems on LinkedIn (opens in new tab)"
              style={{ color: '#6B7280', display: 'inline-block' }}
              className="footer-link"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452H17.21v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.985V9h3.102v1.561h.044c.432-.82 1.487-1.685 3.059-1.685 3.27 0 3.874 2.153 3.874 4.953v6.623zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm1.553 13.019H3.784V9h3.106v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
            © 2026 Plenor Systems. All rights reserved.
          </p>
          <Link
            href="/privacy"
            style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'underline' }}
          >
            Cookie Notice & Privacy Policy
          </Link>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #1B2D4F !important; text-decoration: underline; }
      `}</style>
    </footer>
  );
}
