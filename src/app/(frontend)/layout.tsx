import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { draftMode } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DraftModeBanner from '@/components/DraftModeBanner';
import PayloadLivePreviewRefresh from '@/components/PayloadLivePreviewRefresh';
import SkipLink from '@/components/SkipLink';
import { getSiteSettings } from '@/payload/cms';
import {
  resolveContactEmail,
  resolveSiteName,
  resolveSiteUrl,
  resolveTwitterHandle,
} from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

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
    `${siteName} helps founders and growing businesses create execution-ready product definitions and system specifications for AI tools and engineering teams.`;
  const defaultTitle =
    settings?.defaultSeo?.metaTitle ||
    `${siteName} | Execution-Ready Product Definitions`;

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
  const siteSettings = await getSiteSettings(cmsReadOptions);

  const siteName = resolveSiteName(siteSettings);
  const siteUrl = resolveSiteUrl(siteSettings);
  const contactEmail = resolveContactEmail(siteSettings);

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
  const livePreviewServerURL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteUrl);

  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <SkipLink />
        <Navbar />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
        <Footer />
        {isDraftMode && <PayloadLivePreviewRefresh serverURL={livePreviewServerURL} />}
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
