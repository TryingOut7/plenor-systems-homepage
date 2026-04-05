import { ok, type ServiceResult } from '@/application/shared/serviceResult';
import { hasDatabaseCredentials } from '@/infrastructure/persistence/backendStore';

export interface IntegrationStatusResponse {
  providers: {
    crmWebhook: { configured: boolean };
    resendEmail: { configured: boolean };
    outboundWebhook: { configured: boolean };
  };
  persistence: {
    databaseCredentialsConfigured: boolean;
  };
}

export function getIntegrationStatus(): ServiceResult<IntegrationStatusResponse> {
  return ok({
    providers: {
      crmWebhook: {
        configured: !!process.env.CRM_WEBHOOK_URL,
      },
      resendEmail: {
        configured: !!process.env.RESEND_API_KEY,
      },
      outboundWebhook: {
        configured: !!process.env.OUTBOUND_WEBHOOK_URL,
      },
    },
    persistence: {
      databaseCredentialsConfigured: hasDatabaseCredentials(),
    },
  });
}
