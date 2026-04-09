import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { OutboxJob } from '@/infrastructure/persistence/backendStore';

vi.mock('@/infrastructure/persistence/backendStore', () => ({
  claimDueOutboxJobs: vi.fn(),
  enqueueOutboxJobs: vi.fn(),
  listOutboxJobsBySubmission: vi.fn(),
  markOutboxJobSucceeded: vi.fn(),
  markOutboxJobFailed: vi.fn(),
}));

vi.mock('@/infrastructure/integrations/defaultProviders', () => ({
  getIntegrationProviders: vi.fn(),
}));

vi.mock('@/infrastructure/integrations/outboundEvents', () => ({
  mapEventToOutboxJobs: vi.fn(),
}));

import {
  claimDueOutboxJobs,
  enqueueOutboxJobs,
  markOutboxJobSucceeded,
  markOutboxJobFailed,
} from '@/infrastructure/persistence/backendStore';
import { getIntegrationProviders } from '@/infrastructure/integrations/defaultProviders';
import { mapEventToOutboxJobs } from '@/infrastructure/integrations/outboundEvents';
import { processOutboxTick, enqueueIntegrationJobs } from '@/infrastructure/integrations/outboxService';

const mockClaimDueOutboxJobs = vi.mocked(claimDueOutboxJobs);
const mockMarkOutboxJobSucceeded = vi.mocked(markOutboxJobSucceeded);
const mockMarkOutboxJobFailed = vi.mocked(markOutboxJobFailed);
const mockGetIntegrationProviders = vi.mocked(getIntegrationProviders);
const mockEnqueueOutboxJobs = vi.mocked(enqueueOutboxJobs);
const mockMapEventToOutboxJobs = vi.mocked(mapEventToOutboxJobs);

