import Link from 'next/link';
import {
  OrgEventCard,
  OrgLearningCard,
  OrgSpotlightCard,
} from '@/components/org-site/OrgCards';
import {
  getOrgEventsByStatus,
  getOrgHomeFeatures,
  getOrgLearningByCategory,
  getOrgSpotlightByCategory,
} from '@/lib/org-site-feed';
import {
  EVENT_STATUSES,
  LEARNING_CATEGORIES,
  SPOTLIGHT_CATEGORIES,
  type EventStatus,
  type LearningCategory,
  type SpotlightCategory,
} from '@/lib/org-site-helpers';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import type { OrgEvent, OrgLearning, OrgSpotlight } from '@/payload-types';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

type FeedType = 'events' | 'spotlight' | 'learning';
type SourceMode = 'featured' | 'manual' | 'automatic';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseFeedType(value: unknown): FeedType {
  return value === 'spotlight' || value === 'learning' ? value : 'events';
}

function parseSourceMode(value: unknown): SourceMode {
  return value === 'manual' || value === 'automatic' ? value : 'featured';
}

function parseLimit(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(Math.trunc(value), 1), 12);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.min(Math.max(Math.trunc(parsed), 1), 12);
  }
  return 3;
}

function parseColumns(value: unknown): '1' | '2' | '3' | '4' {
  return value === '1' || value === '2' || value === '4' ? value : '3';
}

function parseEventStatus(value: unknown): EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus)
    ? (value as EventStatus)
    : EVENT_STATUSES[0];
}

function parseSpotlightCategory(value: unknown): SpotlightCategory {
  return SPOTLIGHT_CATEGORIES.includes(value as SpotlightCategory)
    ? (value as SpotlightCategory)
    : SPOTLIGHT_CATEGORIES[0];
}

function parseLearningCategory(value: unknown): LearningCategory {
  return LEARNING_CATEGORIES.includes(value as LearningCategory)
    ? (value as LearningCategory)
    : LEARNING_CATEGORIES[0];
}

function relationDocs<T>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is T,
): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(predicate);
}

function isOrgEventDoc(value: unknown): value is OrgEvent {
  const record = asRecord(value);
  return (
    (typeof record.id === 'string' || typeof record.id === 'number') &&
    typeof record.slug === 'string' &&
    typeof record.title === 'string' &&
    typeof record.shortSummary === 'string' &&
    typeof record.eventType === 'string' &&
    typeof record.startDate === 'string'
  );
}

function isOrgSpotlightDoc(value: unknown): value is OrgSpotlight {
  const record = asRecord(value);
  return (
    (typeof record.id === 'string' || typeof record.id === 'number') &&
    typeof record.slug === 'string' &&
    typeof record.name === 'string' &&
    typeof record.shortSummary === 'string' &&
    typeof record.category === 'string'
  );
}

function isOrgLearningDoc(value: unknown): value is OrgLearning {
  const record = asRecord(value);
  return (
    (typeof record.id === 'string' || typeof record.id === 'number') &&
    typeof record.slug === 'string' &&
    typeof record.title === 'string' &&
    typeof record.shortSummary === 'string' &&
    typeof record.category === 'string'
  );
}

const DEFAULT_HEADING: Record<FeedType, string> = {
  events: 'Featured Events',
  spotlight: 'Stories from the Community',
  learning: 'Resources and Mentorship',
};

const DEFAULT_CTA: Record<FeedType, { label: string; suffix: string }> = {
  events: { label: 'Browse all events', suffix: 'events' },
  spotlight: { label: 'Explore spotlight', suffix: `spotlight/${SPOTLIGHT_CATEGORIES[0]}` },
  learning: { label: 'Explore learning', suffix: `learning/${LEARNING_CATEGORIES[0]}` },
};

const GRID_COLUMNS: Record<'1' | '2' | '3' | '4', string> = {
  '1': '1fr',
  '2': 'repeat(auto-fit, minmax(280px, 1fr))',
  '3': 'repeat(auto-fit, minmax(240px, 1fr))',
  '4': 'repeat(auto-fit, minmax(220px, 1fr))',
};

