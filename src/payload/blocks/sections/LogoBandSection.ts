import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LogoBandSection: Block = {
  slug: 'logoBandSection',
  dbName: 'logo_band',
  labels: { singular: 'Logo Band Section', plural: 'Logo Band Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text', admin: { description: 'Optional label above logos, e.g. "Trusted by"' } },
    {
      name: 'logos',
      type: 'relationship',
      relationTo: 'logos',
      hasMany: true,
      admin: { description: 'Select logos to display (leave empty to show all, ordered by order field)' },
    },
    {
      name: 'displayMode',
      type: 'select',
      defaultValue: 'static',
      options: [
        { label: 'Static Grid', value: 'static' },
        { label: 'Scrolling Marquee', value: 'marquee' },
      ],
    },
    { name: 'logoHeight', type: 'number', defaultValue: 40, admin: { description: 'Logo height in pixels' } },
  ],
};
