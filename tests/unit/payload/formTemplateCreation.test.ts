import { describe, expect, it, vi } from 'vitest';
import type { Payload, TypedUser } from 'payload';
import { createOrGetFormTemplate } from '@/payload/forms/formTemplateCreation';

type MockPayload = {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
};

function buildMockPayload(args?: {
  existing?: Array<Record<string, unknown>>;
}) {
  const find = vi.fn(async () => ({
    docs: args?.existing || [],
  }));

  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 'form_123',
    title: data.title,
  }));

  return {
    find,
    create,
  } as MockPayload;
}

describe('formTemplateCreation service', () => {
  it('creates a new guide template when no matching form exists', async () => {
    const payload = buildMockPayload();

    const result = await createOrGetFormTemplate({
      payload: payload as unknown as Payload,
      templateKey: 'guide',
      user: { id: 'user_1', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'forms',
      }),
    );
    expect(payload.create).toHaveBeenCalledTimes(1);
    const createArgs = payload.create.mock.calls[0][0];
    expect(createArgs.collection).toBe('forms');
    expect(createArgs.data).toEqual(
      expect.objectContaining({
        title: 'guide',
        submitButtonLabel: 'Get My Free Guide',
        confirmationType: 'message',
      }),
    );

    expect(result).toEqual({
      created: true,
      id: 'form_123',
      title: 'guide',
    });
  });

  it('returns existing form when template already exists', async () => {
    const payload = buildMockPayload({
      existing: [{ id: 42, title: 'Guide Download' }],
    });

    const result = await createOrGetFormTemplate({
      payload: payload as unknown as Payload,
      templateKey: 'guide',
      user: { id: 'user_2', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      created: false,
      id: 42,
      title: 'Guide Download',
    });
  });

  it('creates a newsletter template with a subscribe CTA', async () => {
    const payload = buildMockPayload();

    const result = await createOrGetFormTemplate({
      payload: payload as unknown as Payload,
      templateKey: 'newsletter',
      user: { id: 'user_3', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.create).toHaveBeenCalledTimes(1);
    const createArgs = payload.create.mock.calls[0][0];
    expect(createArgs.data).toEqual(
      expect.objectContaining({
        title: 'newsletter',
        submitButtonLabel: 'Subscribe',
        confirmationType: 'message',
      }),
    );
    expect(createArgs.data.fields).toEqual([
      expect.objectContaining({
        blockType: 'email',
        name: 'email',
        required: true,
      }),
    ]);

    expect(result).toEqual({
      created: true,
      id: 'form_123',
      title: 'newsletter',
    });
  });
});
