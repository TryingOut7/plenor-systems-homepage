import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgEventRegistrationFlow from '@/components/org-site/OrgEventRegistrationFlow';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgEventBySlug } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref, extractMediaAsset } from '@/lib/org-site-helpers';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

export default async function OrgEventRegisterPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ id?: string }>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cmsReadOptions = await getCmsReadOptions();
  const event = await getOrgEventBySlug(resolvedParams.slug, cmsReadOptions);
  if (!event) notFound();

  const initialPublicId =
    typeof resolvedSearchParams.id === 'string' ? resolvedSearchParams.id.trim() : '';

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        Registration
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(32px, 5vw, 50px)' }}>
        {event.title}
      </h1>

      {event.registrationInstructions ? (
        <section style={{ marginBottom: '22px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '24px' }}>
            Registration Instructions
          </h2>
          <RichText data={event.registrationInstructions as SerializedEditorState} />
        </section>
      ) : null}

      <OrgEventRegistrationFlow
        basePath={basePath}
        initialPublicId={initialPublicId || undefined}
        event={{
          id: String(event.id),
          title: event.title,
          slug: event.slug,
          registrationRequired: event.registrationRequired === true,
          paymentRequired: event.paymentRequired === true,
          paymentReferenceFormat: event.paymentReferenceFormat,
          paymentInstructions: event.paymentInstructions as SerializedEditorState | null | undefined,
          zelleQr: extractMediaAsset(event.zelleQrCode),
          venmoQr: extractMediaAsset(event.venmoQrCode),
        }}
      />

      <div style={{ marginTop: '26px' }}>
        <Link href={buildCommunityHref(basePath, `events/${event.slug}`)}>Back to event detail</Link>
      </div>
    </div>
  );
}
