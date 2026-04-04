import type { FormTemplateKey } from '@/domain/forms/formTemplates';

export interface FormTemplateRecord {
  created: boolean;
  id: number | string;
  title: string;
}

export interface FormTemplateRepository {
  createOrGetTemplate(templateKey: FormTemplateKey): Promise<FormTemplateRecord>;
}
