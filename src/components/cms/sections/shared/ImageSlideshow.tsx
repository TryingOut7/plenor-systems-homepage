'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { NormalizedImage } from '../utils';

interface ImageSlideshowProps {
  images: NormalizedImage[];
}

export default function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, isPaused]);

  if (images.length === 0) return null;
  const boundedIndex = ((currentIndex % images.length) + images.length) % images.length;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        style={{
          marginBottom: '12px',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid var(--ui-color-border)',
        }}
      >
        <Image
          src={images[boundedIndex].url}
          alt={images[boundedIndex].alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {images.length > 1 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
            }
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {images.map((_, dotIndex) => (
              <button
                key={`dot-${dotIndex}`}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                onClick={() => setCurrentIndex(dotIndex)}
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor:
                    dotIndex === boundedIndex
                      ? 'var(--ui-color-primary)'
                      : 'var(--ui-color-border)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
