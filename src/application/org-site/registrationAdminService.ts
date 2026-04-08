import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from '@/domain/org-site/constants';
import { canTransition, type RegistrationActorRole } from '@/domain/org-site/registrationWorkflow';
import {
  validateAdminStatusUpdateBody,
  type RegistrationPayload,
} from '@/domain/org-site/registrationValidator';
import {
  getEventRegistrationConfigById,
  getSubmissionByPublicId,
  listSubmissions,
  updateSubmissionStatusWithAudit,
  type RegistrationSubmissionListRecord,
  type RegistrationSubmissionRecord,
} from '@/infrastructure/persistence/registrationSubmissionRepository';
import type {
  AdminRegistrationSubmission,
  AdminRegistrationSubmissionDetailResponse,
  AdminRegistrationSubmissionsListResponse,
  FormSubmissionErrorResponse,
} from '@plenor/contracts/forms';

type ListResponse = AdminRegistrationSubmissionsListResponse | FormSubmissionErrorResponse;
type DetailResponse = AdminRegistrationSubmissionDetailResponse | FormSubmissionErrorResponse;

const PUBLIC_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parsePublicId(raw: string): string | null {
  const normalized = raw.trim();
  if (!normalized) return null;
  if (!PUBLIC_ID_RE.test(normalized)) return null;
  return normalized;
}

function readEmailDomain(email: string): string {
  const at = email.lastIndexOf('@');
  if (at < 0) return 'invalid';
  return email.slice(at + 1).toLowerCase() || 'invalid';
}

function failWithCode(
  status: number,
  context: RequestContext,
  message: string,
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'TRANSITION_FORBIDDEN' | 'INTERNAL_ERROR',
): ServiceResult<FormSubmissionErrorResponse> {
  return fail(status, {
    message,
    code,
    requestId: context.requestId,
  });
}

function toAdminSubmission(
  record: RegistrationSubmissionRecord | RegistrationSubmissionListRecord,
): AdminRegistrationSubmission {
  return {
    publicId: record.publicId,
    eventId: record.eventId,
    status: record.status,
    registrationPayload: record.registrationPayload,
    paymentConfirmationPayload: record.paymentConfirmationPayload,
    internalReason: record.internalReason,
    userFacingReason: record.userFacingReason,
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
  };
}

function parseListFilters(
  context: RequestContext,
):
  | { ok: true; value: { page: number; limit: number; status?: RegistrationStatus; eventId?: string } }
  | { ok: false; result: ServiceResult<FormSubmissionErrorResponse> } {
  const url = new URL(context.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1') || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '20') || 20));

  const statusRaw = url.searchParams.get('status');
  let status: RegistrationStatus | undefined;
  if (typeof statusRaw === 'string' && statusRaw.trim()) {
    const normalized = statusRaw.trim() as RegistrationStatus;
    if (!REGISTRATION_STATUSES.includes(normalized)) {
      return {
        ok: false,
        result: failWithCode(400, context, 'status filter is invalid.', 'VALIDATION_ERROR'),
      };
    }
    status = normalized;
  }

  const eventIdRaw = url.searchParams.get('eventId');
  const eventId = typeof eventIdRaw === 'string' && eventIdRaw.trim() ? eventIdRaw.trim() : undefined;

  return {
    ok: true,
    value: {
      page,
      limit,
      ...(status ? { status } : {}),
      ...(eventId ? { eventId } : {}),
    },
  };
}

function logStatusUpdate(input: {
  record: RegistrationSubmissionRecord;
  requestId?: string;
}): void {
  const payload = input.record.registrationPayload as RegistrationPayload;
  console.info('Org-site registration event', {
    event: 'status.updated',
    publicId: input.record.publicId,
    eventId: input.record.eventId,
    status: input.record.status,
    emailDomain: readEmailDomain(payload.email),
    nameLength: payload.name.length,
    requestId: input.requestId,
  });
}

export async function listRegistrationSubmissions(
  context: RequestContext,
): Promise<ServiceResult<ListResponse>> {
  const parsed = parseListFilters(context);
  if (!parsed.ok) {
    return parsed.result;
  }

  try {
    const listed = await listSubmissions(parsed.value);
    return ok({
      items: listed.items.map(toAdminSubmission),
      meta: {
        total: listed.total,
        page: parsed.value.page,
        limit: parsed.value.limit,
        totalPages: Math.max(1, Math.ceil(listed.total / parsed.value.limit)),
        byStatus: listed.byStatus,
      },
    });
  } catch (error) {
    console.error('Org-site registration list failed.', {
      requestId: context.requestId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return failWithCode(500, context, 'Unable to list registration submissions.', 'INTERNAL_ERROR');
  }
}

export async function getRegistrationSubmission(
  context: RequestContext,
  publicIdRaw: string,
): Promise<ServiceResult<DetailResponse>> {
  const publicId = parsePublicId(publicIdRaw);
  if (!publicId) {
    return failWithCode(400, context, 'publicId is invalid.', 'VALIDATION_ERROR');
  }

  try {
    const submission = await getSubmissionByPublicId(publicId);
    if (!submission) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    return ok({
      submission: toAdminSubmission(submission),
    });
  } catch (error) {
    console.error('Org-site registration detail failed.', {
      requestId: context.requestId,
      publicId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return failWithCode(500, context, 'Unable to fetch registration submission.', 'INTERNAL_ERROR');
  }
}

export async function updateRegistrationStatus(
  context: RequestContext,
  publicIdRaw: string,
  body: unknown,
  actor: { role: RegistrationActorRole; keyId: string },
): Promise<ServiceResult<DetailResponse>> {
  const publicId = parsePublicId(publicIdRaw);
  if (!publicId) {
    return failWithCode(400, context, 'publicId is invalid.', 'VALIDATION_ERROR');
  }

  const validation = validateAdminStatusUpdateBody(body);
  if (!validation.ok) {
    return failWithCode(400, context, validation.message, 'VALIDATION_ERROR');
  }

  try {
    const current = await getSubmissionByPublicId(publicId);
    if (!current) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    const eventId = current.eventId;
    if (!eventId) {
      return failWithCode(404, context, 'Related event not found.', 'NOT_FOUND');
    }

    const event = await getEventRegistrationConfigById(eventId, {
      publishedOnly: false,
    });
    if (!event) {
      return failWithCode(404, context, 'Related event not found.', 'NOT_FOUND');
    }

    if (!canTransition(actor.role, current.status, validation.data.status, event.paymentRequired)) {
      return failWithCode(
        403,
        context,
        'Status transition is not allowed for this event and current state.',
        'TRANSITION_FORBIDDEN',
      );
    }

    const updated = await updateSubmissionStatusWithAudit({
      publicId,
      nextStatus: validation.data.status,
      internalReason: validation.data.internalReason,
      userFacingReason: validation.data.userFacingReason,
      actorKeyId: actor.keyId,
    });

    if (!updated.after) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    logStatusUpdate({
      record: updated.after,
      requestId: context.requestId,
    });

    return ok({
      submission: toAdminSubmission(updated.after),
    });
  } catch (error) {
    console.error('Org-site registration status update failed.', {
      requestId: context.requestId,
      publicId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return failWithCode(500, context, 'Unable to update registration status.', 'INTERNAL_ERROR');
  }
}
