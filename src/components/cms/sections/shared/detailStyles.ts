import type { CSSProperties } from 'react';

export const detailTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: '8px',
  fontSize: 'clamp(34px, 5vw, 54px)',
  lineHeight: 1.08,
  color: 'var(--ui-color-primary)',
};

export const detailMetaStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: '24px',
  color: 'var(--ui-color-text-muted)',
};

export const detailLeadStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: '20px',
  lineHeight: 1.7,
  color: 'var(--ui-color-text)',
};

export const detailSubsectionHeadingStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: '12px',
  fontSize: '24px',
  color: 'var(--ui-color-primary)',
};

export const detailPanelStyle: CSSProperties = {
  border: '1px solid var(--ui-color-border)',
  borderRadius: 'var(--ui-card-radius, 8px)',
  padding: '18px',
  backgroundColor: 'var(--ui-color-surface)',
};

export const detailGalleryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

type DetailMediaOptions = {
  aspectRatio: CSSProperties['aspectRatio'];
  fit?: CSSProperties['objectFit'];
  maxWidth?: CSSProperties['maxWidth'];
  maxHeight?: CSSProperties['maxHeight'];
  backgroundColor?: CSSProperties['backgroundColor'];
};

export function getDetailMediaStyle({
  aspectRatio,
  fit = 'cover',
  maxWidth,
  maxHeight,
  backgroundColor,
}: DetailMediaOptions): CSSProperties {
  return {
    width: '100%',
    height: 'auto',
    aspectRatio,
    objectFit: fit,
    borderRadius: 'var(--ui-card-radius, 8px)',
    border: '1px solid var(--ui-color-border)',
    ...(maxWidth ? { maxWidth } : {}),
    ...(maxHeight ? { maxHeight } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
  };
}
