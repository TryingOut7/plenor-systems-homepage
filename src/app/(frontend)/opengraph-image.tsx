import { renderOGImage, ogSize } from '@/lib/og-image';

const brandName = process.env.NEXT_PUBLIC_SITE_NAME || 'Website';

export const alt = `${brandName} — CMS-Driven Websites and Structured Delivery`;
export const size = ogSize;
export const contentType = 'image/png';

export default function OGImage() {
  return renderOGImage({
    brandName,
    title: 'CMS-driven websites and structured delivery.',
    subtitle: 'Plenor.ai for professional services, advisory, and governed content operations.',
  });
}
