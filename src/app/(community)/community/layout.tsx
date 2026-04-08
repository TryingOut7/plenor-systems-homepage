import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SkipLink from '@/components/SkipLink';
import UIStyleInjector from '@/components/UIStyleInjector';
import { ABOUT_CATEGORIES, LEARNING_CATEGORIES, SPOTLIGHT_CATEGORIES } from '@/domain/org-site/constants';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { getSiteSettings, getUISettings } from '@/payload/cms';
import '../../(frontend)/globals.css';

const playfair = localFont({
  src: '../../../fonts/PlayfairDisplay-VariableFont_wght.ttf',
  variable: '--font-display',
  display: 'swap',
  weight: '400 900',
});

const dmSans = localFont({
  src: '../../../fonts/DMSans-VariableFont_opsz,wght.ttf',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 1000',
});

export const revalidate = 60;

export default async function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const [siteSettings, uiSettings] = await Promise.all([
    getSiteSettings(cmsReadOptions),
    getUISettings(cmsReadOptions),
  ]);

  const primaryCategoryHref = {
    spotlight: buildCommunityHref(basePath, `spotlight/${SPOTLIGHT_CATEGORIES[0]}`),
    learning: buildCommunityHref(basePath, `learning/${LEARNING_CATEGORIES[0]}`),
    about: buildCommunityHref(basePath, `about/${ABOUT_CATEGORIES[0]}`),
  };

  const communityNavLinks = [
    { label: 'Home', href: buildCommunityHref(basePath), isVisible: true },
    { label: 'Events', href: buildCommunityHref(basePath, 'events'), isVisible: true },
    { label: 'Community Spotlight', href: primaryCategoryHref.spotlight, isVisible: true },
    { label: 'Learning and Giving Back', href: primaryCategoryHref.learning, isVisible: true },
    { label: 'About', href: primaryCategoryHref.about, isVisible: true },
    { label: 'Sponsors', href: buildCommunityHref(basePath, 'sponsors'), isVisible: true },
  ];

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <UIStyleInjector uiSettings={uiSettings} />
      </head>
      <body>
        <SkipLink />
        <Navbar
          siteName={siteSettings?.siteName || 'Community'}
          navigationLinks={communityNavLinks}
          logoImage={
            siteSettings?.logoImage as
              | {
                  url?: string;
                  alt?: string;
                  width?: number;
                  height?: number;
                }
              | undefined
          }
          logoWidth={siteSettings?.logoWidth}
          headerButtons={[]}
        />
        <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
