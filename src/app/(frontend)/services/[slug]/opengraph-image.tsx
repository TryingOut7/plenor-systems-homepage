import { renderOGImage, ogSize } from '@/lib/og-image';
import { getServiceItemBySlug } from '@/payload/cms';

export const size = ogSize;
export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const item = await getServiceItemBySlug(resolvedParams.slug);

  const title = item?.seo?.ogTitle || item?.title || 'Service';
  const subtitle = item?.seo?.ogDescription || item?.summary || '';

  return renderOGImage({ title, subtitle, label: 'Service' });
}
