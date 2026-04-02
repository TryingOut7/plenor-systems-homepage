import type { CSSProperties } from 'react';
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
import SkipLink from '@/components/SkipLink';
import { getSafeStylesheetUrl } from '@/lib/external-resource-policy';
import { getSiteSettings, getUISettings, type UISettings } from '@/payload/cms';
import {
  resolveContactEmail,
  resolveSiteName,
  resolveSiteUrl,
  resolveTwitterHandle,
} from '@/lib/site-config';

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
  const settings = await getSiteSettings();
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

function buildUIVariableStyles(uiSettings: UISettings | null): CSSProperties {
  const variables: Record<string, string> = {};

  const setVar = (name: string, value: unknown) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    variables[name] = trimmed;
  };

  const setPixelVar = (name: string, value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    variables[name] = `${value}px`;
  };

  const setNumericVar = (name: string, value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    variables[name] = String(value);
  };

  const colors = uiSettings?.colors;
  setVar('--ui-color-primary', colors?.primary);
  setVar('--ui-color-primary-hover', colors?.primaryHover);
  setVar('--ui-color-background', colors?.background);
  setVar('--ui-color-surface', colors?.surface);
  setVar('--ui-color-section-alt', colors?.sectionAlt);
  setVar('--ui-color-text', colors?.text);
  setVar('--ui-color-text-muted', colors?.textMuted);
  setVar('--ui-color-border', colors?.border);
  setVar('--ui-color-link', colors?.link);
  setVar('--ui-color-focus', colors?.focusRing);
  setVar('--ui-color-dark-bg', colors?.navyBackground);
  setVar('--ui-color-charcoal-bg', colors?.charcoalBackground);
  setVar('--ui-color-black-bg', colors?.blackBackground);
  setVar('--ui-color-dark-text', colors?.darkText);
  setVar('--ui-color-dark-text-muted', colors?.darkTextMuted);
  setVar('--ui-color-hero-bg', colors?.heroBackground);
  setVar('--ui-color-hero-text', colors?.heroText);
  setVar('--ui-color-hero-muted', colors?.heroMutedText);
  setVar('--ui-color-footer-bg', colors?.footerBackground);
  setVar('--ui-color-footer-text', colors?.footerText);
  setVar('--ui-color-footer-muted', colors?.footerMutedText);
  setVar('--ui-color-cookie-bg', colors?.cookieBackground);
  setVar('--ui-color-cookie-text', colors?.cookieText);
  setVar('--ui-color-cookie-link', colors?.cookieLink);
  setVar('--ui-nav-background', colors?.navBackground);
  setVar('--ui-nav-scrolled-background', colors?.navScrolledBackground);
  setVar('--ui-nav-border', colors?.navBorder);

  const typography = uiSettings?.typography;
  setVar('--ui-font-body', typography?.bodyFontFamily);
  setVar('--ui-font-display', typography?.displayFontFamily);
  setPixelVar('--ui-font-size-base', typography?.baseFontSize);
  setNumericVar('--ui-line-height-base', typography?.baseLineHeight);
  setVar('--ui-heading-letter-spacing', typography?.headingLetterSpacing);
  setVar('--ui-section-label-letter-spacing', typography?.sectionLabelLetterSpacing);

  const layout = uiSettings?.layout;
  setPixelVar('--ui-nav-height', layout?.navHeight);
  setVar('--ui-layout-container-max-width', layout?.containerMaxWidth);
  setVar('--ui-spacing-section-compact', layout?.sectionPaddingCompact);
  setVar('--ui-spacing-section-regular', layout?.sectionPaddingRegular);
  setVar('--ui-spacing-section-spacious', layout?.sectionPaddingSpacious);
  setVar('--ui-spacing-hero-compact', layout?.heroPaddingCompact);
  setVar('--ui-spacing-hero-regular', layout?.heroPaddingRegular);
  setVar('--ui-spacing-hero-spacious', layout?.heroPaddingSpacious);
  setVar('--ui-spacing-mobile-section', layout?.mobileSectionPadding);

  const buttons = uiSettings?.buttons;
  setPixelVar('--ui-button-radius', buttons?.radius);
  setVar('--ui-button-primary-bg', buttons?.primaryBackground);
  setVar('--ui-button-primary-bg-hover', buttons?.primaryBackgroundHover);
  setVar('--ui-button-primary-text', buttons?.primaryText);
  setVar('--ui-button-secondary-bg', buttons?.secondaryBackground);
  setVar('--ui-button-secondary-bg-hover', buttons?.secondaryBackgroundHover);
  setVar('--ui-button-secondary-text', buttons?.secondaryText);
  setVar('--ui-button-secondary-text-hover', buttons?.secondaryTextHover);
  setVar('--ui-button-ghost-bg', buttons?.ghostBackground);
  setVar('--ui-button-ghost-bg-hover', buttons?.ghostBackgroundHover);
  setVar('--ui-button-ghost-text', buttons?.ghostText);
  setVar('--ui-button-nav-bg', buttons?.navBackground);
  setVar('--ui-button-nav-bg-hover', buttons?.navBackgroundHover);
  setVar('--ui-button-nav-text', buttons?.navText);
  setPixelVar('--ui-card-radius', layout?.cardRadius);

  return variables as CSSProperties;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();
  const [siteSettings, uiSettings] = await Promise.all([getSiteSettings(), getUISettings()]);

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
  const uiVariableStyles = buildUIVariableStyles(uiSettings);
  const headingFontUrl = getSafeStylesheetUrl(uiSettings?.typography?.headingFontUrl);
  const bodyFontUrl = getSafeStylesheetUrl(uiSettings?.typography?.bodyFontUrl);

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        {headingFontUrl && <link rel="stylesheet" href={headingFontUrl} />}
        {bodyFontUrl && <link rel="stylesheet" href={bodyFontUrl} />}
      </head>
      <body style={uiVariableStyles}>
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
          primaryCtaLabel={siteSettings?.primaryCtaLabel}
          primaryCtaHref={siteSettings?.primaryCtaHref}
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
