export type WorkspacePresetMetaInput = {
  name?: unknown;
  category?: unknown;
  description?: unknown;
  thumbnailId?: unknown;
  tags?: unknown;
};

export interface WorkspacePresetRecord {
  id: number | string;
  name: string;
}

export interface WorkspaceDraftRecord {
  id: number | string;
  title: string;
}

export interface WorkspaceLivePageRecord {
  id: number | string;
  isNew: boolean;
  slug: string;
}

export interface WorkspaceMutationRepository {
  createPresetFromLivePage(args: {
    livePageId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  }): Promise<WorkspacePresetRecord>;
  createPresetFromDraft(args: {
    draftId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  }): Promise<WorkspacePresetRecord>;
  createPresetFromPlayground(args: {
    playgroundId: number | string;
    presetMeta: WorkspacePresetMetaInput;
  }): Promise<WorkspacePresetRecord>;
  createDraftFromPlayground(args: {
    playgroundId: number | string;
    title: string;
    targetSlug: string;
  }): Promise<WorkspaceDraftRecord>;
  createDraftFromPreset(args: {
    presetId: number | string;
    title: string;
    targetSlug: string;
  }): Promise<WorkspaceDraftRecord>;
  promoteDraftToLive(args: {
    draftId: number | string;
  }): Promise<WorkspaceLivePageRecord>;
}
