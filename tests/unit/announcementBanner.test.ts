import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AnnouncementBanner from '@/components/AnnouncementBanner';

describe('AnnouncementBanner', () => {
  it('renders enabled banner content during server rendering', () => {
    const html = renderToStaticMarkup(
      createElement(AnnouncementBanner, { enabled: true, text: 'Enrollment closes Friday' }),
    );

    expect(html).toContain('Enrollment closes Friday');
    expect(html).toContain('Dismiss announcement');
  });
});