async function OrgFeedSectionServer({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return null;

  const sectionRecord = asSectionRecord(section);

  const feedType = parseFeedType(sectionRecord.feedType);
  const sourceMode = parseSourceMode(sectionRecord.sourceMode);
  const limit = parseLimit(sectionRecord.limit);
  const columns = parseColumns(sectionRecord.columns);

  const cmsReadOptions = await getCmsReadOptions();

  let events: OrgEvent[] = [];
  let spotlight: OrgSpotlight[] = [];
  let learning: OrgLearning[] = [];
  let emptyPlaceholder: string | null = null;

  if (feedType === 'events') {
    if (sourceMode === 'manual') {
      events = relationDocs(sectionRecord.manualEvents, isOrgEventDoc);
    } else if (sourceMode === 'automatic') {
      events = await getOrgEventsByStatus(
        parseEventStatus(sectionRecord.eventStatus),
        cmsReadOptions,
      );
    } else {
      const homeFeatures = await getOrgHomeFeatures(cmsReadOptions);
      events = homeFeatures.events.items;
      emptyPlaceholder = homeFeatures.events.placeholder;
    }
    events = events.slice(0, limit);
  }

  if (feedType === 'spotlight') {
    if (sourceMode === 'manual') {
      spotlight = relationDocs(sectionRecord.manualSpotlight, isOrgSpotlightDoc);
    } else if (sourceMode === 'automatic') {
      spotlight = await getOrgSpotlightByCategory(
        parseSpotlightCategory(sectionRecord.spotlightCategory),
        cmsReadOptions,
      );
    } else {
      const homeFeatures = await getOrgHomeFeatures(cmsReadOptions);
      spotlight = homeFeatures.spotlight.items;
      emptyPlaceholder = homeFeatures.spotlight.placeholder;
    }
    spotlight = spotlight.slice(0, limit);
  }

  if (feedType === 'learning') {
    if (sourceMode === 'manual') {
      learning = relationDocs(sectionRecord.manualLearning, isOrgLearningDoc);
    } else if (sourceMode === 'automatic') {
      learning = await getOrgLearningByCategory(
        parseLearningCategory(sectionRecord.learningCategory),
        cmsReadOptions,
      );
    } else {
      const homeFeatures = await getOrgHomeFeatures(cmsReadOptions);
      learning = homeFeatures.learning.items;
      emptyPlaceholder = homeFeatures.learning.placeholder;
    }
    learning = learning.slice(0, limit);
  }

  const heading = readString(sectionRecord.heading) || DEFAULT_HEADING[feedType];
  const subheading = readString(sectionRecord.subheading);
  const includeCta = sectionRecord.includeCta !== false;
  const ctaLabel = readString(sectionRecord.ctaLabel) || DEFAULT_CTA[feedType].label;
  const ctaHref =
    readString(sectionRecord.ctaHref) ||
    buildCommunityHref(basePath, DEFAULT_CTA[feedType].suffix);

  const cards =
    feedType === 'events'
      ? events.map((event) => (
          <OrgEventCard
            key={`${sectionKey}-event-${String(event.id)}`}
            event={event}
            href={buildCommunityHref(basePath, `events/${event.slug}`)}
          />
        ))
      : feedType === 'spotlight'
        ? spotlight.map((entry) => (
            <OrgSpotlightCard
              key={`${sectionKey}-spotlight-${String(entry.id)}`}
              spotlight={entry}
              href={buildCommunityHref(
                basePath,
                `spotlight/${entry.category}/${entry.slug}`,
              )}
            />
          ))
        : learning.map((entry) => (
            <OrgLearningCard
              key={`${sectionKey}-learning-${String(entry.id)}`}
              learning={entry}
              href={buildCommunityHref(basePath, `learning/${entry.category}/${entry.slug}`)}
            />
          ));

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={sectionStyle}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      <div style={innerStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: cards.length > 0 ? '18px' : '10px',
          }}
        >
          <div style={{ maxWidth: '72ch' }}>
            {heading ? (
              <SectionHeading
                tag={hTag}
                style={{ marginTop: 0, marginBottom: subheading ? '8px' : 0, color: resolvedHeadingColor }}
                fontSize={hFontSize}
              >
                {heading}
              </SectionHeading>
            ) : null}
            {subheading ? (
              <p style={{ marginTop: 0, marginBottom: 0, color: resolvedMutedColor }}>
                {subheading}
              </p>
            ) : null}
          </div>
          {includeCta && ctaLabel && ctaHref ? (
            <Link href={ctaHref} className="btn-secondary" style={{ width: 'auto' }}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        {cards.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLUMNS[columns],
              gap: '22px',
            }}
          >
            {cards}
          </div>
        ) : (
          <p style={{ margin: 0, color: resolvedMutedColor }}>
            {emptyPlaceholder || 'No published items available yet.'}
          </p>
        )}
      </div>
    </section>
  );
}

export default function OrgFeedSection(props: SectionRendererProps) {
  return <OrgFeedSectionServer {...props} />;
}
