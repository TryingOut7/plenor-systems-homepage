import { describe, expect, it } from 'vitest';
import { OrgEvents } from '@/payload/collections/OrgEvents';

type FieldWithValidate = {
  name?: string;
  validate?: (
    value: unknown,
    args: { data?: unknown; req?: unknown },
  ) => true | string | Promise<true | string>;
};

function getFieldValidate(name: string): NonNullable<FieldWithValidate['validate']> {
  const field = (OrgEvents.fields as FieldWithValidate[]).find((entry) => entry?.name === name);
  if (!field?.validate) {
    throw new Error(`Missing validate function for field "${name}"`);
  }
  return field.validate;
}

describe('OrgEvents conditional field validation', () => {
  it('requires a standard registration form when registration is required', async () => {
    const validate = getFieldValidate('registrationForm');

    const missing = await validate(undefined, { data: { registrationRequired: true } });
    expect(typeof missing).toBe('string');
    if (typeof missing === 'string') {
      expect(missing).toContain('registration form');
    }

    await expect(
      validate(123, {
        data: { registrationRequired: true },
        req: {
          payload: {
            findByID: async () => ({ id: 123, title: 'Event RSVP' }),
          },
        },
      }),
    ).resolves.toBe(true);
    await expect(validate(undefined, { data: { registrationRequired: false } })).resolves.toBe(true);
  });

  it('rejects guide or inquiry template forms for event registration', async () => {
    const validate = getFieldValidate('registrationForm');

    const result = await validate(123, {
      data: { registrationRequired: true },
      req: {
        payload: {
          findByID: async () => ({ id: 123, title: 'guide', templateKey: 'guide' }),
        },
      },
    });

    expect(result).toContain('template forms are not allowed');
  });
});
