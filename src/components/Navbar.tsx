'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavLink = {
  label: string;
  href: string;
};

const FALLBACK_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

type NavigationLink = {
  _key?: string;
  label?: string;
  href?: string;
  isVisible?: boolean;
};

interface NavbarProps {
  siteName?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  navigationLinks?: NavigationLink[];
}

export default function Navbar({
  siteName = 'Plenor Systems',
  primaryCtaLabel = 'Get the Free Guide',
  primaryCtaHref = '/contact#guide',
  navigationLinks,
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const navLinks: NavLink[] = (() => {
    const normalized: NavLink[] =
      navigationLinks
        ?.filter((link) => link?.isVisible !== false)
        .map((link) => ({
          label: link.label?.trim() || '',
          href: link.href?.trim() || '',
        }))
        .filter((link): link is NavLink => Boolean(link.label && link.href)) || [];
    return normalized.length ? normalized : FALLBACK_NAV_LINKS;
  })();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        height: '68px',
        borderBottom: scrolled ? '1px solid #E5E7EB' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          aria-label={`${siteName} – home`}
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontWeight: 700,
            fontSize: '20px',
            color: '#1B2D4F',
            textDecoration: 'none',
            letterSpacing: '-0.03em',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#1B2D4F',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          {siteName}
        </Link>

        {/* Desktop nav */}
        <ul
          role="list"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
          className="navbar-desktop"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#1B2D4F' : '#6B7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    position: 'relative',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li style={{ marginLeft: '12px' }}>
            <Link href={primaryCtaHref} onClick={closeMenu} className="btn-nav">
              {primaryCtaLabel}
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
            display: 'none',
          }}
          className="navbar-hamburger"
        >
          {menuOpen ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="17" y1="5" x2="5" y2="17" />
              <line x1="5" y1="5" x2="17" y2="17" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="19" y2="6" />
              <line x1="3" y1="11" x2="19" y2="11" />
              <line x1="3" y1="16" x2="19" y2="16" />
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
            top: '68px',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E5E7EB',
            padding: '8px 32px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease both',
          }}
          className="navbar-mobile-menu"
        >
          <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      display: 'block',
                      padding: '14px 0',
                      fontSize: '16px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#1B2D4F' : '#1A1A1A',
                      textDecoration: 'none',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li style={{ marginTop: '20px' }}>
              <Link href={primaryCtaHref} onClick={closeMenu} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                {primaryCtaLabel}
              </Link>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .navbar-desktop { display: flex !important; }
          .navbar-hamburger { display: none !important; }
          .navbar-mobile-menu { display: none !important; }
        }
        @media (max-width: 767px) {
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        .nav-link:hover { color: #1B2D4F !important; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 12px;
          right: 12px;
          height: 1.5px;
          background-color: #1B2D4F;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after,
        .nav-link--active::after {
          transform: scaleX(1);
        }
      `}</style>
    </header>
  );
}
