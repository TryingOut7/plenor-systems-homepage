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
}

export interface InquirySubmissionPayload extends BaseSubmissionPayload {
  company: string;
  challenge: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildGuideSubmissionEvent(input: {
  submission: StoredSubmission;
  templateId?: string | number;
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
