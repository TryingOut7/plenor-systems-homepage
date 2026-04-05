import type { Field } from 'payload';

export const createdByField: Field = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'The user who originally created this document.',
  },
};
