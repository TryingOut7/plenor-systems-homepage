import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  INSIGHT_CATEGORY_OPTIONS,
  INSIGHT_SECONDARY_NAV_ITEMS,
  getOptionLabel,
} from '@/lib/plenor-site';
import { getInsightEntries, getInsightEntryBySlug, getSiteSettings } from '@/payload/cms';
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
    getInsightEntryBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);

  if (!entry) return {};

  const siteName = settings?.siteName || 'Plenor.ai';
  return {
    title: `${entry.title} | Insights | ${siteName}`,
    description: entry.excerpt || 'Insight detail page.',
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const [entry, allInsights, siteSettings] = await Promise.all([
    getInsightEntryBySlug(resolvedParams.slug),
    getInsightEntries(),
    getSiteSettings(),
  ]);
  if (!entry) notFound();

  const siteUrl = resolveSiteUrl(siteSettings);

  const relatedInsights = allInsights
    .filter((item) => item.slug !== entry.slug && item.category === entry.category)
    .slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.excerpt || undefined,
    url: `${siteUrl}/insights/${entry.slug}`,
    datePublished: entry.publishedAt,
    author: {
      '@type': 'Person',
      name: entry.authorLabel || 'Plenor.ai',
    },
  };

  return (
    <article style={{ maxWidth: '920px', margin: '0 auto', padding: '64px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <OrgSecondaryNav
        items={INSIGHT_SECONDARY_NAV_ITEMS}
        activeHref={
          entry.category ? `/insights?category=${entry.category}` : '/insights'
        }
        navLabel="Insights sections"
      />
      <p className="section-label" style={{ marginBottom: '12px' }}>
        {getOptionLabel(INSIGHT_CATEGORY_OPTIONS, entry.category)}
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
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          marginBottom: '24px',
          color: 'var(--ui-color-text-muted)',
          fontSize: '14px',
        }}
      >
        {entry.authorLabel ? <span>{entry.authorLabel}</span> : null}
        {entry.publishedAt ? (
          <span>{new Date(entry.publishedAt).toLocaleDateString()}</span>
        ) : null}
      </div>
      {entry.excerpt ? (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--ui-color-text-muted)',
            margin: '0 0 32px',
          }}
        >
          {entry.excerpt}
        </p>
      ) : null}

      {entry.body ? (
        <RichText
          data={entry.body as SerializedEditorState}
          style={{ color: 'var(--ui-color-text)' }}
        />
      ) : null}

      {relatedInsights.length ? (
        <section style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--ui-color-primary)' }}>
            Related insights
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {relatedInsights.map((item) => (
              <li key={item.id || item.slug} style={{ marginBottom: '8px' }}>
                <Link href={`/insights/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
