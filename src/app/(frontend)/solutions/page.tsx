import type { Metadata } from 'next';
import Link from 'next/link';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import {
  SOLUTION_CATEGORY_OPTIONS,
  SOLUTION_CATEGORY_VALUES,
  SOLUTION_SECONDARY_NAV_ITEMS,
  getOptionLabel,
  readAllowedQueryValue,
} from '@/lib/plenor-site';
import { getSiteSettings, getSolutionEntries } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor.ai';

  return {
    title: `Solutions | ${siteName}`,
    description:
      'Advisory, implementation, and framework-led delivery offers from Plenor.',
  };
}

export default async function SolutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = readAllowedQueryValue(
    resolvedSearchParams.category,
    SOLUTION_CATEGORY_VALUES,
  );
  const entries = await getSolutionEntries();

  const visibleEntries = selectedCategory
    ? entries.filter((entry) => entry.category === selectedCategory)
    : entries;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '12px' }}>
        Solutions
      </p>
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.125rem)',
          lineHeight: 1.1,
          margin: '0 0 16px',
          color: 'var(--ui-color-primary)',
        }}
      >
        What Plenor delivers
      </h1>
      <p
        style={{
          maxWidth: '720px',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--ui-color-text-muted)',
          margin: '0 0 32px',
        }}
      >
        Solutions combine strategic definition, CMS implementation, and
        framework-led delivery so operating decisions stay governed after launch.
      </p>

      <OrgSecondaryNav
        items={SOLUTION_SECONDARY_NAV_ITEMS}
        activeHref={
          selectedCategory ? `/solutions?category=${selectedCategory}` : '/solutions'
        }
        navLabel="Solutions sections"
      />

      {visibleEntries.length === 0 ? (
        <p style={{ color: 'var(--ui-color-text-muted)' }}>
          No published solution entries are available yet.
        </p>
      ) : null}

      {SOLUTION_CATEGORY_OPTIONS.map((option) => {
        const group = visibleEntries.filter((entry) => entry.category === option.value);
        if (group.length === 0) return null;

        return (
          <section key={option.value} style={{ marginTop: '40px' }}>
            {!selectedCategory ? (
              <h2
                style={{
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  margin: '0 0 20px',
                  color: 'var(--ui-color-primary)',
                }}
              >
                {option.label}
              </h2>
            ) : null}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {group.map((entry) => (
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
                  <p className="section-label" style={{ margin: 0 }}>
                    {getOptionLabel(SOLUTION_CATEGORY_OPTIONS, entry.category)}
                  </p>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.375rem',
                      lineHeight: 1.3,
                      color: 'var(--ui-color-primary)',
                    }}
                  >
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
                        View solution
                      </Link>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
