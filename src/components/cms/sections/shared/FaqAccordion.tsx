'use client';

import { useState } from 'react';
import type { SectionTheme } from '../types';
import { isDarkTheme } from '../utils';

interface FaqAccordionProps {
  items: Array<{ question: string; answer: string }>;
  theme: SectionTheme;
}

export default function FaqAccordion({ items, theme }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dark = isDarkTheme(theme);

  return (
    <div>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            borderBottom: `1px solid ${
              dark ? 'rgba(255,255,255,0.15)' : 'var(--ui-color-border)'
            }`,
          }}
        >
          <button
            type="button"
            aria-expanded={openIndex === idx}
            aria-controls={`faq-answer-${idx}`}
            onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '20px 0',
              background: 'none',
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--ui-font-body)',
              fontWeight: 600,
              fontSize: '16px',
              color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
            }}
          >
            {item.question}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                flexShrink: 0,
                marginLeft: '16px',
                transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </button>
          <div
            id={`faq-answer-${idx}`}
            style={{ display: openIndex === idx ? 'block' : 'none', paddingBottom: '20px' }}
          >
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: dark
                  ? 'var(--ui-color-dark-text-muted)'
                  : 'var(--ui-color-text-muted)',
                margin: 0,
              }}
            >
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
