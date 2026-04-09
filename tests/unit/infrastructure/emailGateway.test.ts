import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/email', () => ({
  sendGuideEmail: vi.fn(),
  sendInquiryEmails: vi.fn(),
  sendRegistrationStatusUpdateEmail: vi.fn(),
}));

import { sendRegistrationStatusUpdateEmail } from '@/lib/email';
import { sendRegistrationStatusEmail } from '@/infrastructure/integrations/emailGateway';

const mockSendRegistrationStatusUpdateEmail = vi.mocked(sendRegistrationStatusUpdateEmail);

describe('emailGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends registration status updates through the shared email library', async () => {
    mockSendRegistrationStatusUpdateEmail.mockResolvedValue(undefined);

    await sendRegistrationStatusEmail({
      publicId: 'reg-1',
      eventId: 'evt-1',
      eventTitle: 'Spring Concert',
      registrantName: 'Alice',
      registrantEmail: 'alice@example.com',
      statusCode: 'payment_pending',
      statusLabel: 'Payment Pending',
      userFacingReason: null,
      isPaid: true,
    });

    expect(mockSendRegistrationStatusUpdateEmail).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      publicId: 'reg-1',
      eventTitle: 'Spring Concert',
      statusCode: 'payment_pending',
      statusLabel: 'Payment Pending',
      userFacingReason: null,
      isPaid: true,
    });
  });
});
