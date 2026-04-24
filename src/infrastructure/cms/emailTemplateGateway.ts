import type { GuideEmailTemplate } from '@/infrastructure/integrations/emailGateway';

// The legacy EmailTemplates collection was removed. Guide delivery now falls
// back to form-native emails or Site Settings defaults in src/lib/email.ts.
export async function getGuideEmailTemplate(
  _templateId: string | number,
): Promise<GuideEmailTemplate | undefined> {
  void _templateId;
  return undefined;
}
