import { describe, expect, it, vi } from 'vitest';
import type { Payload, TypedUser } from 'payload';
import { promoteDraftToLive } from '@/payload/workspaces/draftPromotion';

type MockPayload = {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  findByID: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

function buildMockPayload(args: {
  draft: Record<string, unknown>;
  existingPage?: Record<string, unknown>;
}) {
  const create = vi.fn(async () => ({ id: 'live_1' }));
  const update = vi.fn(async () => ({ id: args.existingPage?.id ?? 'live_existing' }));
  const findByID = vi.fn(async () => args.draft);
  const find = vi.fn(async () => ({
    docs: args.existingPage ? [args.existingPage] : [],
  }));

  return {
    create,
    update,
    findByID,
    find,
  } as MockPayload;
}

describe('draftPromotion workspace service', () => {
  it('strips nested payload row ids when creating a new live page', async () => {
    const draft = {
      id: 'draft_nested',
      title: 'About',
      targetSlug: 'about',
      sections: [
        {
          id: 'hero_row',
          blockType: 'heroSection',
          heading: 'Hero',
          highlights: [
            { id: 'highlight_1', text: 'First' },
            { id: 'highlight_2', text: 'Second' },
          ],
        },
      ],
      seo: {
        id: 'seo_row',
        metaTitle: 'About Us',
        social: [{ id: 'social_1', platform: 'x', handle: '@plenor' }],
      },
    };

    const payload = buildMockPayload({ draft });

    const actingUser = { id: 'user_1', role: 'editor' } as unknown as TypedUser;

    await promoteDraftToLive({
      draftId: 'draft_nested',
      payload: payload as unknown as Payload,
      user: actingUser,
    });

    expect(payload.create).toHaveBeenCalledTimes(1);
    const createArgs = payload.create.mock.calls[0][0];
    expect(createArgs.collection).toBe('site-pages');

    const data = createArgs.data as Record<string, unknown>;
    expect(data.sections).toEqual([
      {
        blockType: 'heroSection',
        heading: 'Hero',
        highlights: [
          { text: 'First' },
          { text: 'Second' },
        ],
      },
    ]);
    expect(data.seo).toEqual({
      metaTitle: 'About Us',
      social: [{ platform: 'x', handle: '@plenor' }],
    });

    expect((draft.sections as Array<Record<string, unknown>>)[0].id).toBe('hero_row');
    expect((draft.seo as Record<string, unknown>).id).toBe('seo_row');

    const draftStatusUpdateArgs = payload.update.mock.calls
      .map(([args]) => args as Record<string, unknown>)
      .find((args) => args.collection === 'page-drafts');

    expect(draftStatusUpdateArgs).toBeDefined();
    expect((draftStatusUpdateArgs as { user?: unknown }).user).toBe(actingUser);
    expect((draftStatusUpdateArgs as { data?: Record<string, unknown> }).data).toMatchObject({
      workflowStatus: 'published',
    });
  });

  it('strips nested ids when updating an existing live page', async () => {
    const draft = {
      id: 'draft_existing',
      title: 'Pricing',
      targetSlug: 'pricing',
      sections: [
        {
          id: 'pricing_row',
          blockType: 'pricingTableSection',
          heading: 'Plans',
        },
      ],
      seo: {
        id: 'seo_existing',
        metaTitle: 'Pricing',
      },
    };

    const payload = buildMockPayload({
      draft,
      existingPage: { id: 'page_9', slug: 'pricing' },
    });

    await promoteDraftToLive({
      draftId: 'draft_existing',
      payload: payload as unknown as Payload,
      user: { id: 'user_2', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.update).toHaveBeenCalledTimes(2);

    const sitePageUpdateArgs = payload.update.mock.calls
      .map(([args]) => args as Record<string, unknown>)
      .find((args) => args.collection === 'site-pages');

    expect(sitePageUpdateArgs).toBeDefined();
    const data = (sitePageUpdateArgs as { data: Record<string, unknown> }).data;
    expect(data.sections).toEqual([
      {
        blockType: 'pricingTableSection',
        heading: 'Plans',
      },
    ]);
    expect(data.seo).toEqual({
      metaTitle: 'Pricing',
    });
  });
});
