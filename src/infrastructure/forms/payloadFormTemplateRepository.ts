import type { FormTemplateRepository } from '@/application/ports/formTemplateRepository';
import { createOrGetFormTemplate } from '@/payload/forms/formTemplateCreation';
import type { Payload, TypedUser } from 'payload';

export function createPayloadFormTemplateRepository(args: {
  payload: Payload;
  user: TypedUser;
}): FormTemplateRepository {
  return {
    async createOrGetTemplate(templateKey) {
      return createOrGetFormTemplate({
        payload: args.payload,
        templateKey,
        user: args.user,
      });
    },
  };
}
