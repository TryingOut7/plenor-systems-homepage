import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };

export function renderOGImage({
  title,
  subtitle,
  label,
  brandName,
}: {
  title: string;
  subtitle?: string;
  label?: string;
  brandName?: string;
}) {
  const resolvedBrandName =
    typeof brandName === 'string' && brandName.trim()
      ? brandName.trim()
      : (process.env.NEXT_PUBLIC_SITE_NAME || 'Website');

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
          {resolvedBrandName}
        </div>

        {/* Label */}
        {label ? (
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#6B8CC7',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {label}
          </div>
        ) : null}

        {/* Headline */}
        <div
          style={{
            fontSize: title.length > 60 ? 48 : 64,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          {title}
        </div>

        {/* Subline */}
        {subtitle ? (
          <div
            style={{
              fontSize: 26,
              color: 'rgba(255,255,255,0.65)',
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 800,
            }}
          >
            {subtitle.length > 120 ? subtitle.slice(0, 117) + '...' : subtitle}
          </div>
        ) : null}

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
    { ...ogSize },
  );
}
