import { renderOGImage, ogSize } from '@/lib/og-image';

const brandName = process.env.NEXT_PUBLIC_SITE_NAME || 'Website';

export const alt = `${brandName} — Execution-Ready Product Definitions`;
export const size = ogSize;
export const contentType = 'image/png';

export default function OGImage() {
  return renderOGImage({
    brandName,
    title: 'Turn Your Business Idea into a Definition Ready to Build',
    subtitle: 'System-driven. Human-validated. Ready for implementation.',
  });
}
