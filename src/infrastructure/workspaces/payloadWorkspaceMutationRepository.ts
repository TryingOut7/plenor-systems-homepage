import type { WorkspaceMutationRepository } from '@/application/ports/workspaceMutationRepository';
import {
  createDraftFromPlayground,
  createDraftFromPreset,
  createPresetFromDraft,
  createPresetFromLivePage,
  createPresetFromPlayground,
} from '@/payload/workspaces/presetCreation';
import { promoteDraftToLive } from '@/payload/workspaces/draftPromotion';
import type { Payload, TypedUser } from 'payload';

export function createPayloadWorkspaceMutationRepository(args: {
  payload: Payload;
  user: TypedUser;
}): WorkspaceMutationRepository {
  return {
    createPresetFromLivePage: ({ livePageId, presetMeta }) =>
      createPresetFromLivePage({
        payload: args.payload,
        user: args.user,
        livePageId,
        presetMeta,
      }),
    createPresetFromDraft: ({ draftId, presetMeta }) =>
      createPresetFromDraft({
        payload: args.payload,
        user: args.user,
        draftId,
        presetMeta,
      }),
    createPresetFromPlayground: ({ playgroundId, presetMeta }) =>
      createPresetFromPlayground({
        payload: args.payload,
        user: args.user,
        playgroundId,
        presetMeta,
      }),
    createDraftFromPlayground: ({ playgroundId, title, targetSlug }) =>
      createDraftFromPlayground({
        payload: args.payload,
        user: args.user,
        playgroundId,
        title,
        targetSlug,
      }),
    createDraftFromPreset: ({ presetId, title, targetSlug }) =>
      createDraftFromPreset({
        payload: args.payload,
        user: args.user,
        presetId,
        title,
        targetSlug,
      }),
    promoteDraftToLive: ({ draftId }) =>
      promoteDraftToLive({
        payload: args.payload,
        user: args.user,
        draftId,
      }),
  };
}
