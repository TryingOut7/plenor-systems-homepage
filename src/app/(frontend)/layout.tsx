import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { draftMode } from 'next/headers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import ConsentGatedAnalytics from '@/components/ConsentGatedAnalytics';
import CookieBanner from '@/components/CookieBanner';
import DraftModeBanner from '@/components/DraftModeBanner';
import PayloadLivePreviewRefresh from '@/components/PayloadLivePreviewRefresh';
import SkipLink from '@/components/SkipLink';
import { getSafeStylesheetUrl } from '@/lib/external-resource-policy';
import { getSiteSettings, getUISettings } from '@/payload/cms';
import UIStyleInjector from '@/components/UIStyleInjector';
import {
  resolveContactEmail,
  resolveSiteName,
  resolveSiteUrl,
  resolveTwitterHandle,
} from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

const playfair = localFont({
  src: '../../fonts/PlayfairDisplay-VariableFont_wght.ttf',
  variable: '--font-display',
  display: 'swap',
  weight: '400 900',
});

const dmSans = localFont({
  src: '../../fonts/DMSans-VariableFont_opsz,wght.ttf',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 1000',
});

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteName = resolveSiteName(settings);
  const siteUrl = resolveSiteUrl(settings);
  const twitterHandle = resolveTwitterHandle(settings);
  const description =
    settings?.defaultMetaDescription ||
    settings?.defaultSeo?.metaDescription ||
    `${siteName} provides a structured product development framework for Testing & QA and Launch & Go-to-Market — the two stages most likely to cause rework or failed launches.`;
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
      ...(twitterHandle ? { site: twitterHandle } : {}),
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
  const cmsReadOptions = { draft: isDraftMode };
  const [siteSettings, uiSettings] = await Promise.all([
    getSiteSettings(cmsReadOptions),
    getUISettings(cmsReadOptions),
  ]);

  const siteName = resolveSiteName(siteSettings);
  const siteUrl = resolveSiteUrl(siteSettings);
  const contactEmail = resolveContactEmail(siteSettings);
  const analyticsId = siteSettings?.analyticsId;

  const jsonLd = siteSettings?.jsonLd;
  const sameAsUrls = jsonLd?.sameAs?.map((s) => s.url).filter(Boolean) as string[] | undefined;
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: jsonLd?.organizationName || siteName,
    url: jsonLd?.organizationUrl || siteUrl,
    ...(sameAsUrls?.length ? { sameAs: sameAsUrls } : {}),
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
  const headingFontUrl = getSafeStylesheetUrl(uiSettings?.typography?.headingFontUrl);
  const bodyFontUrl = getSafeStylesheetUrl(uiSettings?.typography?.bodyFontUrl);
  const livePreviewServerURL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteUrl);

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <UIStyleInjector uiSettings={uiSettings} />
        {headingFontUrl && <link rel="stylesheet" href={headingFontUrl} />}
        {bodyFontUrl && <link rel="stylesheet" href={bodyFontUrl} />}
      </head>
      <body>
        <SkipLink />
        <AnnouncementBanner
          enabled={siteSettings?.announcementBanner?.enabled}
          text={siteSettings?.announcementBanner?.text}
          linkLabel={siteSettings?.announcementBanner?.linkLabel}
          linkHref={siteSettings?.announcementBanner?.linkHref}
          backgroundColor={siteSettings?.announcementBanner?.backgroundColor}
          textColor={siteSettings?.announcementBanner?.textColor}
        />
        <Navbar
          siteName={siteSettings?.siteName}
          navigationLinks={siteSettings?.navigationLinks}
          headerButtons={siteSettings?.headerButtons}
          logoImage={siteSettings?.logoImage as { url?: string; alt?: string; width?: number; height?: number } | undefined}
          logoWidth={siteSettings?.logoWidth}
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
        {analyticsId && <ConsentGatedAnalytics analyticsId={analyticsId} />}
        {isDraftMode && <PayloadLivePreviewRefresh serverURL={livePreviewServerURL} />}
        {isDraftMode && <DraftModeBanner />}
        <SpeedInsights />
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
