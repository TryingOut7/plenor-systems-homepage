import { describe, expect, it } from 'vitest';
import { OrgEvents } from '@/payload/collections/OrgEvents';

type FieldWithValidate = {
  name?: string;
  validate?: (value: unknown, args: { data?: unknown }) => true | string;
};

const richTextValue = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Bring your receipt and order reference.' }],
      },
    ],
  },
};

function getFieldValidate(name: string): NonNullable<FieldWithValidate['validate']> {
  const field = (OrgEvents.fields as FieldWithValidate[]).find((entry) => entry?.name === name);
  if (!field?.validate) {
    throw new Error(`Missing validate function for field "${name}"`);
  }
  return field.validate;
}

describe('OrgEvents conditional field validation', () => {
  it('requires registration instructions when registration is required', () => {
    const validate = getFieldValidate('registrationInstructions');

    const missing = validate(undefined, { data: { registrationRequired: true } });
    expect(typeof missing).toBe('string');
    if (typeof missing === 'string') {
      expect(missing).toContain('Registration instructions');
    }

    expect(validate(richTextValue, { data: { registrationRequired: true } })).toBe(true);
    expect(validate(undefined, { data: { registrationRequired: false } })).toBe(true);
  });

  it('requires payment reference format when payment is required', () => {
    const validate = getFieldValidate('paymentReferenceFormat');

    const missing = validate('', { data: { paymentRequired: true } });
    expect(typeof missing).toBe('string');
    if (typeof missing === 'string') {
      expect(missing).toContain('Payment reference format');
    }

    expect(validate('Festival-LastName', { data: { paymentRequired: true } })).toBe(true);
    expect(validate('', { data: { paymentRequired: false } })).toBe(true);
  });

  it('requires payment instructions or at least one payment QR code when payment is required', () => {
    const validate = getFieldValidate('paymentInstructions');

    const missing = validate(undefined, { data: { paymentRequired: true } });
    expect(typeof missing).toBe('string');
    if (typeof missing === 'string') {
      expect(missing).toContain('payment instructions');
    }

    expect(validate(richTextValue, { data: { paymentRequired: true } })).toBe(true);
    expect(
      validate(undefined, {
        data: {
          paymentRequired: true,
          zelleQrCode: { id: 123 },
        },
      }),
    ).toBe(true);
  });
});

