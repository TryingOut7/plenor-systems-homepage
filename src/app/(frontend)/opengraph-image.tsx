import { renderOGImage, ogSize } from '@/lib/og-image';

export const alt = 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework';
export const size = ogSize;
export const contentType = 'image/png';

export default function OGImage() {
  return renderOGImage({
    title: 'Testing & QA and Launch & Go-to-Market, done right.',
    subtitle: 'A structured product development framework for the stages that matter most.',
  });
}
