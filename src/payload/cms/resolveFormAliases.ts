import { getGuideFormId, getInquiryFormId } from '@/lib/payload-form-stubs';
import type { PageSection, SitePage } from './types.ts';

/**
 * Preset and fallback page data use `form: 'guide' | 'inquiry'` aliases. Payload's
 * REST API and the public form fetch expect a real `forms` document id. Resolve
 * aliases here so the client always receives a concrete id.
 */
export async function resolveFormEmbedAliasesInSitePage(
  page: SitePage | null,
): Promise<SitePage | null> {
  if (!page) return null;
  if (!page.sections?.length) return page;
  const sections = await resolveFormEmbedAliasesInSections(page.sections);
  return { ...page, sections };
}

export async function resolveFormEmbedAliasesInSections(
  sections: PageSection[],
): Promise<PageSection[]> {
  const needGuide = sections.some(
    (s) => s.blockType === 'formSection' && s.form === 'guide',
  );
  const needInquiry = sections.some(
    (s) => s.blockType === 'formSection' && s.form === 'inquiry',
  );

  if (!needGuide && !needInquiry) return sections;

  let guideId: number | string | null = null;
  let inquiryId: number | string | null = null;

  try {
    if (needGuide) guideId = await getGuideFormId();
    if (needInquiry) inquiryId = await getInquiryFormId();
  } catch {
    return sections;
  }

  return sections.map((section) => {
    if (section.blockType !== 'formSection') return section;
    if (section.form === 'guide' && guideId != null) {
      return { ...section, form: guideId };
    }
    if (section.form === 'inquiry' && inquiryId != null) {
      return { ...section, form: inquiryId };
    }
    return section;
  });
}
