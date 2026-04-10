import { randomUUID } from 'node:crypto';
import { getIntegrationProviders } from '@/infrastructure/integrations/defaultProviders';
import { buildGuideSubmissionEvent, buildInquirySubmissionEvent } from '@/infrastructure/integrations/outboundEvents';
import type { StoredSubmission } from '@/infrastructure/persistence/backendStore';

function buildFallbackSubmission(input: {
  kind: StoredSubmission['kind'];
  name: string;
  email: string;
  company?: string;
  challenge?: string;
}): StoredSubmission {
  return {
    id: `${input.kind}_${randomUUID()}`,
    kind: input.kind,
    name: input.name,
    email: input.email,
    company: input.company,
    challenge: input.challenge,
    submittedAt: new Date().toISOString(),
  };
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runBestEffort(label: string, action: () => Promise<void>): Promise<boolean> {
  try {
    await action();
    return true;
  } catch (error) {
    console.error(`[forms:fallback] ${label} failed.`, {
      errorMessage: readErrorMessage(error),
    });
    return false;
  }
}

export function shouldAttemptSubmissionFallback(error: unknown): boolean {
  const message = readErrorMessage(error);
  return /permission denied for schema public|persistent table|persistence is unavailable|\[backend-store\]/i.test(
    message,
  );
}

export async function dispatchGuideSubmissionFallback(input: {
  name: string;
  email: string;
  templateId?: string | number;
  formId?: string | number;
}): Promise<boolean> {
  const providers = getIntegrationProviders();
  const submission = buildFallbackSubmission({
    kind: 'guide',
    name: input.name,
    email: input.email,
  });
  const event = buildGuideSubmissionEvent({
    submission,
    templateId: input.templateId,
    formId: input.formId,
  });

  const payloadSaved = await runBestEffort('guide payload form persistence', async () => {
    await providers.payloadForms.saveGuideSubmission({
      name: input.name,
      email: input.email,
      formId: input.formId,
    });
  });

  const emailSent = await runBestEffort('guide email delivery', async () => {
    await providers.email.sendGuideDelivery({
      event,
      name: input.name,
      email: input.email,
      templateId: input.templateId,
      formId: input.formId,
    });
  });

  await runBestEffort('guide CRM dispatch', async () => {
    await providers.crm.send(event);
  });

  await runBestEffort('guide webhook dispatch', async () => {
    await providers.webhook.send(event);
  });

  return payloadSaved || emailSent;
}

export async function dispatchInquirySubmissionFallback(input: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}): Promise<boolean> {
  const providers = getIntegrationProviders();
  const submission = buildFallbackSubmission({
    kind: 'inquiry',
    name: input.name,
    email: input.email,
    company: input.company,
    challenge: input.challenge,
  });
  const event = buildInquirySubmissionEvent({ submission });

  const payloadSaved = await runBestEffort('inquiry payload form persistence', async () => {
    await providers.payloadForms.saveInquirySubmission({
      name: input.name,
      email: input.email,
      company: input.company,
      challenge: input.challenge,
    });
  });

  const emailSent = await runBestEffort('inquiry routing email', async () => {
    await providers.email.sendInquiryRouting({
      event,
      name: input.name,
      email: input.email,
      company: input.company,
      challenge: input.challenge,
    });
  });

  await runBestEffort('inquiry CRM dispatch', async () => {
    await providers.crm.send(event);
  });

  await runBestEffort('inquiry webhook dispatch', async () => {
    await providers.webhook.send(event);
  });

  return payloadSaved || emailSent;
}
