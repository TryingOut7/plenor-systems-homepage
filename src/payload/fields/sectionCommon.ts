import type { Field } from 'payload';

export const themeField: Field = {
  name: 'theme',
  type: 'select',
  defaultValue: 'white',
  options: [
    { label: 'Navy', value: 'navy' },
    { label: 'Charcoal', value: 'charcoal' },
    { label: 'Black', value: 'black' },
    { label: 'White', value: 'white' },
    { label: 'Light', value: 'light' },
  ],
};

export const sizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'regular',
  options: [
    { label: 'Compact', value: 'compact' },
    { label: 'Regular', value: 'regular' },
    { label: 'Spacious', value: 'spacious' },
  ],
};

export const anchorIdField: Field = {
  name: 'anchorId',
  type: 'text',
  admin: {
    description: 'Optional anchor ID for in-page links',
  },
};

export const customClassNameField: Field = {
  name: 'customClassName',
  type: 'text',
  admin: {
    description: 'Optional CSS class name',
  },
};

export const sectionCommonFields: Field[] = [
  themeField,
  sizeField,
  anchorIdField,
  customClassNameField,
];
