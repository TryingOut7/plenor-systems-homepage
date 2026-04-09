import { randomUUID } from 'node:crypto';
import type { OutboundEventV1, OutboxProvider } from '@plenor/contracts/events';
import type { RegistrationStatus } from '@plenor/contracts/forms';
import { getRegistrationStatusLabel } from '@/domain/org-site/registrationStatusCopy';
import type { StoredSubmission } from '@/infrastructure/persistence/backendStore';

interface BaseSubmissionPayload {
  submissionId: string;
  name: string;
  email: string;
}

export interface GuideSubmissionPayload extends BaseSubmissionPayload {
  templateId?: string | number;
  formId?: string | number;
}

export interface InquirySubmissionPayload extends BaseSubmissionPayload {
  company: string;
  challenge: string;
}

export type RegistrationStatusEventPayload = {
  publicId: string;
  eventId: string;
  eventTitle: string;
  registrantName: string;
  registrantEmail: string;
  statusCode: RegistrationStatus;
  statusLabel: string;
  userFacingReason: string | null;
  isPaid: boolean;
  previousStatusCode?: RegistrationStatus;
  previousStatusLabel?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

export function buildGuideSubmissionEvent(input: {
  submission: StoredSubmission;
  templateId?: string | number;
  formId?: string | number;
}): OutboundEventV1<GuideSubmissionPayload> {
  return {
    version: 'v1',
    id: randomUUID(),
    type: 'submission.guide.created',
    occurredAt: nowIso(),
    payload: {
      submissionId: input.submission.id,
      name: input.submission.name,
      email: input.submission.email,
      templateId: input.templateId,
      formId: input.formId,
    },
  };
}

export function buildInquirySubmissionEvent(input: {
  submission: StoredSubmission;
}): OutboundEventV1<InquirySubmissionPayload> {
  return {
    version: 'v1',
    id: randomUUID(),
    type: 'submission.inquiry.created',
    occurredAt: nowIso(),
    payload: {
      submissionId: input.submission.id,
      name: input.submission.name,
      email: input.submission.email,
      company: input.submission.company || '',
      challenge: input.submission.challenge || '',
    },
  };
}

export function buildRegistrationCreatedEvent(input: {
  publicId: string;
  eventId: string;
  eventTitle: string;
  registrantName: string;
  registrantEmail: string;
  userFacingReason?: string | null;
  submittedAt: string;
  isPaid: boolean;
}): OutboundEventV1<RegistrationStatusEventPayload> {
  return {
    version: 'v1',
    id: randomUUID(),
    type: 'submission.registration.created',
    occurredAt: input.submittedAt,
    payload: {
      publicId: input.publicId,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      registrantName: input.registrantName,
      registrantEmail: input.registrantEmail,
      statusCode: 'submitted',
      statusLabel: getRegistrationStatusLabel('submitted'),
      userFacingReason: input.userFacingReason ?? null,
      isPaid: input.isPaid,
    },
  };
}

export function buildRegistrationPaymentConfirmationEvent(input: {
  publicId: string;
  eventId: string;
  eventTitle: string;
  registrantName: string;
  registrantEmail: string;
  userFacingReason?: string | null;
  confirmedAt: string;
  isPaid: boolean;
}): OutboundEventV1<RegistrationStatusEventPayload> {
  return {
    version: 'v1',
    id: randomUUID(),
    type: 'submission.registration.payment_confirmation.submitted',
    occurredAt: input.confirmedAt,
    payload: {
      publicId: input.publicId,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      registrantName: input.registrantName,
      registrantEmail: input.registrantEmail,
      statusCode: 'payment_confirmation_submitted',
      statusLabel: getRegistrationStatusLabel('payment_confirmation_submitted'),
      userFacingReason: input.userFacingReason ?? null,
      isPaid: input.isPaid,
    },
  };
}

export function buildRegistrationStatusUpdatedEvent(input: {
  publicId: string;
  eventId: string;
  eventTitle: string;
  registrantName: string;
  registrantEmail: string;
  nextStatus: RegistrationStatus;
  previousStatus: RegistrationStatus;
  userFacingReason?: string | null;
  updatedAt: string;
  isPaid: boolean;
}): OutboundEventV1<RegistrationStatusEventPayload> {
  return {
    version: 'v1',
    id: randomUUID(),
    type: 'submission.registration.status.updated',
    occurredAt: input.updatedAt,
    payload: {
      publicId: input.publicId,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      registrantName: input.registrantName,
      registrantEmail: input.registrantEmail,
      statusCode: input.nextStatus,
      statusLabel: getRegistrationStatusLabel(input.nextStatus),
      userFacingReason: input.userFacingReason ?? null,
      isPaid: input.isPaid,
      previousStatusCode: input.previousStatus,
      previousStatusLabel: getRegistrationStatusLabel(input.previousStatus),
    },
  };
}

export function mapEventToOutboxJobs(
  event: OutboundEventV1<unknown>,
): Array<{
  provider: OutboxProvider;
  payload: Record<string, unknown>;
}> {
  const base = {
    event,
  };

  if (event.type === 'submission.guide.created') {
    return [
      {
        provider: 'crm',
        payload: base,
      },
      {
        provider: 'email.guide',
        payload: base,
      },
      {
        provider: 'payload.forms.guide',
        payload: base,
      },
      {
        provider: 'webhook',
        payload: base,
      },
    ];
  }

  if (
    event.type === 'submission.registration.created' ||
    event.type === 'submission.registration.payment_confirmation.submitted' ||
    event.type === 'submission.registration.status.updated'
  ) {
    return [
      {
        provider: 'email.registration',
        payload: base,
      },
      {
        provider: 'webhook',
        payload: base,
      },
    ];
  }

  return [
    {
      provider: 'crm',
      payload: base,
    },
    {
      provider: 'email.inquiry',
      payload: base,
    },
    {
      provider: 'payload.forms.inquiry',
      payload: base,
    },
    {
      provider: 'webhook',
      payload: base,
    },
  ];
}
