import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import SkipLink from '@/components/SkipLink';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://plenor.ai'),
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
    site: '@plenor_ai',
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
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <SkipLink />
        <Navbar />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "d31767bc50f0482fbad1a4719599b494"}'
          strategy="afterInteractive"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
