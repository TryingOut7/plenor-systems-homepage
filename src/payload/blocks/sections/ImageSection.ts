import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const ImageSection: Block = {
  slug: 'imageSection',
  dbName: 'img_sec',
  labels: { singular: 'Image Section', plural: 'Image Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'displayMode',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Slideshow', value: 'slideshow' },
      ],
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Square (1:1)', value: 'square' },
        { label: 'Landscape (16:9)', value: 'landscape' },
        { label: 'Portrait (3:4)', value: 'portrait' },
      ],
    },
    { name: 'gridColumns', type: 'number', defaultValue: 3, min: 1, max: 6, admin: { description: 'Number of columns in grid mode' } },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'altOverride', type: 'text', admin: { description: 'Override the image alt text' } },
        { name: 'caption', type: 'text', admin: { description: 'Caption shown below this image' } },
        { name: 'linkHref', type: 'text', admin: { description: 'Make image clickable with this URL' } },
      ],
    },
    { name: 'caption', type: 'text', admin: { description: 'Section-level caption below all images' } },
  ],
};
