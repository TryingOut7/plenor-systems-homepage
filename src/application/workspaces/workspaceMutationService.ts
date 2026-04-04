import type {
  WorkspaceDraftRecord,
  WorkspaceLivePageRecord,
  WorkspaceMutationRepository,
  WorkspacePresetMetaInput,
  WorkspacePresetRecord,
} from '@/application/ports/workspaceMutationRepository';

export async function createPresetFromLivePage(
  repository: WorkspaceMutationRepository,
  args: {
    livePageId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  },
): Promise<WorkspacePresetRecord> {
  return repository.createPresetFromLivePage(args);
}

export async function createPresetFromDraft(
  repository: WorkspaceMutationRepository,
  args: {
    draftId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  },
): Promise<WorkspacePresetRecord> {
  return repository.createPresetFromDraft(args);
}

export async function createPresetFromPlayground(
  repository: WorkspaceMutationRepository,
  args: {
    playgroundId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  },
): Promise<WorkspacePresetRecord> {
  return repository.createPresetFromPlayground(args);
}

export async function createDraftFromPlayground(
  repository: WorkspaceMutationRepository,
  args: {
    playgroundId: number | string;
    title: string;
    targetSlug: string;
  },
): Promise<WorkspaceDraftRecord> {
  return repository.createDraftFromPlayground(args);
}

export async function promoteDraftToLive(
  repository: WorkspaceMutationRepository,
  args: {
    draftId: number | string;
  },
): Promise<WorkspaceLivePageRecord> {
  return repository.promoteDraftToLive(args);
}
