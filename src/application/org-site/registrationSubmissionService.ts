import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { REGISTRATION_STATUSES } from '@/domain/org-site/constants';
import { canTransition } from '@/domain/org-site/registrationWorkflow';
import {
  validatePaymentConfirmationBody,
  validateRegistrationSubmissionBody,
  type PaymentConfirmationPayload,
  type RegistrationPayload,
} from '@/domain/org-site/registrationValidator';
import { processOutboxTick } from '@/infrastructure/integrations/outboxService';
import {
  countActiveSubmissionsForEvent,
  findSubmissionByEventAndEmail,
  getEventRegistrationConfigById,
  getSubmissionByPublicId,
  getSubmissionStatusByPublicId,
  isStatusAtOrBeyond,
  persistPaymentConfirmationWithOutbox,
  persistRegistrationSubmissionWithOutbox,
  type RegistrationSubmissionRecord,
} from '@/infrastructure/persistence/registrationSubmissionRepository';
import { verifyRequestOrigin } from '@/infrastructure/security/originVerifier';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  FormSubmissionErrorResponse,
  RegistrationStatusResponse,
  RegistrationSubmissionResponse,
} from '@plenor/contracts/forms';

type RegistrationServiceResponse = RegistrationSubmissionResponse | FormSubmissionErrorResponse;
type RegistrationStatusServiceResponse = RegistrationStatusResponse | FormSubmissionErrorResponse;

const PAYMENT_PENDING = REGISTRATION_STATUSES[1];
const PAYMENT_CONFIRMATION_SUBMITTED = REGISTRATION_STATUSES[2];

const PUBLIC_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readEmailDomain(email: string): string {
  const at = email.lastIndexOf('@');
  if (at < 0) return 'invalid';
  return email.slice(at + 1).toLowerCase() || 'invalid';
}

function redactRegistrationPayload(payload: RegistrationPayload): {
  emailDomain: string;
  nameLength: number;
} {
  return {
    emailDomain: readEmailDomain(payload.email),
    nameLength: payload.name.length,
  };
}

function statusResponse(input: {
  publicId: string;
  status: RegistrationStatusResponse['status'];
  userFacingReason: string | null;
}): RegistrationStatusResponse {
  return {
    publicId: input.publicId,
    status: input.status,
    userFacingReason: input.userFacingReason,
  };
}

function submissionResponse(record: RegistrationSubmissionRecord): RegistrationSubmissionResponse {
  return {
    success: true,
    publicId: record.publicId,
    status: record.status,
    userFacingReason: record.userFacingReason,
  };
}

function failWithCode(
  status: number,
  context: RequestContext,
  message: string,
  code:
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'ALREADY_EXISTS'
    | 'REGISTRATION_FULL'
    | 'REGISTRATION_NOT_OPEN'
    | 'REGISTRATION_CLOSED'
    | 'TRANSITION_FORBIDDEN'
    | 'INTERNAL_ERROR',
): ServiceResult<FormSubmissionErrorResponse> {
  return fail(status, {
    message,
    code,
    requestId: context.requestId,
  });
}

function parsePublicId(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!PUBLIC_ID_RE.test(normalized)) return null;
  return normalized;
}

function logRegistrationEvent(input: {
  event: 'registration.created' | 'payment_confirmation.received';
  record: RegistrationSubmissionRecord;
  requestId?: string;
}): void {
  const redacted = redactRegistrationPayload(input.record.registrationPayload);
  console.info('Org-site registration event', {
    event: input.event,
    publicId: input.record.publicId,
    eventId: input.record.eventId,
    status: input.record.status,
    emailDomain: redacted.emailDomain,
    nameLength: redacted.nameLength,
    requestId: input.requestId,
  });
}

