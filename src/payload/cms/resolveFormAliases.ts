import { getGuideFormId, getInquiryFormId } from '../../lib/payload-form-stubs.ts';
import { isFormAliasKey } from '../../domain/forms/formTemplates.ts';
import type { PageSection, SitePage } from './types.ts';

/**
 * Preset and fallback page data use `form: 'guide' | 'inquiry'` aliases. Payload's
 * REST API and the public form fetch expect a real `forms` document id. Resolve
 * aliases here so the client always receives a concrete id.
 *
 * ── SYNC POINT ───────────────────────────────────────────────────────────────
 * The set of recognised alias strings is defined in
 * `src/domain/forms/formTemplates.ts` (`FORM_ALIAS_KEYS`).
 *
 * To add a new embeddable alias:
 *   1. Add the key to `FORM_ALIAS_KEYS` in formTemplates.ts.
 *   2. Export `get<Alias>FormId()` from `payload-form-stubs.ts`.
 *   3. Handle the new key in `resolveFormEmbedAliasesInSections()` below.
 *   4. The `/api/form-ids` route will pick up the new key automatically.
 * ─────────────────────────────────────────────────────────────────────────────
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
  // Use the shared `isFormAliasKey` guard so alias detection is always driven
  // from `FORM_ALIAS_KEYS` in formTemplates.ts — not from duplicated string literals.
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
    // If form IDs cannot be resolved (e.g. DB connection error during cold start),
    // clear alias strings so they don't reach FormRenderer as invalid Payload REST IDs
    // (e.g. /api/forms/guide → NaN query). Preserve the alias as `formAlias` so the
    // client component can retry resolution via the Payload REST where-clause.
    return sections.map((section) => {
      if (
        section.blockType !== 'formSection' ||
        !isFormAliasKey(section.form)
      ) {
        return section;
      }
      return { ...section, form: null, formAlias: section.form };
    });
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
