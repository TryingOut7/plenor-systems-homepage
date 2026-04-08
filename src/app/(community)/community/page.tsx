import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrgEventCard, OrgLearningCard, OrgSpotlightCard } from '@/components/org-site/OrgCards';
import { LEARNING_CATEGORIES, SPOTLIGHT_CATEGORIES } from '@/domain/org-site/constants';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';
import { getOrgHomeFeatures } from '@/infrastructure/cms/orgSiteQueries';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return {};

  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteUrl = resolveSiteUrl(settings);
  const canonicalUrl = `${siteUrl}${buildCommunityHref(basePath)}`;

  return {
    title: 'Community',
    description:
      'Discover community events, spotlight stories, learning opportunities, and supporter initiatives.',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: 'Community',
      description:
        'Discover community events, spotlight stories, learning opportunities, and supporter initiatives.',
      url: canonicalUrl,
    },
  };
}

export default async function CommunityHomePage() {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const homeFeatures = await getOrgHomeFeatures(cmsReadOptions);

  const sections = homeFeatures.sectionOrder;

  const eventsVisible = homeFeatures.events.items.length > 0 || !!homeFeatures.events.placeholder;
  const spotlightVisible =
    homeFeatures.spotlight.items.length > 0 || !!homeFeatures.spotlight.placeholder;
  const learningVisible = homeFeatures.learning.items.length > 0 || !!homeFeatures.learning.placeholder;
  const sponsorsVisible = !!homeFeatures.sponsors;
  const anyVisible = eventsVisible || spotlightVisible || learningVisible || sponsorsVisible;
  const defaultSpotlightHref = buildCommunityHref(basePath, `spotlight/${SPOTLIGHT_CATEGORIES[0]}`);
  const defaultLearningHref = buildCommunityHref(basePath, `learning/${LEARNING_CATEGORIES[0]}`);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <section
        style={{
          marginBottom: '48px',
          padding: '34px',
          borderRadius: '14px',
          background:
            'linear-gradient(135deg, rgba(27,45,79,1) 0%, rgba(42,66,112,1) 65%, rgba(22,35,61,1) 100%)',
          color: '#fff',
        }}
      >
        <p className="section-label" style={{ marginTop: 0, marginBottom: '10px', color: 'rgba(255,255,255,0.74)' }}>
          Community
        </p>
        <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(32px, 5vw, 54px)', color: '#fff' }}>
          Welcome to the Community Hub
        </h1>
        <p style={{ margin: 0, maxWidth: '72ch', color: 'rgba(255,255,255,0.86)', lineHeight: 1.7 }}>
          Explore upcoming events, community stories, mentorship opportunities, and ways to support
          programs in one place.
        </p>
      </section>

      {!anyVisible ? (
        <section
          style={{
            border: '1px solid var(--ui-color-border)',
            borderRadius: '10px',
            padding: '20px',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Community content will appear here once it is published.
        </section>
      ) : null}

      {sections.map((section) => {
        if (section === 'events') {
          if (homeFeatures.events.items.length === 0 && !homeFeatures.events.placeholder) return null;
          return (
            <section key={section} style={{ marginBottom: '54px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px' }}>
                <div>
                  <p className="section-label" style={{ marginBottom: '10px' }}>
                    Events
                  </p>
                  <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: 'clamp(28px, 4.2vw, 42px)' }}>
                    Featured Events
                  </h2>
                </div>
                <Link href={buildCommunityHref(basePath, 'events')} className="btn-secondary" style={{ width: 'auto' }}>
                  Browse all events
                </Link>
              </div>
              {homeFeatures.events.items.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '22px',
                  }}
                >
                  {homeFeatures.events.items.map((event) => (
                    <OrgEventCard
                      key={event.id}
                      event={event}
                      href={buildCommunityHref(basePath, `events/${event.slug}`)}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--ui-color-text-muted)' }}>{homeFeatures.events.placeholder}</p>
              )}
            </section>
          );
        }

        if (section === 'spotlight') {
          if (
            homeFeatures.spotlight.items.length === 0 &&
            !homeFeatures.spotlight.placeholder
          ) {
            return null;
          }
          return (
            <section key={section} style={{ marginBottom: '54px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px' }}>
                <div>
                  <p className="section-label" style={{ marginBottom: '10px' }}>
                    Community Spotlight
                  </p>
                  <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: 'clamp(28px, 4.2vw, 42px)' }}>
                    Stories from the Community
                  </h2>
                </div>
                <Link
                  href={defaultSpotlightHref}
                  className="btn-secondary"
                  style={{ width: 'auto' }}
                >
                  Explore spotlight
                </Link>
              </div>
              {homeFeatures.spotlight.items.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '22px',
                  }}
                >
                  {homeFeatures.spotlight.items.map((spotlight) => (
                    <OrgSpotlightCard
                      key={spotlight.id}
                      spotlight={spotlight}
                      href={buildCommunityHref(
                        basePath,
                        `spotlight/${spotlight.category}/${spotlight.slug}`,
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--ui-color-text-muted)' }}>
                  {homeFeatures.spotlight.placeholder}
                </p>
              )}
            </section>
          );
        }

        if (section === 'learning') {
          if (homeFeatures.learning.items.length === 0 && !homeFeatures.learning.placeholder) return null;
          return (
            <section key={section} style={{ marginBottom: '54px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px' }}>
                <div>
                  <p className="section-label" style={{ marginBottom: '10px' }}>
                    Learning and Giving Back
                  </p>
                  <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: 'clamp(28px, 4.2vw, 42px)' }}>
                    Resources and Mentorship
                  </h2>
                </div>
                <Link
                  href={defaultLearningHref}
                  className="btn-secondary"
                  style={{ width: 'auto' }}
                >
                  Explore learning
                </Link>
              </div>
              {homeFeatures.learning.items.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '22px',
                  }}
                >
                  {homeFeatures.learning.items.map((learning) => (
                    <OrgLearningCard
                      key={learning.id}
                      learning={learning}
                      href={buildCommunityHref(
                        basePath,
                        `learning/${learning.category}/${learning.slug}`,
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--ui-color-text-muted)' }}>{homeFeatures.learning.placeholder}</p>
              )}
            </section>
          );
        }

        if (section === 'sponsors' && homeFeatures.sponsors) {
          return (
            <section
              key={section}
              style={{
                marginBottom: '20px',
                border: '1px solid var(--ui-color-border)',
                borderRadius: '12px',
                padding: '28px',
                backgroundColor: 'var(--ui-color-surface)',
              }}
            >
              <p className="section-label" style={{ marginBottom: '10px' }}>
                Sponsors
              </p>
              <h2 style={{ marginTop: 0, marginBottom: '10px' }}>{homeFeatures.sponsors.pageTitle}</h2>
              <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--ui-color-text-muted)' }}>
                Support programs, events, and learning opportunities for the community.
              </p>
              <Link href={buildCommunityHref(basePath, 'sponsors')} className="btn-primary" style={{ width: 'auto' }}>
                Visit sponsors page
              </Link>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
