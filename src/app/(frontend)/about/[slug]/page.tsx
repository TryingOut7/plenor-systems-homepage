import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  ABOUT_SECONDARY_NAV_ITEMS,
  inferAboutProfileLabel,
} from '@/lib/plenor-site';
import { getAboutProfileBySlug, getSiteSettings } from '@/payload/cms';
import { resolveSiteUrl } from '@/lib/site-config';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const [profile, settings] = await Promise.all([
    getAboutProfileBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);

  if (!profile) return {};

  const siteName = settings?.siteName || 'Plenor.ai';
  return {
    title: `${profile.name} | About | ${siteName}`,
    description: profile.shortBio || 'About profile detail page.',
  };
}

export default async function AboutProfileDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const [profile, siteSettings] = await Promise.all([
    getAboutProfileBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);
  if (!profile) notFound();

  const siteUrl = resolveSiteUrl(siteSettings);
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: profile.name,
    description: profile.shortBio || undefined,
    url: `${siteUrl}/about/${profile.slug}`,
  };

  const activeSection =
    profile.category === 'founder'
      ? '/about?section=founder'
      : profile.category === 'mentor'
        ? '/about?section=leadership'
        : '/about';

  return (
    <article style={{ maxWidth: '920px', margin: '0 auto', padding: '64px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <OrgSecondaryNav
        items={ABOUT_SECONDARY_NAV_ITEMS}
        activeHref={activeSection}
        navLabel="About sections"
      />
      <p className="section-label" style={{ marginBottom: '12px' }}>
        {inferAboutProfileLabel(profile.category)}
      </p>
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.125rem)',
          lineHeight: 1.1,
          margin: '0 0 16px',
          color: 'var(--ui-color-primary)',
        }}
      >
        {profile.name}
      </h1>
      {profile.roleTitle ? (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--ui-color-text-muted)',
            margin: '0 0 24px',
          }}
        >
          {profile.roleTitle}
        </p>
      ) : null}
      {profile.shortBio ? (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--ui-color-text-muted)',
            margin: '0 0 32px',
          }}
        >
          {profile.shortBio}
        </p>
      ) : null}

      {profile.detailContent ? (
        <RichText
          data={profile.detailContent as SerializedEditorState}
          style={{ color: 'var(--ui-color-text)' }}
        />
      ) : null}
    </article>
  );
}
