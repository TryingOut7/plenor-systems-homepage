import type { OutboundEventV1 } from '@plenor/contracts/events';
import { getIntegrationProviders } from '@/infrastructure/integrations/defaultProviders';
import { mapEventToOutboxJobs } from '@/infrastructure/integrations/outboundEvents';
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

  if (job.provider === 'payload.forms.guide') {
    await providers.payloadForms.saveGuideSubmission({
      name: String(payload.name || ''),
      email: String(payload.email || ''),
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
