import type { Field } from 'payload';
import { withFieldTier } from './fieldTier.ts';

export const structuralKeyField: Field = {
  name: 'structuralKey',
  type: 'text',
  admin: {
    hidden: true,
    readOnly: true,
    condition: () => false,
    description: 'System-managed structural identity key for preset and migrated sections.',
  },
};

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
  admin: {
    description: 'Base theme for section typography and button styling',
  },
};

export const backgroundColorField: Field = withFieldTier({
  name: 'backgroundColor',
  type: 'text',
  admin: {
    description: 'Optional custom background color (hex, rgb/rgba, hsl/hsla, named color, or CSS var)',
    placeholder: '#F8F9FA',
    components: {
      beforeInput: ['@/payload/admin/components/SectionBackgroundColorPicker'],
    },
  },
}, 'advanced');

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

export const anchorIdField: Field = withFieldTier({
  name: 'anchorId',
  type: 'text',
  admin: {
    description: 'Optional anchor ID for in-page links',
  },
}, 'advanced');

export const customClassNameField: Field = withFieldTier({
  name: 'customClassName',
  type: 'text',
  admin: {
    description: 'Optional CSS class name',
  },
}, 'advanced');

export const isHiddenField: Field = {
  name: 'isHidden',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Hide this section without deleting it',
  },
};

export const visibleFromField: Field = {
  name: 'visibleFrom',
  type: 'date',
  admin: {
    description: 'Section becomes visible on this date (optional)',
    date: { pickerAppearance: 'dayAndTime' },
  },
};

export const visibleUntilField: Field = {
  name: 'visibleUntil',
  type: 'date',
  admin: {
    description: 'Section is hidden after this date (optional)',
    date: { pickerAppearance: 'dayAndTime' },
  },
};

export const headingSizeField: Field = withFieldTier({
  name: 'headingSize',
  type: 'select',
  admin: {
    description: 'Override heading size for this section (default: md)',
  },
  options: [
    { label: 'Extra Small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium (default)', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
  ],
}, 'advanced');

export const textAlignField: Field = withFieldTier({
  name: 'textAlign',
  type: 'select',
  admin: {
    description: 'Override text alignment for this section',
  },
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
}, 'advanced');

export const headingTagField: Field = withFieldTier({
  name: 'headingTag',
  type: 'select',
  admin: {
    description: 'HTML heading tag for SEO/accessibility (default: h2)',
  },
  options: [
    { label: 'H1', value: 'h1' },
    { label: 'H2 (default)', value: 'h2' },
    { label: 'H3', value: 'h3' },
    { label: 'H4', value: 'h4' },
  ],
}, 'advanced');

export const sectionLabelField: Field = {
  name: 'sectionLabel',
  type: 'text',
  admin: {
    description: 'Optional eyebrow/section label for custom page layouts',
  },
};

export const sectionCommonFields: Field[] = [
  structuralKeyField,
  themeField,
  sectionLabelField,
  backgroundColorField,
  sizeField,
  anchorIdField,
  customClassNameField,
  isHiddenField,
  visibleFromField,
  visibleUntilField,
  headingSizeField,
  textAlignField,
  headingTagField,
];
