import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { VisualEditing } from 'next-sanity/visual-editing';
import { draftMode } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import SkipLink from '@/components/SkipLink';
import DraftModeBanner from '@/components/DraftModeBanner';
import { getSiteSettings } from '@/sanity/cms';

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  const description =
    settings?.defaultMetaDescription ||
    settings?.defaultSeo?.metaDescription ||
    'Plenor Systems provides a structured product development framework for Testing & QA and Launch & Go-to-Market — the two stages most likely to cause rework or failed launches.';
  const defaultTitle =
    settings?.defaultSeo?.metaTitle ||
    `${siteName} — Testing & QA and Launch & Go-to-Market Framework`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      siteName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: settings?.twitterHandle || '@plenor_ai',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();
  const siteSettings = await getSiteSettings(isDraftMode);

  const siteName = siteSettings?.siteName || 'Plenor Systems';
  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';
  const contactEmail = siteSettings?.contactEmail || 'hello@plenor.ai';
  const analyticsId = siteSettings?.analyticsId;

  const jsonLd = siteSettings?.jsonLd;
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: jsonLd?.organizationName || siteName,
    url: jsonLd?.organizationUrl || siteUrl,
    ...(jsonLd?.sameAs?.length ? { sameAs: jsonLd.sameAs } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      email: jsonLd?.organizationEmail || contactEmail,
      contactType: 'customer service',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  };

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <SkipLink />
        <Navbar
          siteName={siteSettings?.siteName}
          navigationLinks={siteSettings?.navigationLinks}
          primaryCtaLabel={siteSettings?.primaryCtaLabel}
          primaryCtaHref={siteSettings?.primaryCtaHref}
        />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
        <Footer
          siteName={siteSettings?.siteName}
          brandTagline={siteSettings?.brandTagline}
          contactEmail={siteSettings?.contactEmail}
          footerColumns={siteSettings?.footerColumns}
          socialLinks={siteSettings?.socialLinks}
          copyrightText={siteSettings?.copyrightText}
          footerLegalLabel={siteSettings?.footerLegalLabel}
          footerLegalHref={siteSettings?.footerLegalHref}
        />
        <CookieBanner
          message={siteSettings?.cookieBanner?.message}
          acceptLabel={siteSettings?.cookieBanner?.acceptLabel}
          declineLabel={siteSettings?.cookieBanner?.declineLabel}
          privacyLabel={siteSettings?.cookieBanner?.privacyLabel}
          privacyHref={siteSettings?.cookieBanner?.privacyHref}
        />
        {analyticsId && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${analyticsId}"}`}
            strategy="afterInteractive"
          />
        )}
        <SpeedInsights />
        {isDraftMode && <VisualEditing />}
        {isDraftMode && <DraftModeBanner />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
