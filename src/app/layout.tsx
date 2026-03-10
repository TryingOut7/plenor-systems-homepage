import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import SkipLink from '@/components/SkipLink';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://plenorsystems.com'),
  title: {
    default: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
    template: '%s | Plenor Systems',
  },
  description:
    'Plenor Systems provides a structured product development framework for Testing & QA and Launch & Go-to-Market — the two stages most likely to cause rework or failed launches.',
  openGraph: {
    siteName: 'Plenor Systems',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@plenorsystems',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SkipLink />
        <Navbar />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
