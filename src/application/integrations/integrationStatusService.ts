import { ok, type ServiceResult } from '@/application/shared/serviceResult';
import { hasDatabaseCredentials } from '@/infrastructure/persistence/backendStore';

export interface IntegrationStatusResponse {
  providers: {
    crmWebhook: {
      configured: boolean;
      urlConfigured: boolean;
      secretConfigured: boolean;
    };
    resendEmail: {
      configured: boolean;
    };
    outboundWebhook: {
      configured: boolean;
      signatureEnabled: boolean;
    };
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
        urlConfigured: !!process.env.CRM_WEBHOOK_URL,
        secretConfigured: !!process.env.CRM_WEBHOOK_SECRET,
      },
      resendEmail: {
        configured: !!process.env.RESEND_API_KEY,
      },
      outboundWebhook: {
        configured: !!process.env.OUTBOUND_WEBHOOK_URL,
        signatureEnabled: !!process.env.OUTBOUND_WEBHOOK_SECRET,
      },
    },
    persistence: {
      databaseCredentialsConfigured: hasDatabaseCredentials(),
    },
  });
}
