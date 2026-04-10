import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: 20,
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          P
        </div>
        <div
          style={{
            position: 'absolute',
            top: 52,
            right: 33,
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: '#3B5998',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
