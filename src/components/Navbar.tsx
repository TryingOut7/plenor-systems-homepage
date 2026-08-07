'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAVIGATION_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <nav aria-label="Primary navigation" className="site-navigation">
        <div className="site-navigation-row">
          <Link
            href="/"
            className="site-wordmark"
            aria-label="Plenor Systems home"
            onClick={() => setMenuOpen(false)}
          >
            Plenor Systems
          </Link>
          <button
            type="button"
            className="site-menu-control"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation-links"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? 'Close menu' : 'Menu'}
          </button>
          <ul
            id="primary-navigation-links"
            className={menuOpen ? 'site-navigation-links is-open' : 'site-navigation-links'}
          >
            {NAVIGATION_LINKS.map((link) => {
              const current = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="site-navigation-link"
                    aria-current={current ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
