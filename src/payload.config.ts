import path from 'path';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

// ─── Plugins ──────────────────────────────────────────────────────────────────
import { seoPlugin } from '@payloadcms/plugin-seo';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { searchPlugin } from '@payloadcms/plugin-search';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { importExportPlugin } from '@payloadcms/plugin-import-export';
import { stripePlugin } from '@payloadcms/plugin-stripe';
import { sentryPlugin } from '@payloadcms/plugin-sentry';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { mcpPlugin } from '@payloadcms/plugin-mcp';
import { payloadCloud } from '@payloadcms/plugin-cloud';
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce';

// ─── Storage Adapters ─────────────────────────────────────────────────────────
import { s3Storage } from '@payloadcms/storage-s3';
import { uploadthingStorage } from '@payloadcms/storage-uploadthing';

// ─── Email Adapters ───────────────────────────────────────────────────────────
import { resendAdapter } from '@payloadcms/email-resend';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';

// ─── Collections & Globals ────────────────────────────────────────────────────
import { Media } from './payload/collections/Media';
import { BlogPosts } from './payload/collections/BlogPosts';
import { ServiceItems } from './payload/collections/ServiceItems';
import { Testimonials } from './payload/collections/Testimonials';
import { SitePages } from './payload/collections/SitePages';
import { ReusableSections } from './payload/collections/ReusableSections';
import { RedirectRules } from './payload/collections/RedirectRules';
import { SiteSettings } from './payload/globals/SiteSettings';

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export default buildConfig({
  serverURL,
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(import.meta.dirname),
    },
    livePreview: {
      url: serverURL,
      collections: ['site-pages', 'blog-posts', 'service-items', 'testimonials'],
      globals: ['site-settings'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
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

  // ─── Email ────────────────────────────────────────────────────────────────────
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
          defaultFromName: process.env.RESEND_FROM_NAME || 'Plenor Systems',
        }),
      }
    : {}),

  // ─── GraphQL ──────────────────────────────────────────────────────────────────
  graphQL: {
    schemaOutputFile: path.resolve(import.meta.dirname, 'payload-graphql-schema.graphql'),
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────────
  plugins: [
    // ── SEO Plugin ────────────────────────────────────────────────────────────
    // Adds meta title, description, and image fields to content collections
    seoPlugin({
      collections: ['blog-posts', 'service-items', 'testimonials', 'site-pages'],
      globals: ['site-settings'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) =>
        `${(doc as Record<string, unknown>)?.title || 'Untitled'} | Plenor Systems`,
      generateDescription: ({ doc }) =>
        (doc as Record<string, unknown>)?.excerpt as string ||
        (doc as Record<string, unknown>)?.summary as string ||
        (doc as Record<string, unknown>)?.quote as string ||
        '',
      generateURL: ({ doc, collectionSlug }) => {
        const slug = (doc as Record<string, unknown>)?.slug as string || '';
        if (collectionSlug === 'blog-posts') return `${serverURL}/blog/${slug}`;
        if (collectionSlug === 'service-items') return `${serverURL}/services/${slug}`;
        if (collectionSlug === 'testimonials') return `${serverURL}/testimonials/${slug}`;
        if (collectionSlug === 'site-pages') return `${serverURL}/${slug}`;
        return `${serverURL}`;
      },
    }),

    // ── Redirects Plugin ──────────────────────────────────────────────────────
    // Manages URL redirects from the admin panel
    redirectsPlugin({
      collections: ['site-pages', 'blog-posts', 'service-items'],
      overrides: {
        slug: 'payload-redirects',
      },
    }),

    // ── Nested Docs Plugin ────────────────────────────────────────────────────
    // Enables parent/child hierarchical relationships and breadcrumbs
    nestedDocsPlugin({
      collections: ['site-pages'],
      generateLabel: (_, doc) => (doc as Record<string, unknown>)?.title as string || 'Untitled',
      generateURL: (docs) =>
        docs.reduce(
          (url, doc) => `${url}/${(doc as Record<string, unknown>)?.slug || ''}`,
          '',
        ),
    }),

    // ── Search Plugin ─────────────────────────────────────────────────────────
    // Indexes content for fast full-text search
    searchPlugin({
      collections: ['blog-posts', 'service-items', 'testimonials', 'site-pages'],
      defaultPriorities: {
        'blog-posts': 10,
        'service-items': 20,
        'testimonials': 5,
        'site-pages': 15,
      },
    }),

    // ── Form Builder Plugin ───────────────────────────────────────────────────
    // Creates and manages forms with field types, submissions, and redirects
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        state: false,
        country: false,
        checkbox: true,
        number: true,
        message: true,
        payment: false,
      },
      formOverrides: {
        slug: 'forms',
      },
      formSubmissionOverrides: {
        slug: 'form-submissions',
      },
    }),

    // ── Import/Export Plugin ───────────────────────────────────────────────────
    // Import and export collection data as CSV or JSON
    importExportPlugin({
      collections: [
        { slug: 'blog-posts' },
        { slug: 'service-items' },
        { slug: 'testimonials' },
        { slug: 'site-pages' },
        { slug: 'reusable-sections' },
        { slug: 'redirect-rules' },
        { slug: 'media' },
      ],
    }),

    // ── Stripe Plugin ─────────────────────────────────────────────────────────
    // Stripe integration with webhook support and two-way data syncing
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET || '',
      isTestKey: !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'),
      logs: true,
      sync: [
        {
          collection: 'service-items',
          stripeResourceType: 'products',
          stripeResourceTypeSingular: 'product',
          fields: [
            { fieldPath: 'title', stripeProperty: 'name' },
            { fieldPath: 'summary', stripeProperty: 'description' },
          ],
        },
      ],
    }),

    // ── Sentry Plugin ─────────────────────────────────────────────────────────
    // Error tracking and performance monitoring via Sentry
    sentryPlugin({
      Sentry: undefined as any, // Provide Sentry SDK instance at runtime
      enabled: !!process.env.SENTRY_DSN,
      options: {
        captureErrors: [400, 403, 404, 500],
        context: ({ defaultContext }) => defaultContext,
      },
    }),

    // ── Multi-Tenant Plugin ───────────────────────────────────────────────────
    // Multi-tenancy support across collections
    multiTenantPlugin({
      collections: {
        'blog-posts': {},
        'service-items': {},
        'testimonials': {},
        'site-pages': {},
      },
    }),

    // ── MCP Plugin (AI Integration) ───────────────────────────────────────────
    // Model Context Protocol for AI assistant integration
    mcpPlugin({}),

    // ── Payload Cloud Plugin ──────────────────────────────────────────────────
    // Official Payload Cloud integration (S3 storage + Cloudflare CDN + Resend email)
    payloadCloud(),

    // ── Ecommerce Plugin ──────────────────────────────────────────────────────
    // Full ecommerce with products, orders, carts, and payment gateway support
    ecommercePlugin(),

    // ── S3 Storage Adapter ────────────────────────────────────────────────────
    // Store media uploads in AWS S3 (or S3-compatible services)
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || 'plenor-media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
      },
    }),

    // ── UploadThing Storage Adapter ───────────────────────────────────────────
    // Cloud file storage via UploadThing
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN || '',
        acl: 'public-read',
      },
    }),
  ],
});
