import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSitePageBySlug, getSiteSettings, type PageSection } from '@/payload/cms';

export const revalidate = 60;

interface ServicesPageData {
  heroHeading?: string;
  heroSubtext?: string;
  testingBody?: string;
  testingItems?: string[];
  testingWhoFor?: string;
  launchBody?: string;
  launchItems?: string[];
  launchWhoFor?: string;
  whyFrameworkHeading?: string;
  whyFrameworkBody1?: string;
  whyFrameworkBody2?: string;
  whyFrameworkBody3?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

const defaults: Required<ServicesPageData> = {
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
  testingBody:
    'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
  testingItems: [
    'Defining quality criteria and acceptance standards before development completes',
    'Structured test planning: functional, regression, performance, and edge-case coverage',
    'Release readiness checklists and sign-off processes',
    'Defect triage and prioritisation so teams know what must be fixed before launch',
  ],
  testingWhoFor:
    'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  launchBody:
    'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  launchItems: [
    'Market positioning and messaging that reflects what the product actually does',
    'Channel selection grounded in where your target audience can be reached',
    'Launch sequencing and operational readiness — support, onboarding, and infrastructure',
    'Post-launch review process to capture what worked and what to adjust',
  ],
  launchWhoFor:
    'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  whyFrameworkHeading: 'Why a framework, not a one-off engagement',
  whyFrameworkBody1:
    'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  whyFrameworkBody2:
    'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  whyFrameworkBody3:
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  ctaHeading: 'Not sure yet?',
  ctaBody: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'Services — Testing & QA and Launch & Go-to-Market',
    description: `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
    alternates: { canonical: `${siteUrl}/services` },
    openGraph: {
      title: `Services — Testing & QA and Launch & Go-to-Market | ${siteName}`,
      description: `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
      url: `${siteUrl}/services`,
    },
  };
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };
const narrow: React.CSSProperties = { maxWidth: '760px', margin: '0 auto' };

function findSection(
  sections: PageSection[],
  blockType: string,
  heading?: string,
): PageSection | undefined {
  return sections.find((section) => {
    if (section.blockType !== blockType) return false;
    if (!heading) return true;
    return String(section.heading || '').trim() === heading;
  });
}

function findSectionsByType(sections: PageSection[], blockType: string): PageSection[] {
  return sections.filter((section) => section.blockType === blockType);
}

function getRows(section: PageSection | undefined): unknown[] {
  if (!section || !Array.isArray(section.rows)) return [];
  return section.rows;
}

function getCellValue(row: unknown, index = 0): string {
  if (!row || typeof row !== 'object') return '';
  const cells = Array.isArray((row as Record<string, unknown>).cells)
    ? ((row as Record<string, unknown>).cells as unknown[])
    : [];
  const cell = cells[index];
  if (!cell || typeof cell !== 'object') return '';
  const value = (cell as Record<string, unknown>).value;
  return typeof value === 'string' ? value : '';
}

function getRichTextParagraphs(section: PageSection | undefined): string[] {
  if (!section || !section.content || typeof section.content !== 'object') return [];
  const root = (section.content as Record<string, unknown>).root;
  if (!root || typeof root !== 'object') return [];
  const children = Array.isArray((root as Record<string, unknown>).children)
    ? ((root as Record<string, unknown>).children as unknown[])
    : [];

  const readText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return '';
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (!Array.isArray(record.children)) return '';
    return record.children.map(readText).join('');
  };

  return children
    .map(readText)
    .map((text) => text.trim())
    .filter(Boolean);
}

function removeWhoForPrefix(value: string): string {
  return value
    .replace(/^Who it['’]s for:\s*/i, '')
    .replace(/^Who it’s for:\s*/i, '')
    .trim();
}

function getServicesPageData(sections: PageSection[]): Required<ServicesPageData> {
  const hero = findSection(sections, 'heroSection');
  const testingSection = findSection(sections, 'richTextSection', 'Testing & QA');
  const launchSection = findSection(sections, 'richTextSection', 'Launch & Go-to-Market');
  const whySection = findSection(
    sections,
    'richTextSection',
    'Why a framework, not a one-off engagement',
  );

  const whatCoverTables = findSectionsByType(sections, 'simpleTableSection').filter(
    (section) => String(section.heading || '').trim() === 'What it covers',
  );
  const testingItemsRows = getRows(whatCoverTables[0]);
  const launchItemsRows = getRows(whatCoverTables[1]);

  const testingParagraphs = getRichTextParagraphs(testingSection);
  const launchParagraphs = getRichTextParagraphs(launchSection);
  const whyParagraphs = getRichTextParagraphs(whySection);

  const cta = findSection(sections, 'ctaSection', 'Not sure yet?');

  const mappedTestingItems = testingItemsRows
    .map((row) => getCellValue(row, 0))
    .filter(Boolean);
  const mappedLaunchItems = launchItemsRows
    .map((row) => getCellValue(row, 0))
    .filter(Boolean);

  return {
    ...defaults,
    heroHeading: typeof hero?.heading === 'string' ? hero.heading : defaults.heroHeading,
    heroSubtext:
      typeof hero?.subheading === 'string' ? hero.subheading : defaults.heroSubtext,
    testingBody: testingParagraphs[0] || defaults.testingBody,
    testingWhoFor: testingParagraphs[1]
      ? removeWhoForPrefix(testingParagraphs[1])
      : defaults.testingWhoFor,
    testingItems: mappedTestingItems.length ? mappedTestingItems : defaults.testingItems,
    launchBody: launchParagraphs[0] || defaults.launchBody,
    launchWhoFor: launchParagraphs[1]
      ? removeWhoForPrefix(launchParagraphs[1])
      : defaults.launchWhoFor,
    launchItems: mappedLaunchItems.length ? mappedLaunchItems : defaults.launchItems,
    whyFrameworkHeading:
      typeof whySection?.heading === 'string'
        ? whySection.heading
        : defaults.whyFrameworkHeading,
    whyFrameworkBody1: whyParagraphs[0] || defaults.whyFrameworkBody1,
    whyFrameworkBody2: whyParagraphs[1] || defaults.whyFrameworkBody2,
    whyFrameworkBody3: whyParagraphs[2] || defaults.whyFrameworkBody3,
    ctaHeading: typeof cta?.heading === 'string' ? cta.heading : defaults.ctaHeading,
    ctaBody: typeof cta?.body === 'string' ? cta.body : defaults.ctaBody,
  };
}

const listItem = (text: string) => (
  <li
    key={text}
    style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      fontSize: '16px',
      color: '#6B7280',
      lineHeight: 1.65,
    }}
  >
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        marginTop: '8px',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#1B2D4F',
        display: 'inline-block',
      }}
    />
    {text}
  </li>
);

