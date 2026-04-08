import { randomUUID } from 'node:crypto';
import type { OutboundEventV1, OutboxProvider } from '@plenor/contracts/events';
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

export type RegistrationCreatedPayload = {
  publicId: string;
  eventId: string;
  eventTitle: string;
  submittedAt: string;
  isPaid: boolean;
};

export type PaymentConfirmationPayload = {
  publicId: string;
  eventId: string;
  confirmedAt: string;
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
    event.type === 'submission.registration.payment_confirmation.submitted'
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
