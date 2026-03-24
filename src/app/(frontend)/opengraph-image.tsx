import { renderOGImage, ogSize } from '@/lib/og-image';

const brandName = process.env.NEXT_PUBLIC_SITE_NAME || 'Website';

export const alt = `${brandName} — Testing & QA and Launch & Go-to-Market Framework`;
export const size = ogSize;
export const contentType = 'image/png';

export default function OGImage() {
  return renderOGImage({
    brandName,
    title: 'Testing & QA and Launch & Go-to-Market, done right.',
    subtitle: 'A structured product development framework for the stages that matter most.',
  });
}