export default async function ServicesPage() {
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('services'),
    getSiteSettings(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const d = getServicesPageData(sitePage.sections);
  const siteName = siteSettings?.siteName || 'Plenor Systems';
  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';

  return (
    <>
      {sitePage.hideNavbar && (
        <style>{`header[role="banner"] { display: none !important; }`}</style>
      )}
      {sitePage.hideFooter && (
        <style>{`footer[role="contentinfo"] { display: none !important; }`}</style>
      )}
      {sitePage.pageBackgroundColor && (
        <style>{`body { background-color: ${sitePage.pageBackgroundColor} !important; }`}</style>
      )}
      {sitePage.customHeadScripts && (
        <div dangerouslySetInnerHTML={{ __html: sitePage.customHeadScripts }} style={{ display: 'none' }} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${siteName} Product Development Framework`,
            provider: {
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
            },
            description:
              'A structured framework covering Testing & QA and Launch & Go-to-Market stages of product development.',
            areaServed: 'Worldwide',
          }),
        }}
      />

      <section
        aria-labelledby="services-hero-heading"
        style={{
          backgroundColor: '#1B2D4F',
          padding: '100px 32px 108px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            Framework Overview
          </p>
          <h1
            id="services-hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
            }}
          >
            {d.heroHeading}
          </h1>
          <p className="animate-fade-up-delay-1" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            {d.heroSubtext}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="testing-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '40px' }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(80px, 12vw, 140px)',
                fontWeight: 700,
                color: 'rgba(27,45,79,0.07)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginLeft: '-4px',
                userSelect: 'none',
              }}
            >
              01
            </span>
          </div>

          <p className="section-label" style={{ marginBottom: '16px' }}>Stage 1</p>
          <h2
            id="testing-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            Testing & QA
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
            {d.testingBody}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                What it covers
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.testingItems.map(listItem)}
              </ul>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Who it&apos;s for
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.testingWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="launch-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={narrow}>
          <div style={{ marginBottom: '40px' }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(80px, 12vw, 140px)',
                fontWeight: 700,
                color: 'rgba(27,45,79,0.07)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginLeft: '-4px',
                display: 'block',
                userSelect: 'none',
              }}
            >
              02
            </span>
          </div>

          <p className="section-label" style={{ marginBottom: '16px' }}>Stage 2</p>
          <h2
            id="launch-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            Launch & Go-to-Market
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
            {d.launchBody}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                What it covers
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.launchItems.map(listItem)}
              </ul>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Who it&apos;s for
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.launchWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="why-framework-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <p className="section-label" style={{ marginBottom: '16px' }}>The Approach</p>
          <h2
            id="why-framework-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            {d.whyFrameworkHeading}
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '32px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.whyFrameworkBody1}
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.whyFrameworkBody2}
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7 }}>
            {d.whyFrameworkBody3}
          </p>
        </div>
      </section>

      <div
        style={{
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          padding: '20px 32px',
        }}
      >
        <div style={{ ...inner, display: 'flex', flexWrap: 'wrap', gap: '8px 32px', justifyContent: 'center' }}>
          <Link
            href="/about"
            style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
            className="breadcrumb-link"
          >
            About Plenor Systems →
          </Link>
          <Link
            href="/pricing"
            style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
            className="breadcrumb-link"
          >
            Pricing →
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="services-cta-heading"
        style={{ padding: '100px 32px', backgroundColor: '#1B2D4F', position: 'relative', overflow: 'hidden' }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ ...inner, maxWidth: '600px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2
            id="services-cta-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {d.ctaHeading}
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '36px' }}>
            {d.ctaBody}
          </p>
          <Link href="/contact#guide" className="btn-ghost">
            Get the Free Guide
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
