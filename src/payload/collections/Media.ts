import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  access: {
    read: () => true,
  },
  folders: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption or credit for the media',
      },
    },
  ],
};
