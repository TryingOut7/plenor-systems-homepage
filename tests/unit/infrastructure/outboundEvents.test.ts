import { describe, expect, it } from 'vitest';
import {
  buildGuideSubmissionEvent,
  buildInquirySubmissionEvent,
  mapEventToOutboxJobs,
} from '@/infrastructure/integrations/outboundEvents';

describe('outbound event model', () => {
  it('builds versioned guide submission event', () => {
    const event = buildGuideSubmissionEvent({
      submission: {
        id: 'guide_1',
        kind: 'guide',
        name: 'Alice',
        email: 'alice@example.com',
        submittedAt: new Date().toISOString(),
      },
      templateId: 'template-1',
    });

    expect(event.version).toBe('v1');
    expect(event.type).toBe('submission.guide.created');
    expect(event.payload.submissionId).toBe('guide_1');
    expect(event.payload.templateId).toBe('template-1');

    const jobs = mapEventToOutboxJobs(event);
    expect(jobs.map((job) => job.provider)).toEqual([
      'crm',
      'email.guide',
      'payload.forms.guide',
      'webhook',
    ]);
  });

  it('builds versioned inquiry submission event', () => {
    const event = buildInquirySubmissionEvent({
      submission: {
        id: 'inquiry_1',
        kind: 'inquiry',
        name: 'Alice',
        email: 'alice@example.com',
        company: 'Acme',
        challenge: 'Need automation',
        submittedAt: new Date().toISOString(),
      },
    });

    expect(event.version).toBe('v1');
    expect(event.type).toBe('submission.inquiry.created');
    expect(event.payload.company).toBe('Acme');

    const jobs = mapEventToOutboxJobs(event);
    expect(jobs.map((job) => job.provider)).toEqual([
      'crm',
      'email.inquiry',
      'payload.forms.inquiry',
      'webhook',
    ]);
  });

  it('does not map unknown event types to inquiry integrations', () => {
    const jobs = mapEventToOutboxJobs({
      version: 'v1',
      id: 'event-unknown',
      type: 'unknown.event' as never,
      occurredAt: new Date().toISOString(),
      payload: {},
    });

    expect(jobs).toEqual([]);
  });
});
