import type { GuideEmailTemplate } from '@/infrastructure/integrations/emailGateway';
import { getPayload } from '@/payload/client';

export async function getGuideEmailTemplate(
  templateId: string | number,
): Promise<GuideEmailTemplate | undefined> {
  const payload = await getPayload();

  const template = await payload.findByID({
    collection: 'email-templates',
    id: templateId,
    overrideAccess: true,
  });

  if (!template) {
    return undefined;
  }

  return {
    subject: template.subject || undefined,
    heading: template.heading || undefined,
    highlightTitle: (template.highlightTitle as string | undefined) || undefined,
    body: (template.body as string | undefined) || undefined,
    buttonLabel: (template.buttonLabel as string | undefined) || undefined,
    buttonUrl: (template.buttonUrl as string | undefined) || undefined,
    replyTo: (template.replyTo as string | undefined) || undefined,
  };
}
