import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  enqueueIntegrationJobs,
  getOutboxJobsForSubmission,
  processOutboxTick,
} from '@/infrastructure/integrations/outboxService';
import {
  buildGuideSubmissionEvent,
  buildInquirySubmissionEvent,
} from '@/infrastructure/integrations/outboundEvents';
import {
  getStoredSubmissionById,
  listStoredSubmissions,
  outboxStatsBySubmission,
  type StoredSubmission,
  updateInquirySubmissionWorkflowStatus,
} from '@/infrastructure/persistence/backendStore';
import type {
  AdminReplaySubmissionResponse,
  AdminSubmission,
  AdminSubmissionDetailResponse,
  AdminSubmissionsListResponse,
  InquiryWorkflowStatus,
  SideEffectStatus,
} from '@plenor/contracts/admin-submissions';

function parsePagination(url: string): { page: number; limit: number } {
  const searchParams = new URL(url).searchParams;
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit') || '20') || 20),
  );
  return { page, limit };
}

function deriveStatus(stats: {
  total: number;
  pending: number;
  retrying: number;
  succeeded: number;
  deadLetter: number;
}): SideEffectStatus {
  if (stats.deadLetter > 0) return 'dead_letter';
  if (stats.retrying > 0) return 'retrying';
  if (stats.pending > 0) return 'pending';
  return 'succeeded';
}

async function toAdminSubmission(
  submission: StoredSubmission,
): Promise<AdminSubmission> {
  const stats = await outboxStatsBySubmission(submission.id);
  return {
    id: submission.id,
    kind: submission.kind,
    name: submission.name,
    email: submission.email,
    organization: submission.organization,
    inquiryType: submission.inquiryType,
    message: submission.message,
    workflowStatus: submission.workflowStatus,
    submittedAt: submission.submittedAt,
    sideEffects: {
      total: stats.total,
      pending: stats.pending,
      retrying: stats.retrying,
      succeeded: stats.succeeded,
      deadLetter: stats.deadLetter,
      status: deriveStatus(stats),
    },
  };
}

export async function listAdminSubmissions(
  context: RequestContext,
): Promise<ServiceResult<AdminSubmissionsListResponse | { message: string }>> {
  const { page, limit } = parsePagination(context.url);
  const listed = await listStoredSubmissions({ page, limit });
  const items = await Promise.all(listed.items.map(toAdminSubmission));

  return ok({
    items,
    meta: {
      total: listed.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(listed.total / limit)),
    },
  });
}

export async function getAdminSubmissionById(
  submissionId: string,
): Promise<ServiceResult<AdminSubmissionDetailResponse | { message: string }>> {
  const submission = await getStoredSubmissionById(submissionId);
  if (!submission) {
    return fail(404, { message: 'Submission not found.' });
  }

  const summary = await toAdminSubmission(submission);
  const jobs = await getOutboxJobsForSubmission(submission.id);

  return ok({
    submission: summary,
    jobs: jobs.map((job) => ({
      id: job.id,
      provider: job.provider,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      nextAttemptAt: job.nextAttemptAt,
      lastError: job.lastError,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  });
}

export async function replaySubmissionSideEffects(
  submissionId: string,
): Promise<ServiceResult<AdminReplaySubmissionResponse | { message: string }>> {
  const submission = await getStoredSubmissionById(submissionId);
  if (!submission) {
    return fail(404, { message: 'Submission not found.' });
  }

  const event =
    submission.kind === 'guide'
      ? buildGuideSubmissionEvent({ submission })
      : buildInquirySubmissionEvent({ submission });

  const enqueuedJobs = await enqueueIntegrationJobs({
    submissionId: submission.id,
    event,
  });
  await processOutboxTick(20);

  return ok({
    replayed: true,
    submissionId: submission.id,
    enqueuedJobs,
  });
}

export async function updateAdminSubmissionWorkflowStatus(input: {
  submissionId: string;
  workflowStatus: InquiryWorkflowStatus;
}): Promise<ServiceResult<{ submission: AdminSubmission } | { message: string }>> {
  const submission = await getStoredSubmissionById(input.submissionId);
  if (!submission) {
    return fail(404, { message: 'Submission not found.' });
  }

  if (submission.kind !== 'inquiry') {
    return fail(400, {
      message: 'Only inquiry submissions support workflow status updates.',
    });
  }

  const updated = await updateInquirySubmissionWorkflowStatus({
    submissionId: input.submissionId,
    workflowStatus: input.workflowStatus,
  });

  if (!updated) {
    return fail(404, { message: 'Submission not found.' });
  }

  return ok({
    submission: await toAdminSubmission(updated),
  });
}
