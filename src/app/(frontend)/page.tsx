import type { Metadata } from 'next';
import Link from 'next/link';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { sortGovernedContent } from '@/lib/plenor-site';
import { resolveSiteName } from '@/lib/site-config';
import {
  getCollectionData,
  getFrameworkEntries,
  getInsightEntries,
  getSitePageBySlug,
  getSiteSettings,
  getSolutionEntries,
} from '@/payload/cms';
import type { PageSection, SitePage, Testimonial } from '@/payload/cms';

export const revalidate = 60;

const HOMEPAGE_CARD_LIMIT = 3;
const HOMEPAGE_PROOF_LIMIT = 2;
const HOME_RENDERABLE_SECTION_TYPES = new Set([
  'richTextSection',
  'splitSection',
  'featureGridSection',
  'statsSection',
  'simpleTableSection',
  'comparisonTableSection',
]);

type GovernedHomepageItem = {
  isFeatured?: boolean;
  orderingValue?: number;
  publishedAt?: string;
  title?: string;
  name?: string;
};

function selectHomepageItems<T extends GovernedHomepageItem>(items: T[], limit: number): T[] {
  const featuredItems = items.filter((item) => item.isFeatured);
  const source = featuredItems.length > 0 ? featuredItems : items;
  return sortGovernedContent(source).slice(0, limit);
}

function selectHomepageProof(testimonials: Testimonial[]): Testimonial[] {
  const featuredItems = testimonials.filter((item) => item.isFeatured);
  const source = featuredItems.length > 0 ? featuredItems : testimonials;
  return source.slice(0, HOMEPAGE_PROOF_LIMIT);
}

function extractHomeSections(sitePage: SitePage | null): {
  heroSection?: PageSection;
  positioningSection?: PageSection;
  ctaSection?: PageSection;
} {
  const sections = Array.isArray(sitePage?.sections) ? sitePage.sections : [];
  const heroSection = sections.find((section) => section.blockType === 'heroSection');
  const positioningSection = sections.find((section) =>
    HOME_RENDERABLE_SECTION_TYPES.has(section.blockType),
  );
  const ctaSection = sections.find(
    (section) => section.blockType === 'ctaSection' || section.blockType === 'formSection',
  );

  return {
    heroSection,
    positioningSection,
    ctaSection,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('home', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: '',
    page: sitePage,
    settings,
    fallbackTitle: `${siteName} — CMS-Driven Websites and Structured Delivery`,
    fallbackDescription:
      `${siteName} explains the Plenor method, showcases service offerings, and demonstrates the CMS-driven website model in production.`,
  });
}

