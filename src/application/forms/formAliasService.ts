/**
 * Application-layer facade for form alias resolution.
 *
 * API routes must not import from @/domain directly — they go through the
 * application layer. This module is the single import point for anything an
 * API route handler needs to know about form aliases.
 */
export {
  FORM_ALIAS_KEYS,
  buildFormAliasKeysQueryParam,
  type FormAliasKey,
} from '@/domain/forms/formTemplates';
