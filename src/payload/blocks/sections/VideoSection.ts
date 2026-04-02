import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const VideoSection: Block = {
  slug: 'videoSection',
  dbName: 'vid_sec',
  labels: { singular: 'Video Section', plural: 'Video Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'embedUrl',
      type: 'text',
      admin: { description: 'YouTube or Vimeo embed URL' },
    },
    {
      name: 'posterImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};
