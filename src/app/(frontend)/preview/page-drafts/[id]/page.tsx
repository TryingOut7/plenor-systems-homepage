import { notFound } from 'next/navigation';
import Link from 'next/link';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSiteSettings, type SitePage } from '@/payload/cms';
import { getPayload } from '@/payload/client';

type RouteParams = {
  id: string;
};

type RouteSearchParams = {
  secret?: string;
};

type UnknownRecord = Record<string, unknown>;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeSecret(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSlug(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as UnknownRecord;
}

function resolveAdminBasePath(): string {
  const configured = process.env.PAYLOAD_ROUTE_ADMIN?.trim();
  if (!configured) return '/admin';
  return configured.startsWith('/') ? configured : `/${configured}`;
}

function mapDraftToPreviewPage(args: {
  draft: UnknownRecord;
  fallbackSlug: string;
}): SitePage {
  const { draft, fallbackSlug } = args;

  const sections = Array.isArray(draft.sections) ? draft.sections : [];
  const slug = normalizeSlug(draft.targetSlug, fallbackSlug);
  const title =
    typeof draft.title === 'string' && draft.title.trim()
      ? draft.title.trim()
      : `Draft ${String(draft.id ?? '')}`.trim();

  return {
    id: String(draft.id ?? fallbackSlug),
    title,
    slug,
    presetKey: 'custom',
    presetContent: undefined,
    isActive: true,
    hideNavbar: typeof draft.hideNavbar === 'boolean' ? draft.hideNavbar : undefined,
    hideFooter: typeof draft.hideFooter === 'boolean' ? draft.hideFooter : undefined,
    pageBackgroundColor:
      typeof draft.pageBackgroundColor === 'string' ? draft.pageBackgroundColor : undefined,
    customHeadScripts:
      typeof draft.customHeadScripts === 'string' ? draft.customHeadScripts : undefined,
    seo: asRecord(draft.seo) as SitePage['seo'],
    sections: sections as SitePage['sections'],
  };
}

export default async function DraftPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<RouteSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const configuredSecret = normalizeSecret(
    process.env.PAYLOAD_PREVIEW_SECRET || process.env.PAYLOAD_SECRET,
  );
  const providedSecret = normalizeSecret(resolvedSearchParams.secret);
  if (!configuredSecret || providedSecret !== configuredSecret) {
    notFound();
  }

  const payload = await getPayload();
  const draftDoc = await payload
    .findByID({
      collection: 'page-drafts',
      id: resolvedParams.id,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null);
  if (!draftDoc) {
    notFound();
  }

  const draft = asRecord(draftDoc);
  const previewPage = mapDraftToPreviewPage({
    draft,
    fallbackSlug: `preview/page-drafts/${resolvedParams.id}`,
  });

  if (!Array.isArray(previewPage.sections) || previewPage.sections.length === 0) {
    const adminBasePath = resolveAdminBasePath();
    const editDraftHref = `${adminBasePath}/collections/page-drafts/${encodeURIComponent(
      resolvedParams.id,
    )}`;

    return (
      <section
        aria-labelledby="preview-empty-title"
        style={{
          maxWidth: '680px',
          margin: '120px auto',
          padding: '28px 24px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h1 id="preview-empty-title" style={{ margin: 0, fontSize: '1.5rem', color: '#0F172A' }}>
          Nothing to preview yet
        </h1>
        <p style={{ marginTop: '12px', marginBottom: 0, color: '#334155', lineHeight: 1.6 }}>
          Add at least one section to this draft, then refresh this preview.
        </p>
        <p style={{ marginTop: '14px', marginBottom: 0 }}>
          <Link href={editDraftHref} style={{ color: '#1D4ED8', textDecoration: 'underline' }}>
            Open this draft in CMS
          </Link>
        </p>
      </section>
    );
  }

  const [collectionData, siteSettings] = await Promise.all([
    getCollectionData({ draft: true }),
    getSiteSettings({ draft: true }),
  ]);

  return (
    <>
      <PageChromeOverrides page={previewPage} />
      <UniversalSections
        sections={previewPage.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
