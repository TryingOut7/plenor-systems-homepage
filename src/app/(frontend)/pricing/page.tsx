import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSitePageBySlug, getSiteSettings, type PageSection } from '@/payload/cms';

export const revalidate = 60;

interface PricingPageData {
  heroHeading?: string;
  heroSubtext?: string;
  includedItems?: { title: string; desc: string }[];
  includedBody?: string;
  audiences?: { label: string; copy: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  notReadyHeading?: string;
  notReadyBody?: string;
}

const defaults: Required<PricingPageData> = {
  heroHeading: 'Let’s find the right fit for your team.',
  heroSubtext:
    'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
  includedItems: [
    {
      title: 'Testing & QA Module',
      desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.',
    },
    {
      title: 'Launch & Go-to-Market Module',
      desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.',
    },
    {
      title: 'Onboarding support',
      desc: 'Get your team up and running with the framework from day one.',
    },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
  audiences: [
    {
      label: 'Startups',
      copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.',
    },
    {
      label: 'SMEs',
      copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.',
    },
    {
      label: 'Enterprises',
      copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.',
    },
  ],
  ctaHeading: 'Ready to talk?',
  ctaBody: 'Tell us about your product and team — we’ll come back with a proposal.',
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'Pricing — Let\'s find the right fit for your team',
    description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
    alternates: { canonical: `${siteUrl}/pricing` },
    openGraph: {
      title: `Pricing | ${siteName}`,
      description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
      url: `${siteUrl}/pricing`,
    },
  };
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

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

function getPricingPageData(sections: PageSection[]): Required<PricingPageData> {
  const hero = findSection(sections, 'heroSection');
  const includedTable = findSection(
    sections,
    'simpleTableSection',
    'Everything you need to ship with confidence.',
  );
  const includedBodySection = findSection(sections, 'richTextSection');
  const audienceTable = findSection(sections, 'simpleTableSection', 'No minimum team size. Any stage.');
  const cta = findSection(sections, 'ctaSection', 'Ready to talk?');
  const notReady = findSection(sections, 'ctaSection', 'Not ready to talk yet?');

  const includedRows = getRows(includedTable);
  const audiencesRows = getRows(audienceTable);
  const includedBodyParagraphs = getRichTextParagraphs(includedBodySection);

  const includedItems = includedRows
    .map((row) => ({
      title: getCellValue(row, 0),
      desc: getCellValue(row, 1),
    }))
    .filter((entry) => entry.title && entry.desc);

  const audiences = audiencesRows
    .map((row) => ({
      label: getCellValue(row, 0),
      copy: getCellValue(row, 1),
    }))
    .filter((entry) => entry.label && entry.copy);

  return {
    ...defaults,
    heroHeading: typeof hero?.heading === 'string' ? hero.heading : defaults.heroHeading,
    heroSubtext:
      typeof hero?.subheading === 'string' ? hero.subheading : defaults.heroSubtext,
    includedItems: includedItems.length ? includedItems : defaults.includedItems,
    includedBody: includedBodyParagraphs[0] || defaults.includedBody,
    audiences: audiences.length ? audiences : defaults.audiences,
    ctaHeading: typeof cta?.heading === 'string' ? cta.heading : defaults.ctaHeading,
    ctaBody: typeof cta?.body === 'string' ? cta.body : defaults.ctaBody,
    notReadyHeading:
      typeof notReady?.heading === 'string' ? notReady.heading : defaults.notReadyHeading,
    notReadyBody:
      typeof notReady?.body === 'string' ? notReady.body : defaults.notReadyBody,
  };
}

export default async function PricingPage() {
  const sitePage = await getSitePageBySlug('pricing');

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const d = getPricingPageData(sitePage.sections);

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
      <section
        aria-labelledby="pricing-hero-heading"
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
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            Pricing
          </p>
          <h1
            id="pricing-hero-heading"
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
        aria-labelledby="included-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>What&apos;s included</p>
          <h2
            id="included-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            Everything you need to ship with confidence.
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '40px', borderRadius: '2px' }} aria-hidden="true" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {d.includedItems.map(({ title, desc }, i) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  gap: '28px',
                  alignItems: 'flex-start',
                  padding: '28px 0',
                  borderBottom: i < d.includedItems.length - 1 ? '1px solid #E5E7EB' : 'none',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1B2D4F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="12 3 5.5 9.5 2.5 6.5" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', color: '#1A1A1A', marginBottom: '4px' }}>
                    {title}
                  </p>
                  <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginTop: '32px' }}>
            {d.includedBody}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="who-we-work-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>Who we work with</p>
          <h2
            id="who-we-work-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '48px',
            }}
          >
            No minimum team size. Any stage.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2px',
              backgroundColor: '#E5E7EB',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {d.audiences.map(({ label, copy }) => (
              <div
                key={label}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px 28px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#1B2D4F',
                    marginBottom: '10px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65 }}>{copy}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '20px' }}>
            There is no minimum team size requirement to work with us.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="pricing-contact-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-contact-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {d.ctaHeading}
          </h2>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.65, marginBottom: '36px' }}>
            {d.ctaBody}
          </p>
          <Link href="/contact" className="btn-secondary">
            Get in touch
          </Link>
          <div style={{ marginTop: '20px' }}>
            <Link
              href="/services"
              style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
              className="breadcrumb-link"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="pricing-guide-heading"
        style={{ padding: '64px 32px', backgroundColor: '#F8F9FA', borderTop: '1px solid #E5E7EB' }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-guide-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.01em',
              marginBottom: '12px',
            }}
          >
            {d.notReadyHeading}
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}>
            {d.notReadyBody}
          </p>
          <Link href="/contact#guide" className="btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>
            Get the free guide
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
