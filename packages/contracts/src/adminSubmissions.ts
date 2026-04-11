export type SubmissionKind = 'guide' | 'inquiry';
export type InquiryWorkflowStatus = 'submitted' | 'under_review' | 'responded' | 'closed';

export type SideEffectStatus = 'pending' | 'retrying' | 'succeeded' | 'dead_letter';

export interface AdminSubmission {
  id: string;
  kind: SubmissionKind;
  name: string;
  email: string;
  organization?: string;
  inquiryType?: string;
  message?: string;
  workflowStatus?: InquiryWorkflowStatus;
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

export interface AdminUpdateSubmissionStatusRequest {
  workflowStatus: InquiryWorkflowStatus;
}
