'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavLink = {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
};

const FALLBACK_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

type NavigationLink = {
  _key?: string;
  label?: string;
  href?: string;
  isVisible?: boolean;
  children?: Array<{ label?: string; href?: string }>;
};

type HeaderButtonConfig = {
  _key?: string;
  label?: string;
  href?: string;
  variant?: 'primary' | 'ghost';
  isVisible?: boolean;
};

type HeaderButton = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
};

interface NavbarProps {
  siteName?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  navigationLinks?: NavigationLink[];
  headerButtons?: HeaderButtonConfig[];
  logoImage?: { url?: string; alt?: string; width?: number; height?: number };
  logoWidth?: number;
}

export default function Navbar({
  siteName = 'Website',
  primaryCtaLabel,
  primaryCtaHref,
  navigationLinks,
  headerButtons,
  logoImage,
  logoWidth = 120,
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<number | null>(null);
  const closeMenu = () => { setMenuOpen(false); setMobileOpenDropdown(null); };

  const navLinks: NavLink[] = (() => {
    const normalized: NavLink[] =
      navigationLinks
        ?.filter((link) => link?.isVisible !== false)
        .map((link) => ({
          label: link.label?.trim() || '',
          href: link.href?.trim() || '',
          children: Array.isArray(link.children)
            ? link.children
                .map((c) => ({ label: c.label?.trim() || '', href: c.href?.trim() || '' }))
                .filter((c) => c.label && c.href)
            : undefined,
        }))
        .filter((link) => Boolean(link.label && link.href)) as NavLink[] || [];
    return normalized.length ? normalized : FALLBACK_NAV_LINKS;
  })();

  const ctaButtons: HeaderButton[] = (() => {
    const hasHeaderButtonsField = Array.isArray(headerButtons);
    const normalized: HeaderButton[] =
      headerButtons
        ?.filter((button) => button?.isVisible !== false)
        .map((button) => ({
          label: button.label?.trim() || '',
          href: button.href?.trim() || '',
          variant: button.variant === 'ghost' ? 'ghost' : 'primary',
        }))
        .filter((button): button is HeaderButton => Boolean(button.label && button.href)) || [];

    if (normalized.length) return normalized;
    if (hasHeaderButtonsField) return [];

    const legacyLabel = primaryCtaLabel?.trim();
    const legacyHref = primaryCtaHref?.trim();
    if (legacyLabel && legacyHref) {
      return [{ label: legacyLabel, href: legacyHref, variant: 'primary' }];
    }

    return [];
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
        backgroundColor: 'var(--ui-color-surface)',
        height: 'var(--ui-nav-height, 68px)',
        borderBottom: scrolled ? '1px solid var(--ui-color-border)' : '1px solid transparent',
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
            fontFamily: 'var(--ui-font-display)',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--ui-color-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.03em',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {logoImage?.url ? (
            <Image
              src={logoImage.url}
              alt={logoImage.alt || siteName}
              width={logoWidth}
              height={40}
              style={{ objectFit: 'contain', height: '40px', width: 'auto', maxWidth: `${logoWidth}px` }}
            />
          ) : (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ui-color-primary)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              {siteName}
            </>
          )}
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
          {navLinks.map((link, index) => {
            const hasChildren = Boolean(link.children?.length);
            const isActive = pathname === link.href || (hasChildren && Boolean(link.children?.some((c) => pathname === c.href)));
            return (
              <li
                key={link.href}
                style={{ position: 'relative' }}
                onMouseEnter={() => hasChildren ? setOpenDropdown(index) : undefined}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={openDropdown === index}
                    aria-haspopup="true"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                    }}
                    className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    {link.label}
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transform: openDropdown === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="2 4 6 8 10 4" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
                  >
                    {link.label}
                  </Link>
                )}
                {hasChildren && openDropdown === index && (
                  <div className="nav-dropdown">
                    {link.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => { closeMenu(); setOpenDropdown(null); }}
                        className="nav-dropdown-item"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {ctaButtons.map((button, index) => (
            <li
              key={`${button.href}-${index}`}
              style={index === 0 ? { marginLeft: '12px' } : undefined}
            >
              <Link
                href={button.href}
                onClick={closeMenu}
                className={button.variant === 'ghost' ? 'btn-ghost' : 'btn-nav'}
              >
                {button.label}
              </Link>
            </li>
          ))}
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
            color: 'var(--ui-color-primary)',
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
            top: 'var(--ui-nav-height, 68px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--ui-color-surface)',
            borderBottom: '1px solid var(--ui-color-border)',
            padding: '8px 32px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease both',
          }}
          className="navbar-mobile-menu"
        >
          <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              const hasChildren = Boolean(link.children?.length);
              const isExpanded = mobileOpenDropdown === index;
              return (
                <li key={link.href} style={{ borderBottom: '1px solid var(--ui-color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      style={{
                        display: 'block',
                        padding: '14px 0',
                        fontSize: '16px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--ui-color-primary)' : 'var(--ui-color-text)',
                        textDecoration: 'none',
                        flex: 1,
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Close submenu' : 'Open submenu'}
                        onClick={() => setMobileOpenDropdown(isExpanded ? null : index)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--ui-color-text-muted)' }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <polyline points="4 6 8 10 12 6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <ul role="list" style={{ listStyle: 'none', margin: 0, padding: '0 0 8px 16px' }}>
                      {link.children!.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeMenu}
                            style={{
                              display: 'block',
                              padding: '10px 0',
                              fontSize: '15px',
                              color: pathname === child.href ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                              textDecoration: 'none',
                            }}
                            aria-current={pathname === child.href ? 'page' : undefined}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            {ctaButtons.map((button, index) => (
              <li key={`${button.href}-mobile-${index}`} style={index === 0 ? { marginTop: '20px' } : { marginTop: '10px' }}>
                <Link
                  href={button.href}
                  onClick={closeMenu}
                  className={button.variant === 'ghost' ? 'btn-ghost' : 'btn-primary'}
                  style={{ display: 'block', textAlign: 'center' }}
                >
                  {button.label}
                </Link>
              </li>
            ))}
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
        .nav-link:hover { color: var(--ui-color-primary) !important; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 12px;
          right: 12px;
          height: 1.5px;
          background-color: var(--ui-color-primary);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after,
        .nav-link--active::after {
          transform: scaleX(1);
        }
        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 180px;
          background-color: var(--ui-color-surface);
          border: 1px solid var(--ui-color-border);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          padding: 6px;
          z-index: 100;
          animation: fadeIn 0.15s ease both;
        }
        .nav-dropdown-item {
          display: block;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--ui-color-text-muted);
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .nav-dropdown-item:hover {
          background-color: var(--ui-color-section-alt);
          color: var(--ui-color-primary);
        }
      `}</style>
    </header>
  );
}
