import Image from 'next/image';
import Link from 'next/link';
import type { OrgAboutProfile, OrgEvent, OrgLearning, OrgSpotlight } from '@/payload-types';
import {
  extractMediaAsset,
  formatEventDateLabel,
  formatEventDateRange,
  formatEventTimeLabel,
} from '@/lib/org-site-helpers';

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="feature-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
      }}
    >
      {children}
    </article>
  );
}

function MediaOrPlaceholder({
  src,
  alt,
  width,
  height,
  aspectRatio,
  fallbackLabel,
  placeholderSrc,
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  aspectRatio: string;
  fallbackLabel: string;
  placeholderSrc: string;
}) {
  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio,
          borderRadius: '8px',
          border: '1px solid var(--ui-color-border)',
          display: 'grid',
          gap: '8px',
          placeItems: 'center',
          padding: '10px',
          color: 'var(--ui-color-text-muted)',
          background:
            'linear-gradient(135deg, rgba(27,45,79,0.06) 0%, rgba(27,45,79,0.02) 60%, rgba(255,255,255,0.8) 100%)',
          fontSize: '13px',
        }}
      >
        <Image
          src={placeholderSrc}
          alt={`${fallbackLabel} placeholder`}
          width={width || 1200}
          height={height || 675}
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            aspectRatio,
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width || 1200}
      height={height || 675}
      style={{
        width: '100%',
        height: 'auto',
        aspectRatio,
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid var(--ui-color-border)',
      }}
    />
  );
}

export function OrgEventCard({ event, href }: { event: OrgEvent; href: string }) {
  const hero = extractMediaAsset(event.heroImage);

  return (
    <CardShell>
      <MediaOrPlaceholder
        src={hero?.url}
        alt={hero?.alt || event.title}
        width={hero?.width}
        height={hero?.height}
        aspectRatio="16 / 9"
        fallbackLabel="Event image"
        placeholderSrc="/media/qa-media.svg"
      />
      <p className="section-label" style={{ margin: 0 }}>
        {event.eventType.replace(/_/g, ' ')}
      </p>
      <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ui-color-primary)' }}>{event.title}</h3>
      <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
        {formatEventDateRange(event.startDate, event.endDate, event.eventTimezone)}
      </p>
      <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
        {formatEventTimeLabel(event.startDate, event.eventTimezone)}
      </p>
      <p style={{ margin: 0, color: 'var(--ui-color-text)', lineHeight: 1.6 }}>{event.shortSummary}</p>
      <p style={{ margin: 'auto 0 0', paddingTop: '10px' }}>
        <Link href={href} style={{ fontWeight: 700, color: 'var(--ui-color-primary)' }}>
          View event
        </Link>
      </p>
    </CardShell>
  );
}

export function OrgSpotlightCard({
  spotlight,
  href,
}: {
  spotlight: OrgSpotlight;
  href: string;
}) {
  const image = extractMediaAsset(spotlight.thumbnailImage);

  return (
    <CardShell>
      <MediaOrPlaceholder
        src={image?.url}
        alt={image?.alt || spotlight.name}
        width={image?.width}
        height={image?.height}
        aspectRatio="1 / 1"
        fallbackLabel="Spotlight image"
        placeholderSrc="/media/qa-media-1.svg"
      />
      <p className="section-label" style={{ margin: 0 }}>
        {spotlight.category.replace(/_/g, ' ')}
      </p>
      <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ui-color-primary)' }}>{spotlight.name}</h3>
      {spotlight.roleTitle ? (
        <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>{spotlight.roleTitle}</p>
      ) : null}
      <p style={{ margin: 0, color: 'var(--ui-color-text)', lineHeight: 1.6 }}>{spotlight.shortSummary}</p>
      <p style={{ margin: 'auto 0 0', paddingTop: '10px' }}>
        <Link href={href} style={{ fontWeight: 700, color: 'var(--ui-color-primary)' }}>
          Read spotlight
        </Link>
      </p>
    </CardShell>
  );
}

export function OrgLearningCard({
  learning,
  href,
}: {
  learning: OrgLearning;
  href: string;
}) {
  const image = extractMediaAsset(learning.thumbnail);

  return (
    <CardShell>
      <MediaOrPlaceholder
        src={image?.url}
        alt={image?.alt || learning.title}
        width={image?.width}
        height={image?.height}
        aspectRatio="4 / 3"
        fallbackLabel="Learning image"
        placeholderSrc="/media/qa-media-2.svg"
      />
      <p className="section-label" style={{ margin: 0 }}>
        {learning.category.replace(/_/g, ' ')}
      </p>
      <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ui-color-primary)' }}>{learning.title}</h3>
      {learning.author ? (
        <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>{learning.author}</p>
      ) : null}
      <p style={{ margin: 0, color: 'var(--ui-color-text)', lineHeight: 1.6 }}>{learning.shortSummary}</p>
      <p style={{ margin: 'auto 0 0', paddingTop: '10px' }}>
        <Link href={href} style={{ fontWeight: 700, color: 'var(--ui-color-primary)' }}>
          Explore resource
        </Link>
      </p>
    </CardShell>
  );
}

export function OrgAboutCard({
  profile,
  href,
}: {
  profile: OrgAboutProfile;
  href: string;
}) {
  const image = extractMediaAsset(profile.profileImage);

  return (
    <CardShell>
      <MediaOrPlaceholder
        src={image?.url}
        alt={image?.alt || profile.name}
        width={image?.width}
        height={image?.height}
        aspectRatio="1 / 1"
        fallbackLabel="Profile image"
        placeholderSrc="/media/qa-media-1.svg"
      />
      <p className="section-label" style={{ margin: 0 }}>
        {profile.category.replace(/_/g, ' ')}
      </p>
      <h3 style={{ margin: 0, fontSize: '22px', color: 'var(--ui-color-primary)' }}>{profile.name}</h3>
      {profile.roleTitle ? (
        <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
          {profile.roleTitle}
        </p>
      ) : null}
      <p style={{ margin: 0, color: 'var(--ui-color-text)', lineHeight: 1.6 }}>{profile.shortBio}</p>
      <p style={{ margin: 'auto 0 0', paddingTop: '10px' }}>
        <Link href={href} style={{ fontWeight: 700, color: 'var(--ui-color-primary)' }}>
          View profile
        </Link>
      </p>
    </CardShell>
  );
}

export function EventDateLine({ event }: { event: OrgEvent }) {
  return (
    <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '15px' }}>
      {formatEventDateLabel(event.startDate, event.eventTimezone)}
    </p>
  );
}
