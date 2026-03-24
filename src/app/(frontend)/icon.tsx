import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Website';
  const mark = siteName.trim().charAt(0).toUpperCase() || 'W';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1B2D4F',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {mark}
        </div>
      </div>
    ),
    { ...size }
  );
}
