import path from 'path';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

import { Media } from './payload/collections/Media';
import { BlogPosts } from './payload/collections/BlogPosts';
import { ServiceItems } from './payload/collections/ServiceItems';
import { Testimonials } from './payload/collections/Testimonials';
import { SitePages } from './payload/collections/SitePages';
import { ReusableSections } from './payload/collections/ReusableSections';
import { RedirectRules } from './payload/collections/RedirectRules';
import { SiteSettings } from './payload/globals/SiteSettings';

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(import.meta.dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      access: {
        read: () => true,
      },
      fields: [],
    },
    Media,
    BlogPosts,
    ServiceItems,
    Testimonials,
    SitePages,
    ReusableSections,
    RedirectRules,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'payload-dev-secret-change-in-production',
  sharp,
  typescript: {
    outputFile: path.resolve(import.meta.dirname, 'payload-types.ts'),
  },
});
