import type { OutboundEventV1 } from '@plenor/contracts/events';
import type { RegistrationStatus } from '@plenor/contracts/forms';
import { getIntegrationProviders } from '@/infrastructure/integrations/defaultProviders';
import {
  mapEventToOutboxJobs,
  type RegistrationStatusEventPayload,
} from '@/infrastructure/integrations/outboundEvents';
import {
  claimDueOutboxJobs,
  enqueueOutboxJobs,
  listOutboxJobsBySubmission,
  markOutboxJobFailed,
  markOutboxJobSucceeded,
  type OutboxJob,
} from '@/infrastructure/persistence/backendStore';

function asEvent(value: unknown): OutboundEventV1<unknown> {
  return value as OutboundEventV1<unknown>;
}

function readRequiredString(
  payload: Record<string, unknown>,
  field: keyof RegistrationStatusEventPayload,
): string {
  const value = payload[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Registration outbox event is missing required payload field "${field}".`);
  }

  return value.trim();
}

function readRegistrationStatusPayload(
  event: OutboundEventV1<unknown>,
): RegistrationStatusEventPayload {
  const payload = (event.payload || {}) as Record<string, unknown>;
  const statusCode = readRequiredString(payload, 'statusCode') as RegistrationStatus;
  const statusLabel = readRequiredString(payload, 'statusLabel');
  const isPaid = payload.isPaid;

  if (typeof isPaid !== 'boolean') {
    throw new Error('Registration outbox event is missing required payload field "isPaid".');
  }

  return {
    publicId: readRequiredString(payload, 'publicId'),
    eventId: readRequiredString(payload, 'eventId'),
    eventTitle: readRequiredString(payload, 'eventTitle'),
    registrantName: readRequiredString(payload, 'registrantName'),
    registrantEmail: readRequiredString(payload, 'registrantEmail'),
    statusCode,
    statusLabel,
    userFacingReason:
      typeof payload.userFacingReason === 'string' ? payload.userFacingReason : null,
    isPaid,
    previousStatusCode:
      typeof payload.previousStatusCode === 'string'
        ? (payload.previousStatusCode as RegistrationStatus)
        : undefined,
    previousStatusLabel:
      typeof payload.previousStatusLabel === 'string' ? payload.previousStatusLabel : undefined,
  };
}

async function dispatchOutboxJob(job: OutboxJob): Promise<void> {
  const providers = getIntegrationProviders();
  const event = asEvent(job.payload.event);
  const payload = (event.payload || {}) as Record<string, unknown>;

  if (job.provider === 'crm') {
    await providers.crm.send(event);
    return;
  }

  if (job.provider === 'webhook') {
    await providers.webhook.send(event);
    return;
  }

  if (job.provider === 'email.guide') {
    await providers.email.sendGuideDelivery({
      event,
      name: String(payload.name || ''),
      email: String(payload.email || ''),
      formId:
        payload.formId != null
          ? (payload.formId as string | number)
          : undefined,
      templateId:
        payload.templateId != null
          ? (payload.templateId as string | number)
          : undefined,
    });
    return;
  }

  if (job.provider === 'email.inquiry') {
    await providers.email.sendInquiryRouting({
      event,
      name: String(payload.name || ''),
      email: String(payload.email || ''),
      company: String(payload.company || ''),
      challenge: String(payload.challenge || ''),
    });
    return;
  }

  if (job.provider === 'email.registration') {
    const registrationStatus = readRegistrationStatusPayload(event);
    await providers.email.sendRegistrationStatusUpdate({
      event,
      publicId: registrationStatus.publicId,
      eventId: registrationStatus.eventId,
      eventTitle: registrationStatus.eventTitle,
      registrantName: registrationStatus.registrantName,
      registrantEmail: registrationStatus.registrantEmail,
      statusCode: registrationStatus.statusCode,
      statusLabel: registrationStatus.statusLabel,
      userFacingReason: registrationStatus.userFacingReason ?? null,
      isPaid: registrationStatus.isPaid,
    });
    return;
  }

  if (job.provider === 'payload.forms.guide') {
    await providers.payloadForms.saveGuideSubmission({
      name: String(payload.name || ''),
      email: String(payload.email || ''),
      formId:
        payload.formId != null
          ? (payload.formId as string | number)
          : undefined,
    });
    return;
  }

  if (job.provider === 'payload.forms.inquiry') {
    await providers.payloadForms.saveInquirySubmission({
      name: String(payload.name || ''),
      email: String(payload.email || ''),
      company: String(payload.company || ''),
      challenge: String(payload.challenge || ''),
    });
    return;
  }

  throw new Error(`Unknown outbox provider "${job.provider}"`);
}

export async function enqueueIntegrationJobs(input: {
  submissionId: string;
  event: OutboundEventV1<unknown>;
}): Promise<number> {
  const jobs = mapEventToOutboxJobs(input.event).map((job) => ({
    submissionId: input.submissionId,
    provider: job.provider,
    payload: job.payload,
  }));
  const created = await enqueueOutboxJobs(jobs);
  return created.length;
}

export async function processOutboxTick(limit = 25): Promise<{
  processed: number;
  failed: number;
}> {
  const jobs = await claimDueOutboxJobs(limit);
  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await dispatchOutboxJob(job);
      await markOutboxJobSucceeded(job.id);
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markOutboxJobFailed(job.id, message);
      failed += 1;
    }
  }

  return { processed, failed };
}

export async function getOutboxJobsForSubmission(submissionId: string) {
  return listOutboxJobsBySubmission(submissionId);
}
