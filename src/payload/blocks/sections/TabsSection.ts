import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const TabsSection: Block = {
  slug: 'tabsSection',
  dbName: 'tabs_sec',
  labels: { singular: 'Tabs Section', plural: 'Tabs Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'tabs',
      type: 'array',
      dbName: 'tabs_items',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'Tab button label' } },
        { name: 'heading', type: 'text', admin: { description: 'Content heading for this tab' } },
        { name: 'body', type: 'textarea', admin: { description: 'Main body text for this tab' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Optional image for this tab' } },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
      ],
    },
  ],
};
