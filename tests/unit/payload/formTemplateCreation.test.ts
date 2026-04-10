import { describe, expect, it, vi } from 'vitest';
import type { Payload, TypedUser } from 'payload';
import { createOrGetFormTemplate } from '@/payload/forms/formTemplateCreation';

type MockPayload = {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

function buildMockPayload(args?: {
  existing?: Array<Record<string, unknown>>;
  findResponses?: Array<Array<Record<string, unknown>>>;
}) {
  const responses = [...(args?.findResponses || [args?.existing || []])];
  const find = vi.fn(async () => ({
    docs: responses.length > 0 ? responses.shift() : [],
  }));

  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 'form_123',
    title: data.title,
  }));

  const update = vi.fn(async ({ id }: { id: string | number }) => ({
    id,
  }));

  return {
    find,
    create,
    update,
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
        templateKey: 'guide',
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
      existing: [
        {
          id: 42,
          title: 'Guide Download',
          templateKey: 'guide',
          fields: [{ blockType: 'email', name: 'email' }],
          submitButtonLabel: 'Get My Free Guide',
          confirmationType: 'message',
          confirmationMessage: { root: {} },
        },
      ],
    });

    const result = await createOrGetFormTemplate({
      payload: payload as unknown as Payload,
      templateKey: 'guide',
      user: { id: 'user_2', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      created: false,
      id: 42,
      title: 'Guide Download',
    });
  });

  it('backfills templateKey on legacy title-only matches', async () => {
    const payload = buildMockPayload({
      findResponses: [
        [],
        [{ id: 'legacy_form', title: 'Guide Download' }],
      ],
    });

    const result = await createOrGetFormTemplate({
      payload: payload as unknown as Payload,
      templateKey: 'guide',
      user: { id: 'user_4', role: 'editor' } as unknown as TypedUser,
    });

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'forms',
        id: 'legacy_form',
        data: expect.objectContaining({
          templateKey: 'guide',
        }),
      }),
    );
    expect(result).toEqual({
      created: false,
      id: 'legacy_form',
      title: 'Guide Download',
    });
  });
});