function makeJob(overrides: Partial<OutboxJob> = {}): OutboxJob {
  return {
    id: 'job_1',
    submissionId: 'sub_1',
    provider: 'crm',
    status: 'processing',
    attempts: 1,
    maxAttempts: 3,
    nextAttemptAt: new Date().toISOString(),
    payload: { event: { type: 'guide.submitted', occurredAt: new Date().toISOString(), payload: { name: 'Alice', email: 'alice@example.com' } } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProviders(overrides: Record<string, unknown> = {}) {
  return {
    crm: { send: vi.fn().mockResolvedValue(undefined) },
    webhook: { send: vi.fn().mockResolvedValue(undefined) },
    email: {
      sendGuideDelivery: vi.fn().mockResolvedValue(undefined),
      sendInquiryRouting: vi.fn().mockResolvedValue(undefined),
      sendRegistrationStatusUpdate: vi.fn().mockResolvedValue(undefined),
    },
    payloadForms: {
      saveGuideSubmission: vi.fn().mockResolvedValue(undefined),
      saveInquirySubmission: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}

describe('outboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkOutboxJobSucceeded.mockResolvedValue(undefined as never);
    mockMarkOutboxJobFailed.mockResolvedValue(undefined as never);
  });

  describe('processOutboxTick', () => {
    it('returns zero counts when no jobs are claimed', async () => {
      mockClaimDueOutboxJobs.mockResolvedValue([]);
      const result = await processOutboxTick();
      expect(result).toEqual({ processed: 0, failed: 0 });
    });

    it('marks job succeeded on successful dispatch', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'crm' });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      const result = await processOutboxTick();

      expect(providers.crm.send).toHaveBeenCalledTimes(1);
      expect(mockMarkOutboxJobSucceeded).toHaveBeenCalledWith('job_1');
      expect(mockMarkOutboxJobFailed).not.toHaveBeenCalled();
      expect(result).toEqual({ processed: 1, failed: 0 });
    });

    it('marks job failed and captures error message when dispatch throws', async () => {
      const providers = makeProviders({
        crm: { send: vi.fn().mockRejectedValue(new Error('CRM unavailable')) },
      });
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'crm' });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      const result = await processOutboxTick();

      expect(mockMarkOutboxJobFailed).toHaveBeenCalledWith('job_1', 'CRM unavailable');
      expect(mockMarkOutboxJobSucceeded).not.toHaveBeenCalled();
      expect(result).toEqual({ processed: 0, failed: 1 });
    });

    it('handles mix of successes and failures correctly', async () => {
      const providers = makeProviders({
        crm: { send: vi.fn().mockResolvedValue(undefined) },
        webhook: { send: vi.fn().mockRejectedValue(new Error('webhook down')) },
      });
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const jobs = [
        makeJob({ id: 'job_1', provider: 'crm' }),
        makeJob({ id: 'job_2', provider: 'webhook' }),
        makeJob({ id: 'job_3', provider: 'crm' }),
      ];
      mockClaimDueOutboxJobs.mockResolvedValue(jobs);

      const result = await processOutboxTick();

      expect(result).toEqual({ processed: 2, failed: 1 });
      expect(mockMarkOutboxJobSucceeded).toHaveBeenCalledWith('job_1');
      expect(mockMarkOutboxJobSucceeded).toHaveBeenCalledWith('job_3');
      expect(mockMarkOutboxJobFailed).toHaveBeenCalledWith('job_2', 'webhook down');
    });

    it('marks job failed when dispatch throws a non-Error value', async () => {
      const providers = makeProviders({
        crm: { send: vi.fn().mockRejectedValue('string error') },
      });
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'crm' });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(mockMarkOutboxJobFailed).toHaveBeenCalledWith('job_1', 'string error');
    });

    it('passes the limit argument to claimDueOutboxJobs', async () => {
      mockClaimDueOutboxJobs.mockResolvedValue([]);
      await processOutboxTick(10);
      expect(mockClaimDueOutboxJobs).toHaveBeenCalledWith(10);
    });
  });

  describe('provider dispatch', () => {
    it('dispatches crm provider via providers.crm.send', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'crm' });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.crm.send).toHaveBeenCalledTimes(1);
      expect(providers.webhook.send).not.toHaveBeenCalled();
    });

    it('dispatches webhook provider via providers.webhook.send', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'webhook' });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.webhook.send).toHaveBeenCalledTimes(1);
      expect(providers.crm.send).not.toHaveBeenCalled();
    });

    it('dispatches email.guide provider via providers.email.sendGuideDelivery with payload fields', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.guide',
        payload: {
          event: {
            type: 'guide.submitted',
            occurredAt: new Date().toISOString(),
            payload: { name: 'Bob', email: 'bob@example.com', templateId: 42 },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.email.sendGuideDelivery).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bob', email: 'bob@example.com', templateId: 42 }),
      );
    });

    it('dispatches email.inquiry provider via providers.email.sendInquiryRouting with payload fields', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.inquiry',
        payload: {
          event: {
            type: 'inquiry.submitted',
            occurredAt: new Date().toISOString(),
            payload: { name: 'Carol', email: 'carol@example.com', company: 'Acme', challenge: 'Scale' },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.email.sendInquiryRouting).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Carol', email: 'carol@example.com', company: 'Acme', challenge: 'Scale' }),
      );
    });

    it('dispatches email.registration provider via providers.email.sendRegistrationStatusUpdate', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.registration',
        payload: {
          event: {
            type: 'submission.registration.created',
            occurredAt: new Date().toISOString(),
            payload: {
              publicId: 'reg-1',
              eventId: '123',
              eventTitle: 'Spring Concert',
              registrantName: 'Alice',
              registrantEmail: 'alice@example.com',
              statusCode: 'submitted',
              statusLabel: 'Registration Submitted',
              userFacingReason: null,
              isPaid: true,
            },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.email.sendRegistrationStatusUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: 'reg-1',
          eventId: '123',
          eventTitle: 'Spring Concert',
          registrantName: 'Alice',
          registrantEmail: 'alice@example.com',
          statusCode: 'submitted',
          statusLabel: 'Registration Submitted',
          isPaid: true,
        }),
      );
    });

    it('dispatches payment confirmation registration event with human-readable status label', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.registration',
        payload: {
          event: {
            type: 'submission.registration.payment_confirmation.submitted',
            occurredAt: new Date().toISOString(),
            payload: {
              publicId: 'reg-2',
              eventId: '456',
              eventTitle: 'Scholarship Gala',
              registrantName: 'Bob',
              registrantEmail: 'bob@example.com',
              statusCode: 'payment_confirmation_submitted',
              statusLabel: 'Payment Confirmation Submitted',
              userFacingReason: null,
              isPaid: true,
            },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.email.sendRegistrationStatusUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: 'reg-2',
          eventId: '456',
          registrantEmail: 'bob@example.com',
          statusCode: 'payment_confirmation_submitted',
          statusLabel: 'Payment Confirmation Submitted',
        }),
      );
    });

    it('dispatches admin status update registration events with user-facing reason', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.registration',
        payload: {
          event: {
            type: 'submission.registration.status.updated',
            occurredAt: new Date().toISOString(),
            payload: {
              publicId: 'reg-3',
              eventId: '789',
              eventTitle: 'Summer Workshop',
              registrantName: 'Carol',
              registrantEmail: 'carol@example.com',
              statusCode: 'cancelled_rejected',
              statusLabel: 'Registration Cancelled',
              previousStatusCode: 'payment_pending',
              previousStatusLabel: 'Payment Pending',
              userFacingReason: 'The event is full.',
              isPaid: true,
            },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.email.sendRegistrationStatusUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: 'reg-3',
          statusCode: 'cancelled_rejected',
          userFacingReason: 'The event is full.',
        }),
      );
    });

    it('fails registration email dispatch when publicId is missing from payload', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'email.registration',
        payload: {
          event: {
            type: 'submission.registration.created',
            occurredAt: new Date().toISOString(),
            payload: {
              eventId: 'missing-public-id',
              eventTitle: 'Workshop',
              registrantName: 'Alice',
              registrantEmail: 'alice@example.com',
              statusCode: 'submitted',
              statusLabel: 'Registration Submitted',
              userFacingReason: null,
              isPaid: false,
            },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      const result = await processOutboxTick();

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(mockMarkOutboxJobFailed).toHaveBeenCalledWith(
        'job_1',
        'Registration outbox event is missing required payload field "publicId".',
      );
      expect(providers.email.sendRegistrationStatusUpdate).not.toHaveBeenCalled();
    });

    it('dispatches payload.forms.guide via providers.payloadForms.saveGuideSubmission', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'payload.forms.guide',
        payload: {
          event: {
            type: 'guide.submitted',
            occurredAt: new Date().toISOString(),
            payload: { name: 'Dave', email: 'dave@example.com' },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.payloadForms.saveGuideSubmission).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Dave', email: 'dave@example.com' }),
      );
    });

    it('dispatches payload.forms.inquiry via providers.payloadForms.saveInquirySubmission', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({
        provider: 'payload.forms.inquiry',
        payload: {
          event: {
            type: 'inquiry.submitted',
            occurredAt: new Date().toISOString(),
            payload: { name: 'Eve', email: 'eve@example.com', company: 'Corp', challenge: 'Growth' },
          },
        },
      });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      await processOutboxTick();

      expect(providers.payloadForms.saveInquirySubmission).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Eve', email: 'eve@example.com', company: 'Corp', challenge: 'Growth' }),
      );
    });

    it('throws and marks failed for unknown provider', async () => {
      const providers = makeProviders();
      mockGetIntegrationProviders.mockReturnValue(providers as never);
      const job = makeJob({ provider: 'unknown.provider' as never });
      mockClaimDueOutboxJobs.mockResolvedValue([job]);

      const result = await processOutboxTick();

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(mockMarkOutboxJobFailed).toHaveBeenCalledWith(
        'job_1',
        'Unknown outbox provider "unknown.provider"',
      );
    });
  });

  describe('enqueueIntegrationJobs', () => {
    it('maps event to outbox jobs and enqueues them, returning count', async () => {
      const event = { type: 'guide.submitted', occurredAt: new Date().toISOString(), payload: { name: 'Frank' } };
      mockMapEventToOutboxJobs.mockReturnValue([
        { provider: 'crm', payload: { event } },
        { provider: 'email.guide', payload: { event } },
      ] as never);
      mockEnqueueOutboxJobs.mockResolvedValue([{ id: 'j1' }, { id: 'j2' }] as never);

      const count = await enqueueIntegrationJobs({ submissionId: 'sub_99', event: event as never });

      expect(mockMapEventToOutboxJobs).toHaveBeenCalledWith(event);
      expect(mockEnqueueOutboxJobs).toHaveBeenCalledWith([
        { submissionId: 'sub_99', provider: 'crm', payload: { event } },
        { submissionId: 'sub_99', provider: 'email.guide', payload: { event } },
      ]);
      expect(count).toBe(2);
    });

    it('returns 0 when no jobs are mapped for the event', async () => {
      const event = { type: 'unknown.event', occurredAt: new Date().toISOString(), payload: {} };
      mockMapEventToOutboxJobs.mockReturnValue([] as never);
      mockEnqueueOutboxJobs.mockResolvedValue([] as never);

      const count = await enqueueIntegrationJobs({ submissionId: 'sub_0', event: event as never });

      expect(count).toBe(0);
    });
  });
});
