'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        height: '64px',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.08)' : '0 1px 0 #E5E7EB',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Plenor Systems – home"
          style={{
            fontWeight: 700,
            fontSize: '18px',
            color: '#1B2D4F',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}
        >
          Plenor Systems
        </Link>

        {/* Desktop nav */}
        <ul
          role="list"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  fontSize: '15px',
                  fontWeight: pathname === link.href ? 600 : 400,
                  color: pathname === link.href ? '#1B2D4F' : '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact#guide" className="btn-nav">
              Get the Free Guide
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#1B2D4F',
          }}
          className="show-mobile"
        >
          {menuOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Navigation menu"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E5E7EB',
            padding: '16px 24px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 50,
          }}
          className="show-mobile"
        >
          <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    display: 'block',
                    padding: '12px 0',
                    fontSize: '16px',
                    fontWeight: pathname === link.href ? 600 : 400,
                    color: pathname === link.href ? '#1B2D4F' : '#1A1A1A',
                    textDecoration: 'none',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li style={{ marginTop: '16px' }}>
              <Link href="/contact#guide" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                Get the Free Guide
              </Link>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
