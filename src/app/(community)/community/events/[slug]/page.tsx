import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgEventBySlug } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import {
  buildCommunityHref,
  extractMediaAsset,
  formatEventDateRange,
  formatEventTimeLabel,
} from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';
import type { OrgEvent } from '@/payload-types';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

function eventCanonicalUrl(siteUrl: string, basePath: string, slug: string): string {
  return `${siteUrl}${buildCommunityHref(basePath, `events/${slug}`)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return {};

  const resolvedParams = await params;
  const cmsReadOptions = await getCmsReadOptions();
  const [event, settings] = await Promise.all([
    getOrgEventBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!event) return {};

  const siteUrl = resolveSiteUrl(settings);
  const canonical = eventCanonicalUrl(siteUrl, basePath, resolvedParams.slug);
  const hero = extractMediaAsset(event.heroImage);
  const seo = event.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || event.title || defaultSeo.metaTitle || 'Event';
  const description = seo.metaDescription || event.shortSummary || defaultSeo.metaDescription || '';
  const ogImage = seo.ogImage && typeof seo.ogImage === 'object'
    ? extractMediaAsset(seo.ogImage)?.url
    : hero?.url || defaultSeo.ogImage?.url;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

function relatedLinksForEvent(event: OrgEvent, basePath: string): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];

  if (Array.isArray(event.relatedSpotlight)) {
    for (const entry of event.relatedSpotlight) {
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.slug !== 'string' || typeof entry.category !== 'string') continue;
      if (typeof entry.name !== 'string') continue;
      links.push({
        label: entry.name,
        href: buildCommunityHref(basePath, `spotlight/${entry.category}/${entry.slug}`),
      });
    }
  }

  if (Array.isArray(event.relatedLearning)) {
    for (const entry of event.relatedLearning) {
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.slug !== 'string' || typeof entry.category !== 'string') continue;
      if (typeof entry.title !== 'string') continue;
      links.push({
        label: entry.title,
        href: buildCommunityHref(basePath, `learning/${entry.category}/${entry.slug}`),
      });
    }
  }

  return links;
}

export default async function OrgEventDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const cmsReadOptions = await getCmsReadOptions();
  const [event, settings] = await Promise.all([
    getOrgEventBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!event) notFound();

  const siteUrl = resolveSiteUrl(settings);
  const canonical = eventCanonicalUrl(siteUrl, basePath, resolvedParams.slug);
  const hero = extractMediaAsset(event.heroImage);
  const relatedLinks = relatedLinksForEvent(event, basePath);

  const eventStructuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    url: canonical,
  };

  const locationName = event.venue || event.location || null;
  if (locationName) {
    eventStructuredData.location = {
      '@type': 'Place',
      name: event.venue || locationName,
      ...(event.location ? { address: event.location } : {}),
    };
  }

  return (
    <article style={{ maxWidth: '980px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData) }}
      />

      <p className="section-label" style={{ marginBottom: '8px' }}>
        {event.eventType.replace(/_/g, ' ')}
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '14px', fontSize: 'clamp(34px, 5vw, 56px)' }}>
        {event.title}
      </h1>
      <p style={{ marginTop: 0, marginBottom: '24px', color: 'var(--ui-color-text-muted)' }}>
        Status: {event.eventStatus.replace(/_/g, ' ')}
      </p>

      <div
        style={{
          border: '1px solid var(--ui-color-border)',
          borderRadius: '10px',
          padding: '18px',
          marginBottom: '24px',
          display: 'grid',
          gap: '8px',
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Date:</strong> {formatEventDateRange(event.startDate, event.endDate, event.eventTimezone)}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Time:</strong> {formatEventTimeLabel(event.startDate, event.eventTimezone)}
        </p>
        {event.venue ? (
          <p style={{ margin: 0 }}>
            <strong>Venue:</strong> {event.venue}
          </p>
        ) : null}
        {event.location ? (
          <p style={{ margin: 0 }}>
            <strong>Location:</strong> {event.location}
          </p>
        ) : null}
      </div>

      {hero?.url ? (
        <Image
          src={hero.url}
          alt={hero.alt || event.title}
          width={hero.width || 1200}
          height={hero.height || 675}
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            borderRadius: '12px',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '24px',
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '12px',
            border: '1px dashed var(--ui-color-border)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--ui-color-text-muted)',
            marginBottom: '24px',
            backgroundColor: 'var(--ui-color-section-alt)',
          }}
        >
          Event image
        </div>
      )}

      <p style={{ marginTop: 0, marginBottom: '22px', color: 'var(--ui-color-text)', lineHeight: 1.7 }}>
        {event.shortSummary}
      </p>

      {event.description ? (
        <RichText data={event.description as SerializedEditorState} />
      ) : null}

      {event.registrationRequired ? (
        <section
          style={{
            marginTop: '32px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Registration</h2>
          <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>
            Registration is required for this event.
          </p>
          <Link
            href={buildCommunityHref(basePath, `events/${event.slug}/register`)}
            className="btn-primary"
            style={{ width: 'auto' }}
          >
            Open registration
          </Link>
        </section>
      ) : null}

      {relatedLinks.length > 0 ? (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '12px' }}>Related community links</h2>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px' }}>
            {relatedLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div style={{ marginTop: '36px' }}>
        <Link href={buildCommunityHref(basePath, 'events')}>Back to all events</Link>
      </div>
    </article>
  );
}
