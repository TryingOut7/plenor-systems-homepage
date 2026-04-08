import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import { OrgEventCard } from '@/components/org-site/OrgCards';
import {
  EVENT_STATUSES,
  EVENT_STATUS_CURRENT_ONGOING,
  EVENT_STATUS_PAST_COMPLETED,
  EVENT_STATUS_UPCOMING_PLANNED,
  type EventStatus,
} from '@/domain/org-site/constants';
import { getOrgEventsByStatus } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  [EVENT_STATUS_UPCOMING_PLANNED]: 'Upcoming / Planned',
  [EVENT_STATUS_CURRENT_ONGOING]: 'Current / Ongoing',
  [EVENT_STATUS_PAST_COMPLETED]: 'Past / Completed',
} as Record<EventStatus, string>;

function resolveRequestedStatus(value: string | undefined): EventStatus {
  if (!value) return EVENT_STATUS_UPCOMING_PLANNED;
  return EVENT_STATUSES.includes(value as EventStatus)
    ? (value as EventStatus)
    : EVENT_STATUS_UPCOMING_PLANNED;
}

export async function generateMetadata(): Promise<Metadata> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return {};

  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteUrl = resolveSiteUrl(settings);
  const canonicalUrl = `${siteUrl}${buildCommunityHref(basePath, 'events')}`;

  return {
    title: 'Events',
    description: 'Browse upcoming, current, and past community events.',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: 'Events',
      description: 'Browse upcoming, current, and past community events.',
      url: canonicalUrl,
    },
  };
}

export default async function OrgEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedSearchParams = await searchParams;
  const activeStatus = resolveRequestedStatus(resolvedSearchParams.status);
  const cmsReadOptions = await getCmsReadOptions();

  const [upcomingEvents, currentEvents, pastEvents] = await Promise.all([
    getOrgEventsByStatus(EVENT_STATUS_UPCOMING_PLANNED, cmsReadOptions),
    getOrgEventsByStatus(EVENT_STATUS_CURRENT_ONGOING, cmsReadOptions),
    getOrgEventsByStatus(EVENT_STATUS_PAST_COMPLETED, cmsReadOptions),
  ]);

  const eventsByStatus: Record<EventStatus, Awaited<ReturnType<typeof getOrgEventsByStatus>>> = {
    [EVENT_STATUS_UPCOMING_PLANNED]: upcomingEvents,
    [EVENT_STATUS_CURRENT_ONGOING]: currentEvents,
    [EVENT_STATUS_PAST_COMPLETED]: pastEvents,
  } as Record<EventStatus, Awaited<ReturnType<typeof getOrgEventsByStatus>>>;

  const eventsRootHref = buildCommunityHref(basePath, 'events');
  const navItems = EVENT_STATUSES.map((status) => ({
    label: EVENT_STATUS_LABEL[status],
    href: `${eventsRootHref}?status=${status}`,
  }));

  const activeEvents = eventsByStatus[activeStatus];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        Events
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '10px', fontSize: 'clamp(32px, 5vw, 52px)' }}>
        Community Events
      </h1>
      <p style={{ marginTop: 0, marginBottom: '24px', color: 'var(--ui-color-text-muted)', maxWidth: '72ch' }}>
        Event status is editorial and controlled in CMS. Use the tabs to browse each event bucket.
      </p>

      <OrgSecondaryNav navLabel="Event status" items={navItems} activeHref={`${eventsRootHref}?status=${activeStatus}`} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '24px',
          color: 'var(--ui-color-text-muted)',
          fontSize: '14px',
        }}
      >
        {EVENT_STATUSES.map((status) => (
          <span
            key={status}
            style={{
              border: '1px solid var(--ui-color-border)',
              borderRadius: '999px',
              padding: '6px 10px',
              backgroundColor: status === activeStatus ? 'rgba(27,45,79,0.08)' : 'transparent',
            }}
          >
            {EVENT_STATUS_LABEL[status]}: {eventsByStatus[status].length}
          </span>
        ))}
      </div>

      {activeEvents.length === 0 ? (
        <p style={{ color: 'var(--ui-color-text-muted)' }}>
          No events are currently listed in the {EVENT_STATUS_LABEL[activeStatus]} bucket.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '22px',
          }}
        >
          {activeEvents.map((event) => (
            <OrgEventCard
              key={event.id}
              event={event}
              href={buildCommunityHref(basePath, `events/${event.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