async function processRegistrationOutboxTick(): Promise<void> {
  try {
    await processOutboxTick(10);
  } catch (error) {
    console.error('Org-site registration outbox tick failed.', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function submitRegistration(
  context: RequestContext,
  body: unknown,
): Promise<ServiceResult<RegistrationServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  const validation = validateRegistrationSubmissionBody(body);
  if (!validation.ok) {
    return failWithCode(400, context, validation.message, 'VALIDATION_ERROR');
  }

  try {
    const event = await getEventRegistrationConfigById(validation.data.eventId, {
      publishedOnly: true,
    });

    if (!event || event.status !== 'published') {
      return failWithCode(404, context, 'Event not found.', 'NOT_FOUND');
    }

    if (!event.registrationRequired) {
      return failWithCode(
        422,
        context,
        'Registration is not enabled for this event.',
        'VALIDATION_ERROR',
      );
    }

    const duplicate = await findSubmissionByEventAndEmail(
      validation.data.eventId,
      validation.data.registrationPayload.email,
    );
    if (duplicate) {
      return failWithCode(
        409,
        context,
        'A registration already exists for this event and email.',
        'ALREADY_EXISTS',
      );
    }

    const nowMs = Date.now();

    if (event.maxRegistrations !== null) {
      const activeCount = await countActiveSubmissionsForEvent(validation.data.eventId);
      if (activeCount >= event.maxRegistrations) {
        return failWithCode(409, context, 'Registration capacity has been reached.', 'REGISTRATION_FULL');
      }
    }

    if (event.registrationOpensAt) {
      const opensAtMs = Date.parse(event.registrationOpensAt);
      if (Number.isFinite(opensAtMs) && nowMs < opensAtMs) {
        return failWithCode(422, context, 'Registration is not open yet.', 'REGISTRATION_NOT_OPEN');
      }
    }

    if (event.registrationClosesAt) {
      const closesAtMs = Date.parse(event.registrationClosesAt);
      if (Number.isFinite(closesAtMs) && nowMs > closesAtMs) {
        return failWithCode(422, context, 'Registration is closed for this event.', 'REGISTRATION_CLOSED');
      }
    }

    const saved = await persistRegistrationSubmissionWithOutbox({
      eventId: validation.data.eventId,
      registrationPayload: validation.data.registrationPayload,
      eventTitle: event.eventTitle,
      isPaid: event.paymentRequired,
    });

    logRegistrationEvent({
      event: 'registration.created',
      record: saved,
      requestId: context.requestId,
    });

    await processRegistrationOutboxTick();

    return ok(submissionResponse(saved), 200);
  } catch (error) {
    console.error('Org-site registration submission failed.', {
      errorMessage: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
    });
    return failWithCode(
      500,
      context,
      'Unable to process registration at this time. Please try again later.',
      'INTERNAL_ERROR',
    );
  }
}

export async function getRegistrationStatus(
  context: RequestContext,
  publicIdRaw: string,
): Promise<ServiceResult<RegistrationStatusServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const publicId = parsePublicId(publicIdRaw);
  if (!publicId) {
    return failWithCode(400, context, 'publicId is invalid.', 'VALIDATION_ERROR');
  }

  try {
    const statusRecord = await getSubmissionStatusByPublicId(publicId);
    if (!statusRecord) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    return ok(statusResponse(statusRecord), 200);
  } catch (error) {
    console.error('Org-site registration status check failed.', {
      errorMessage: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      publicId,
    });
    return failWithCode(500, context, 'Unable to retrieve registration status.', 'INTERNAL_ERROR');
  }
}

export async function submitPaymentConfirmation(
  context: RequestContext,
  publicIdRaw: string,
  body: unknown,
): Promise<ServiceResult<RegistrationStatusServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const originError = verifyRequestOrigin(context);
  if (originError) {
    return originError;
  }

  const publicId = parsePublicId(publicIdRaw);
  if (!publicId) {
    return failWithCode(400, context, 'publicId is invalid.', 'VALIDATION_ERROR');
  }

  const validation = validatePaymentConfirmationBody(body);
  if (!validation.ok) {
    return failWithCode(400, context, validation.message, 'VALIDATION_ERROR');
  }

  try {
    const existing = await getSubmissionByPublicId(publicId);
    if (!existing) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    const eventId = existing.eventId;
    if (!eventId) {
      return failWithCode(404, context, 'Related event not found.', 'NOT_FOUND');
    }

    const event = await getEventRegistrationConfigById(eventId, {
      publishedOnly: false,
    });
    if (!event) {
      return failWithCode(404, context, 'Related event not found.', 'NOT_FOUND');
    }

    if (!event.paymentRequired) {
      return failWithCode(
        403,
        context,
        'Payment confirmation is not required for this event.',
        'TRANSITION_FORBIDDEN',
      );
    }

    if (
      existing.paymentConfirmationPayload &&
      isStatusAtOrBeyond(existing.status, PAYMENT_CONFIRMATION_SUBMITTED)
    ) {
      return ok(statusResponse(existing), 200);
    }

    if (!canTransition('public', existing.status, PAYMENT_CONFIRMATION_SUBMITTED, true)) {
      return failWithCode(
        403,
        context,
        'Payment confirmation is not allowed in the current status.',
        'TRANSITION_FORBIDDEN',
      );
    }

    const updated = await persistPaymentConfirmationWithOutbox({
      publicId,
      payload: validation.data.paymentConfirmationPayload as PaymentConfirmationPayload,
    });

    if (!updated) {
      return failWithCode(404, context, 'Registration not found.', 'NOT_FOUND');
    }

    logRegistrationEvent({
      event: 'payment_confirmation.received',
      record: updated,
      requestId: context.requestId,
    });

    await processRegistrationOutboxTick();

    return ok(statusResponse(updated), 200);
  } catch (error) {
    console.error('Org-site payment confirmation failed.', {
      errorMessage: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      publicId,
    });
    return failWithCode(500, context, 'Unable to process payment confirmation.', 'INTERNAL_ERROR');
  }
}

export function shouldShowPaymentStep(status: RegistrationStatusResponse['status']): boolean {
  return status === PAYMENT_PENDING;
}