export default async function HomePage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings, collectionData, frameworkEntries, solutionEntries, insightEntries] =
    await Promise.all([
      getSitePageBySlug('home', cmsReadOptions),
      getSiteSettings(cmsReadOptions),
      getCollectionData(cmsReadOptions),
      getFrameworkEntries(cmsReadOptions),
      getSolutionEntries(cmsReadOptions),
      getInsightEntries(cmsReadOptions),
    ]);

  const siteName = resolveSiteName(siteSettings);
  const { heroSection, positioningSection, ctaSection } = extractHomeSections(sitePage);
  const featuredFramework = selectHomepageItems(frameworkEntries, HOMEPAGE_CARD_LIMIT);
  const featuredSolutions = selectHomepageItems(solutionEntries, HOMEPAGE_CARD_LIMIT);
  const featuredInsights = selectHomepageItems(insightEntries, HOMEPAGE_CARD_LIMIT);
  const featuredProof = selectHomepageProof(collectionData.testimonials);
  const primaryCta = siteSettings?.headerButtons?.find(
    (button) => button?.isVisible !== false && typeof button?.href === 'string' && button.href,
  );
  const responseStatement =
    siteSettings?.inquiryForm?.responseStatement || 'We typically respond within two business days.';

  return (
    <>
      {sitePage ? <PageChromeOverrides page={sitePage} /> : null}
      {sitePage ? (
        <CmsPreviewDiffBanner summary={(sitePage as Record<string, unknown>).previewDiffSummary} />
      ) : null}

      {heroSection ? (
        <UniversalSections
          sections={[heroSection]}
          collections={collectionData}
          guideFormLabels={siteSettings?.guideForm}
          inquiryFormLabels={siteSettings?.inquiryForm}
          pageSlug="home"
        />
      ) : (
        <section
          style={{
            backgroundColor: 'var(--ui-color-hero-bg)',
            color: 'var(--ui-color-hero-text)',
            padding: 'var(--ui-spacing-hero-regular)',
          }}
        >
          <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>
            <p className="section-label" style={{ color: 'var(--ui-color-hero-muted)', marginBottom: '16px' }}>
              Plenor.ai
            </p>
            <h1
              style={{
                margin: '0 0 20px',
                maxWidth: '820px',
                fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                lineHeight: 1.05,
                color: 'var(--ui-color-hero-text)',
              }}
            >
              CMS-driven websites for professional services teams that want structure, not sprawl.
            </h1>
            <p
              style={{
                margin: '0 0 32px',
                maxWidth: '760px',
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--ui-color-hero-muted)',
              }}
            >
              {siteSettings?.brandTagline ||
                `${siteName} combines advisory thinking, implementation discipline, and governed CMS operations in one production-ready model.`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link href={primaryCta?.href || '/contact'} className="btn-primary">
                {primaryCta?.label || 'Start a Conversation'}
              </Link>
              <Link href="/framework" className="btn-ghost">
                Explore the Framework
              </Link>
            </div>
          </div>
        </section>
      )}

      {positioningSection ? (
        <UniversalSections
          sections={[positioningSection]}
          collections={collectionData}
          guideFormLabels={siteSettings?.guideForm}
          inquiryFormLabels={siteSettings?.inquiryForm}
          pageSlug="home"
        />
      ) : (
        <section style={{ padding: 'var(--ui-spacing-section-regular)' }}>
          <div
            style={{
              maxWidth: 'var(--ui-layout-container-max-width)',
              margin: '0 auto',
              display: 'grid',
              gap: '24px',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
            }}
          >
            <div>
              <p className="section-label" style={{ marginBottom: '12px' }}>
                What {siteName} Is
              </p>
              <h2
                style={{
                  margin: '0 0 16px',
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  lineHeight: 1.1,
                  color: 'var(--ui-color-primary)',
                }}
              >
                A professional services firm using its own governed CMS model in public.
              </h2>
              <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.8 }}>
                {siteName} is both the advisory business and the live demonstration of how the
                company works: structured content, governed configuration, reusable delivery
                patterns, and operational clarity without developer-maintained marketing pages.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'var(--ui-color-section-alt)',
                border: '1px solid var(--ui-color-border)',
                borderRadius: 'var(--ui-card-radius)',
                padding: '24px',
              }}
            >
              <p className="section-label" style={{ margin: '0 0 12px' }}>
                Built To Show The Model
              </p>
              <p style={{ margin: 0, color: 'var(--ui-color-text)', lineHeight: 1.75 }}>
                The site explains the Plenor method, publishes insights, and proves that a
                production website can stay editable, consistent, and governed through the CMS.
              </p>
            </div>
          </div>
        </section>
      )}

      {featuredFramework.length > 0 ? (
        <section style={{ padding: 'var(--ui-spacing-section-regular)' }}>
          <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Featured Framework Content
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'end',
                flexWrap: 'wrap',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 10px',
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    lineHeight: 1.1,
                    color: 'var(--ui-color-primary)',
                  }}
                >
                  How the Plenor approach works
                </h2>
                <p style={{ margin: 0, maxWidth: '720px', color: 'var(--ui-color-text-muted)', lineHeight: 1.75 }}>
                  Strategy, CMS operations, and delivery structure are documented as reusable,
                  governed entries instead of one-off narrative pages.
                </p>
              </div>
              <Link href="/framework" className="btn-secondary">
                View the Framework Section
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredFramework.map((entry) => (
                <article
                  key={entry.id || entry.slug}
                  style={{
                    backgroundColor: 'var(--ui-color-surface)',
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: 'var(--ui-card-radius)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.375rem', lineHeight: 1.3, color: 'var(--ui-color-primary)' }}>
                    {entry.title}
                  </h3>
                  {entry.summary ? (
                    <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}>
                      {entry.summary}
                    </p>
                  ) : null}
                  {entry.slug ? (
                    <p style={{ margin: 'auto 0 0' }}>
                      <Link href={`/framework/${entry.slug}`} style={{ fontWeight: 700 }}>
                        View framework entry
                      </Link>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featuredSolutions.length > 0 ? (
        <section
          style={{
            padding: 'var(--ui-spacing-section-regular)',
            backgroundColor: 'var(--ui-color-section-alt)',
          }}
        >
          <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Featured Solutions
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'end',
                flexWrap: 'wrap',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 10px',
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    lineHeight: 1.1,
                    color: 'var(--ui-color-primary)',
                  }}
                >
                  What {siteName} delivers for clients
                </h2>
                <p style={{ margin: 0, maxWidth: '720px', color: 'var(--ui-color-text-muted)', lineHeight: 1.75 }}>
                  From strategic definition to implementation and framework-led delivery, the
                  offer is structured as CMS-managed solution entries.
                </p>
              </div>
              <Link href="/solutions" className="btn-secondary">
                View the Solutions Section
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredSolutions.map((entry) => (
                <article
                  key={entry.id || entry.slug}
                  style={{
                    backgroundColor: 'var(--ui-color-surface)',
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: 'var(--ui-card-radius)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.375rem', lineHeight: 1.3, color: 'var(--ui-color-primary)' }}>
                    {entry.title}
                  </h3>
                  {entry.summary ? (
                    <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}>
                      {entry.summary}
                    </p>
                  ) : null}
                  {entry.slug ? (
                    <p style={{ margin: 'auto 0 0' }}>
                      <Link href={`/solutions/${entry.slug}`} style={{ fontWeight: 700 }}>
                        View solution entry
                      </Link>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featuredInsights.length > 0 ? (
        <section style={{ padding: 'var(--ui-spacing-section-regular)' }}>
          <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Selected Insights
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'end',
                flexWrap: 'wrap',
                marginBottom: '24px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 10px',
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    lineHeight: 1.1,
                    color: 'var(--ui-color-primary)',
                  }}
                >
                  Articles, essays, and practical guides
                </h2>
                <p style={{ margin: 0, maxWidth: '720px', color: 'var(--ui-color-text-muted)', lineHeight: 1.75 }}>
                  The insights area turns Plenor’s working knowledge into structured, publishable
                  CMS content rather than scattered thought pieces.
                </p>
              </div>
              <Link href="/insights" className="btn-secondary">
                View the Insights Section
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredInsights.map((entry) => (
                <article
                  key={entry.id || entry.slug}
                  style={{
                    backgroundColor: 'var(--ui-color-surface)',
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: 'var(--ui-card-radius)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.375rem', lineHeight: 1.3, color: 'var(--ui-color-primary)' }}>
                    {entry.title}
                  </h3>
                  {entry.excerpt ? (
                    <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}>
                      {entry.excerpt}
                    </p>
                  ) : null}
                  {entry.slug ? (
                    <p style={{ margin: 'auto 0 0' }}>
                      <Link href={`/insights/${entry.slug}`} style={{ fontWeight: 700 }}>
                        Read this insight
                      </Link>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featuredProof.length > 0 ? (
        <section
          style={{
            padding: 'var(--ui-spacing-section-regular)',
            backgroundColor: 'var(--ui-color-section-alt)',
          }}
        >
          <div style={{ maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Credibility And Proof
            </p>
            <h2
              style={{
                margin: '0 0 24px',
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                lineHeight: 1.1,
                color: 'var(--ui-color-primary)',
              }}
            >
              Evidence belongs alongside the offer.
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredProof.map((entry) => (
                <article
                  key={entry.id || entry.slug}
                  style={{
                    backgroundColor: 'var(--ui-color-surface)',
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: 'var(--ui-card-radius)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--ui-font-display)',
                      fontSize: '1.1875rem',
                      lineHeight: 1.65,
                      fontStyle: 'italic',
                      color: 'var(--ui-color-text)',
                    }}
                  >
                    {entry.quote}
                  </p>
                  <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.6 }}>
                    {entry.name}
                    {entry.role || entry.company ? ' · ' : ''}
                    {[entry.role, entry.company].filter(Boolean).join(', ')}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {ctaSection ? (
        <UniversalSections
          sections={[ctaSection]}
          collections={collectionData}
          guideFormLabels={siteSettings?.guideForm}
          inquiryFormLabels={siteSettings?.inquiryForm}
          pageSlug="home"
        />
      ) : (
        <section
          style={{
            backgroundColor: 'var(--ui-color-primary)',
            color: 'var(--ui-color-dark-text)',
            padding: 'var(--ui-spacing-section-regular)',
          }}
        >
          <div
            style={{
              maxWidth: 'var(--ui-layout-container-max-width)',
              margin: '0 auto',
              display: 'flex',
              gap: '24px',
              justifyContent: 'space-between',
              alignItems: 'end',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '720px' }}>
              <p className="section-label" style={{ color: 'var(--ui-color-hero-muted)', marginBottom: '12px' }}>
                Primary CTA
              </p>
              <h2
                style={{
                  margin: '0 0 16px',
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  lineHeight: 1.1,
                  color: 'var(--ui-color-dark-text)',
                }}
              >
                Ready to make your website operate like a governed system?
              </h2>
              <p
                style={{
                  margin: '0 0 12px',
                  color: 'var(--ui-color-hero-muted)',
                  lineHeight: 1.75,
                }}
              >
                Start with a direct conversation about your CMS model, delivery needs, and how
                Plenor can help structure the work.
              </p>
              <p style={{ margin: 0, color: 'var(--ui-color-hero-muted)', lineHeight: 1.7 }}>
                {responseStatement}
                {siteSettings?.contactEmail ? ` You can also reach us at ${siteSettings.contactEmail}.` : ''}
              </p>
            </div>
            <Link href={primaryCta?.href || '/contact'} className="btn-ghost">
              {primaryCta?.label || 'Start a Conversation'}
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
