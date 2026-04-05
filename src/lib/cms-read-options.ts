import { draftMode } from 'next/headers';
import type { CmsReadOptions } from '@/payload/cms';

export async function getCmsReadOptions(): Promise<CmsReadOptions> {
  const { isEnabled } = await draftMode();
  return { draft: isEnabled };
}
