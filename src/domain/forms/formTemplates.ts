export const FORM_TEMPLATE_KEYS = ['guide', 'inquiry', 'newsletter'] as const;

export type FormTemplateKey = (typeof FORM_TEMPLATE_KEYS)[number];

/**
 * The subset of `FORM_TEMPLATE_KEYS` that are used as human-readable section-
 * embed aliases (i.e. `form: 'guide' | 'inquiry'` in `formSection` blocks).
 *
 * ── SYNC POINT ───────────────────────────────────────────────────────────────
 * Both code paths that resolve alias → numeric Payload form ID MUST operate on
 * exactly this set:
 *
 *   1. Server-render path  → `src/payload/cms/resolveFormAliases.ts`
 *      Uses `getGuideFormId()` / `getInquiryFormId()` from `payload-form-stubs`,
 *      keyed by the aliases listed here.
 *
 *   2. Client-render path  → `src/app/api/form-ids/route.ts`
 *      Runs a raw pg query with `WHERE template_key IN (...)`.
 *      The route imports `FORM_ALIAS_KEYS` and builds the SQL set dynamically,
 *      so adding an alias here automatically updates the query — no manual sync.
 *
 * To add a new embeddable alias:
 *   - Append it to `FORM_ALIAS_KEYS`.
 *   - Add the corresponding `get<Alias>FormId()` export to `payload-form-stubs`.
 *   - Handle it in `resolveFormEmbedAliasesInSections()`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const FORM_ALIAS_KEYS = ['guide', 'inquiry'] as const satisfies readonly FormTemplateKey[];

export type FormAliasKey = (typeof FORM_ALIAS_KEYS)[number];

export function isFormAliasKey(value: unknown): value is FormAliasKey {
  return value === 'guide' || value === 'inquiry';
}

export function isFormTemplateKey(value: unknown): value is FormTemplateKey {
  return (
    value === 'guide' ||
    value === 'inquiry' ||
    value === 'newsletter'
  );
}

export function parseFormTemplateKey(value: unknown): FormTemplateKey | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return isFormTemplateKey(trimmed) ? trimmed : null;
}

export function formatSupportedFormTemplateKeys(): string {
  return FORM_TEMPLATE_KEYS.join(', ');
}

/**
 * Builds the parameterised SQL placeholder list and the corresponding values
 * array for use in a `WHERE template_key = ANY($1::text[])` pg query.
 *
 * Importing this from both lookup paths ensures the SQL set is always derived
 * from `FORM_ALIAS_KEYS` — never hardcoded in two separate places.
 */
export function buildFormAliasKeysQueryParam(): string[] {
  return [...FORM_ALIAS_KEYS];
}
