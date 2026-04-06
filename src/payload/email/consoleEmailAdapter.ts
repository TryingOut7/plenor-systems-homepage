/**
 * Console email adapter for Payload CMS.
 *
 * K-03 fix: When RESEND_API_KEY is absent, Payload falls back to a null mailer
 * that silently discards every email — workflow notifications, form confirmations,
 * and password-reset emails all vanish without a trace.
 *
 * This adapter replaces that null mailer in non-production environments.
 * All outgoing emails are printed to stdout so they remain visible and testable
 * during local development and staging without requiring a live Resend account.
 *
 * It is intentionally NOT used in production. Production requires RESEND_API_KEY.
 */

import type { EmailAdapter, SendEmailOptions } from 'payload';

export function consoleEmailAdapter(): EmailAdapter {
  return ({ payload }) => ({
    name: 'console-email-adapter',
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@localhost',
    defaultFromName: process.env.RESEND_FROM_NAME || 'Website (dev)',
    sendEmail: async (options: SendEmailOptions): Promise<void> => {
      const border = '─'.repeat(60);
      // eslint-disable-next-line no-console
      console.log(
        [
          '',
          `┌${border}┐`,
          `│  📧  [Console Email Adapter] Email would have been sent  │`,
          `├${border}┤`,
          `│  To:      ${String(options.to).padEnd(49)}│`,
          `│  From:    ${String(options.from ?? 'noreply@localhost').padEnd(49)}│`,
          `│  Subject: ${String(options.subject ?? '(no subject)').padEnd(49)}│`,
          `├${border}┤`,
          (options.text ?? '')
            .split('\n')
            .map((line: string) => `│  ${line.padEnd(57)}│`)
            .join('\n'),
          `└${border}┘`,
          '',
        ].join('\n'),
      );
    },
  });
}
