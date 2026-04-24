import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  SOLUTION_CATEGORY_OPTIONS,
  SOLUTION_SECONDARY_NAV_ITEMS,
  getOptionLabel,
} from '@/lib/plenor-site';
import { getSiteSettings, getSolutionEntryBySlug } from '@/payload/cms';
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
  const [entry, settings] = await Promise.all([
    getSolutionEntryBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);

  if (!entry) return {};

  const siteName = settings?.siteName || 'Plenor.ai';
  return {
    title: `${entry.title} | Solutions | ${siteName}`,
    description: entry.summary || 'Solution detail page.',
  };
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const [entry, siteSettings] = await Promise.all([
    getSolutionEntryBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);
  if (!entry) notFound();

  const siteUrl = resolveSiteUrl(siteSettings);
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: entry.title,
    description: entry.summary || undefined,
    url: `${siteUrl}/solutions/${entry.slug}`,
  };

  return (
    <article style={{ maxWidth: '920px', margin: '0 auto', padding: '64px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <OrgSecondaryNav
        items={SOLUTION_SECONDARY_NAV_ITEMS}
        activeHref={
          entry.category ? `/solutions?category=${entry.category}` : '/solutions'
        }
        navLabel="Solutions sections"
      />
      <p className="section-label" style={{ marginBottom: '12px' }}>
        {getOptionLabel(SOLUTION_CATEGORY_OPTIONS, entry.category)}
      </p>
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.125rem)',
          lineHeight: 1.1,
          margin: '0 0 16px',
          color: 'var(--ui-color-primary)',
        }}
      >
        {entry.title}
      </h1>
      {entry.summary ? (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--ui-color-text-muted)',
            margin: '0 0 32px',
          }}
        >
          {entry.summary}
        </p>
      ) : null}

      {entry.body ? (
        <RichText
          data={entry.body as SerializedEditorState}
          style={{ color: 'var(--ui-color-text)' }}
        />
      ) : null}

      {entry.relatedInsights?.length ? (
        <section style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--ui-color-primary)' }}>
            Related insights
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {entry.relatedInsights
              .filter((item) => item.slug && item.title)
              .map((item) => (
                <li key={item.id || item.slug} style={{ marginBottom: '8px' }}>
                  <Link href={`/insights/${item.slug}`}>{item.title}</Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <p style={{ marginTop: '40px' }}>
        <Link href={entry.ctaPath || '/contact'} className="btn-primary">
          Start an inquiry
        </Link>
      </p>
    </article>
  );
}
