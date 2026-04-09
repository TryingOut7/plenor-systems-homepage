import { describe, expect, it } from 'vitest';
import {
  buildGuideSubmissionEvent,
  buildInquirySubmissionEvent,
  buildRegistrationCreatedEvent,
  buildRegistrationStatusUpdatedEvent,
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

  it('maps registration events to email.registration and webhook providers', () => {
    const event = buildRegistrationCreatedEvent({
      publicId: 'reg-1',
      eventId: 'event-1',
      eventTitle: 'Concert',
      registrantName: 'Alice',
      registrantEmail: 'alice@example.com',
      submittedAt: new Date().toISOString(),
      isPaid: true,
    });
    const jobs = mapEventToOutboxJobs(event);

    expect(event.payload.statusCode).toBe('submitted');
    expect(event.payload.statusLabel).toBe('Registration Submitted');
    expect(event.payload.registrantEmail).toBe('alice@example.com');
    expect(jobs.map((job) => job.provider)).toEqual([
      'email.registration',
      'webhook',
    ]);
  });

  it('maps registration status updates to email.registration and webhook providers', () => {
    const event = buildRegistrationStatusUpdatedEvent({
      publicId: 'reg-2',
      eventId: 'event-2',
      eventTitle: 'Festival',
      registrantName: 'Bob',
      registrantEmail: 'bob@example.com',
      previousStatus: 'payment_confirmation_submitted',
      nextStatus: 'payment_confirmed',
      updatedAt: new Date().toISOString(),
      userFacingReason: null,
      isPaid: true,
    });

    expect(event.payload.previousStatusCode).toBe('payment_confirmation_submitted');
    expect(event.payload.statusCode).toBe('payment_confirmed');

    const jobs = mapEventToOutboxJobs(event);

    expect(jobs.map((job) => job.provider)).toEqual([
      'email.registration',
      'webhook',
    ]);
  });
});
