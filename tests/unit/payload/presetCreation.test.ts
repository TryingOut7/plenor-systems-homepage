import { describe, expect, it, vi } from 'vitest';
import type { Payload, TypedUser } from 'payload';
import { createPresetFromDraft, createPresetFromLivePage } from '@/payload/workspaces/presetCreation';

type MockPayload = {
  create: ReturnType<typeof vi.fn>;
  findByID: ReturnType<typeof vi.fn>;
};

function buildMockPayload(sourceDoc: Record<string, unknown>) {
  const findByID = vi.fn(async () => sourceDoc);
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 'preset_123',
    name: data.name,
  }));

  return {
    findByID,
    create,
  } as MockPayload;
}

describe('presetCreation workspace service', () => {
  it('creates a preset from a live page using safe copy semantics', async () => {
    const sourceSections = [
      { blockType: 'heroSection', structuralKey: 'home-hero', heading: 'Heading A' },
      { blockType: 'ctaSection', structuralKey: 'home-cta', heading: 'CTA' },
    ];
    const payload = buildMockPayload({
      id: 'live_1',
      title: 'Home',
      slug: 'home',
      isActive: true,
      workflowStatus: 'published',
      sections: sourceSections,
    });

    await createPresetFromLivePage({
      payload: payload as unknown as Payload,
      livePageId: 'live_1',
      presetMeta: {
        name: 'Homepage Blueprint',
        category: 'landing',
        tags: ['home', 'core'],
      },
      user: { id: 'user_1', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'site-pages',
        id: 'live_1',
      }),
    );

    expect(payload.create).toHaveBeenCalledTimes(1);
    const createArgs = payload.create.mock.calls[0][0];
    expect(createArgs.collection).toBe('page-presets');

    const data = createArgs.data as Record<string, unknown>;
    expect(data.name).toBe('Homepage Blueprint');
    expect(data.category).toBe('landing');
    expect(data.sourceType).toBe('from-live');
    expect(data.sourceLivePage).toBe('live_1');
    expect(data.sourceDraft).toBeUndefined();
    expect(data.createdFromSnapshotAt).toEqual(expect.any(String));

    // Copy sections but never copy live-route/workflow ownership fields.
    expect(data.sections).toEqual(sourceSections);
    expect(data.sections).not.toBe(sourceSections);
    expect(data.slug).toBeUndefined();
    expect(data.isActive).toBeUndefined();
    expect(data.workflowStatus).toBeUndefined();
  });

  it('creates a preset from a draft and uses editor notes as description fallback', async () => {
    const payload = buildMockPayload({
      id: 'draft_1',
      title: 'Service Page Draft',
      targetSlug: 'services/new-offering',
      editorNotes: 'Base this preset on the draft structure used for service pages.',
      sections: [{ blockType: 'richTextSection', structuralKey: 'service-intro', heading: 'Intro' }],
    });

    await createPresetFromDraft({
      payload: payload as unknown as Payload,
      draftId: 'draft_1',
      presetMeta: {
        name: 'Service Draft Blueprint',
        category: 'custom',
      },
      user: { id: 'user_2', role: 'editor' } as unknown as TypedUser,
    });

    const createArgs = payload.create.mock.calls[0][0];
    const data = createArgs.data as Record<string, unknown>;

    expect(data.sourceType).toBe('from-draft');
    expect(data.sourceDraft).toBe('draft_1');
    expect(data.sourceLivePage).toBeUndefined();
    expect(data.description).toBe(
      'Base this preset on the draft structure used for service pages.',
    );
  });
});
