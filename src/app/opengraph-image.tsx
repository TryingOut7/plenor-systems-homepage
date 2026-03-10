import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#1B2D4F',
          padding: '80px 96px',
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '-0.01em',
            marginBottom: 48,
          }}
        >
          Plenor Systems
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          Testing & QA and Launch & Go-to-Market, done right.
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.65)',
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          A structured product development framework for the stages that matter most.
        </div>

        {/* Bottom rule */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: '#3B5998',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
