import { describe, expect, it } from 'vitest';
import {
  NOT_FOUND_PAGE_DEFAULTS,
  resolveNotFoundPageData,
} from '@/lib/page-content/not-found';

describe('page content resolvers', () => {
  it('not-found resolver uses defaults and supports CMS metadata overrides', () => {
    expect(resolveNotFoundPageData(undefined)).toEqual(NOT_FOUND_PAGE_DEFAULTS);

    const custom = resolveNotFoundPageData({
      notFoundPage: {
        metaTitle: 'Custom 404 Title',
        metaDescription: 'Custom 404 Description',
        heading: 'Custom heading',
        body: 'Custom body',
        buttonLabel: 'Back now',
        buttonHref: '/custom-home',
      },
    } as never);

    expect(custom.metaTitle).toBe('Custom 404 Title');
    expect(custom.metaDescription).toBe('Custom 404 Description');
    expect(custom.heading).toBe('Custom heading');
    expect(custom.body).toBe('Custom body');
    expect(custom.buttonLabel).toBe('Back now');
    expect(custom.buttonHref).toBe('/custom-home');
  });
});
