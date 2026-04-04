import type {
  FormTemplateRecord,
  FormTemplateRepository,
} from '@/application/ports/formTemplateRepository';
import {
  formatSupportedFormTemplateKeys,
  parseFormTemplateKey,
  type FormTemplateKey,
} from '@/domain/forms/formTemplates';

export function parseRequestedFormTemplateKey(value: unknown): FormTemplateKey | null {
  return parseFormTemplateKey(value);
}

export function getSupportedFormTemplateKeysLabel(): string {
  return formatSupportedFormTemplateKeys();
}

export async function createWorkspaceFormTemplate(
  repository: FormTemplateRepository,
  templateKey: FormTemplateKey,
): Promise<FormTemplateRecord> {
  return repository.createOrGetTemplate(templateKey);
}
