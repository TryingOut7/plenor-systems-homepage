export type SubmissionKind = 'guide' | 'inquiry';

export type SideEffectStatus = 'pending' | 'retrying' | 'succeeded' | 'dead_letter';

export interface AdminSubmission {
  id: string;
  kind: SubmissionKind;
  name: string;
  email: string;
  company?: string;
  challenge?: string;
  submittedAt: string;
  sideEffects: {
    total: number;
    pending: number;
    retrying: number;
    succeeded: number;
    deadLetter: number;
    status: SideEffectStatus;
  };
}

export interface AdminSubmissionsListResponse {
  items: AdminSubmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminSubmissionDetailResponse {
  submission: AdminSubmission;
  jobs: Array<{
    id: string;
    provider: string;
    status: 'pending' | 'processing' | 'retrying' | 'succeeded' | 'dead_letter';
    attempts: number;
    maxAttempts: number;
    nextAttemptAt?: string;
    lastError?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface AdminReplaySubmissionResponse {
  replayed: true;
  submissionId: string;
  enqueuedJobs: number;
}
