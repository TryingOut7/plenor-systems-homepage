import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { validateEnv } from './lib/env-validation';

validateEnv();
import { acceptedLanguages, type AcceptedLanguages } from '@payloadcms/translations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

// ─── Storage ──────────────────────────────────────────────────────────────────
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

// ─── Plugins ──────────────────────────────────────────────────────────────────
import { seoPlugin } from '@payloadcms/plugin-seo';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { searchPlugin } from '@payloadcms/plugin-search';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { importExportPlugin } from '@payloadcms/plugin-import-export';

// ─── Email Adapters ───────────────────────────────────────────────────────────
import { resendAdapter } from '@payloadcms/email-resend';

// ─── Collections & Globals ────────────────────────────────────────────────────
import { Media } from './payload/collections/Media';
import { ServiceItems } from './payload/collections/ServiceItems';
import { SitePages } from './payload/collections/SitePages';
import { ReusableSections } from './payload/collections/ReusableSections';
import { RedirectRules } from './payload/collections/RedirectRules';
import { BlogPosts } from './payload/collections/BlogPosts';
import { BlogCategories } from './payload/collections/BlogCategories';
import { Testimonials } from './payload/collections/Testimonials';
import { AuditLogs } from './payload/collections/AuditLogs';
import { TeamMembers } from './payload/collections/TeamMembers';
import { Logos } from './payload/collections/Logos';
import { EmailTemplates } from './payload/collections/EmailTemplates';
import { SiteSettings } from './payload/globals/SiteSettings';
import { UISettings } from './payload/globals/UISettings';

function resolveServerURL(): string {
  const raw =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000';

  // Auto-add https:// if the value has no protocol (e.g. "staging.plenor.ai")
  if (raw && !/^https?:\/\//i.test(raw)) {
    return `https://${raw}`;
  }
  return raw;
}

const serverURL = resolveServerURL();
const dbRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';
const dbPushSchema =
  process.env.PAYLOAD_DB_PUSH === 'true';
const enableNestedDocsPlugin = process.env.PAYLOAD_ENABLE_NESTED_DOCS === 'true';
const adminThemeValues = ['all', 'dark', 'light'] as const;
const adminAvatarValues = ['default', 'gravatar'] as const;
const adminMetaOGImageValues = ['dynamic', 'off', 'static'] as const;
const adminToastPositionValues = [
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'top-center',
  'top-left',
  'top-right',
] as const;
const defaultAdminDateFormat = 'MMM d, yyyy h:mm a';
const defaultAdminLanguage: AcceptedLanguages = 'en';
const allRoles = ['admin', 'editor', 'author'] as const;
const contentManagerRoles = ['admin', 'editor'] as const;

type Role = (typeof allRoles)[number];
type RoutePath = `/${string}`;

function parseBooleanEnv(value?: string): boolean | undefined {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function parseNumberEnv(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseEnumEnv<TValues extends readonly string[]>(
  value: string | undefined,
  allowedValues: TValues,
): TValues[number] | undefined {
  if (!value) return undefined;
  return (allowedValues as readonly string[]).includes(value) ? (value as TValues[number]) : undefined;
}

function normalizeRoutePath(value: string | undefined, fallbackRoute: RoutePath): RoutePath {
  if (!value) return fallbackRoute;
  return (value.startsWith('/') ? value : `/${value}`) as RoutePath;
}

function parseCsvList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveAdminFallbackLanguage(): AcceptedLanguages {
  const envLanguage = process.env.PAYLOAD_ADMIN_FALLBACK_LANGUAGE;
  if (!envLanguage) return defaultAdminLanguage;
  return acceptedLanguages.includes(envLanguage as AcceptedLanguages)
    ? (envLanguage as AcceptedLanguages)
    : defaultAdminLanguage;
}

function resolveRole(user: unknown): Role | null {
  if (!user || typeof user !== 'object') return null;
  const candidate = (user as Record<string, unknown>).role;
  if (typeof candidate !== 'string') return null;
  return allRoles.includes(candidate as Role) ? (candidate as Role) : null;
}

function userHasAnyRole(req: { user?: unknown } | undefined, allowedRoles: readonly Role[]): boolean {
  const userRole = resolveRole(req?.user);
  return !!userRole && allowedRoles.includes(userRole);
}

function withUndefinedToDefault<T>(value: T | undefined, fallback: T): T {
  return value === undefined ? fallback : value;
}

function normalizeDatabaseConnectionString(uri?: string): string | undefined {
  if (!uri) return uri;

  // Strip sslmode parameter using a regex so we avoid URL re-encoding that
  // can mangle passwords containing special characters.  pg v8 treats
  // sslmode=require as verify-full which rejects Supabase's certificate
  // chain.  The pool-level `ssl: { rejectUnauthorized: false }` is the
  // correct place to configure TLS behaviour.
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (match) => (match.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

const databaseConnectionString = normalizeDatabaseConnectionString(process.env.DATABASE_URI || process.env.DATABASE_URL);
const adminTheme = parseEnumEnv(process.env.PAYLOAD_ADMIN_THEME, adminThemeValues) || 'all';
const adminAvatar = parseEnumEnv(process.env.PAYLOAD_ADMIN_AVATAR, adminAvatarValues) || 'default';
const adminToastDuration = parseNumberEnv(process.env.PAYLOAD_ADMIN_TOAST_DURATION_MS);
const adminToastLimit = parseNumberEnv(process.env.PAYLOAD_ADMIN_TOAST_LIMIT);
const adminToastExpand = parseBooleanEnv(process.env.PAYLOAD_ADMIN_TOAST_EXPAND);
const adminToastPosition = parseEnumEnv(process.env.PAYLOAD_ADMIN_TOAST_POSITION, adminToastPositionValues);
const adminMetaOGImageType = parseEnumEnv(
  process.env.PAYLOAD_ADMIN_META_DEFAULT_OG_IMAGE_TYPE,
  adminMetaOGImageValues,
);
const adminDateFormat = process.env.PAYLOAD_ADMIN_DATE_FORMAT || defaultAdminDateFormat;
const adminFallbackLanguage = resolveAdminFallbackLanguage();
const enableAutoRefresh = withUndefinedToDefault(parseBooleanEnv(process.env.PAYLOAD_ADMIN_AUTO_REFRESH), true);
const suppressHydrationWarning = withUndefinedToDefault(
  parseBooleanEnv(process.env.PAYLOAD_ADMIN_SUPPRESS_HYDRATION_WARNING),
  false,
);

const shouldEnableAutoLogin =
  process.env.NODE_ENV !== 'production' && parseBooleanEnv(process.env.PAYLOAD_ADMIN_AUTO_LOGIN) === true;

const adminAutoLogin = shouldEnableAutoLogin
  ? {
      email: process.env.PAYLOAD_ADMIN_AUTO_LOGIN_EMAIL,
      password: process.env.PAYLOAD_ADMIN_AUTO_LOGIN_PASSWORD,
      username: process.env.PAYLOAD_ADMIN_AUTO_LOGIN_USERNAME,
      prefillOnly: withUndefinedToDefault(
        parseBooleanEnv(process.env.PAYLOAD_ADMIN_AUTO_LOGIN_PREFILL_ONLY),
        false,
      ),
    }
  : false;

const timezoneEnvList = parseCsvList(process.env.PAYLOAD_ADMIN_TIMEZONES);
const includeUTCByDefault = withUndefinedToDefault(
  parseBooleanEnv(process.env.PAYLOAD_ADMIN_INCLUDE_UTC_TIMEZONE),
  true,
);
const timezoneOverrides = new Set<string>(timezoneEnvList);

if (includeUTCByDefault) {
  timezoneOverrides.add('UTC');
}

const defaultTimezone =
  process.env.PAYLOAD_ADMIN_DEFAULT_TIMEZONE ||
  (timezoneOverrides.has('UTC') ? 'UTC' : undefined);

const adminTimezones =
  timezoneOverrides.size > 0 || defaultTimezone
    ? {
        supportedTimezones: ({
          defaultTimezones,
        }: {
          defaultTimezones: Array<{ label: string; value: string }>;
        }) => {
          const merged = [...defaultTimezones];
          for (const timezone of timezoneOverrides) {
            if (!merged.some((entry) => entry.value === timezone)) {
              merged.push({ label: timezone, value: timezone });
            }
          }
          return merged;
        },
        ...(defaultTimezone ? { defaultTimezone } : {}),
      }
    : undefined;

const rootRoutes = {
  admin: normalizeRoutePath(process.env.PAYLOAD_ROUTE_ADMIN, '/admin'),
  api: normalizeRoutePath(process.env.PAYLOAD_ROUTE_API, '/api'),
  graphQL: normalizeRoutePath(process.env.PAYLOAD_ROUTE_GRAPHQL, '/graphql'),
  graphQLPlayground: normalizeRoutePath(
    process.env.PAYLOAD_ROUTE_GRAPHQL_PLAYGROUND,
    '/graphql-playground',
  ),
};

const adminRoutes = {
  account: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_ACCOUNT, '/account'),
  browseByFolder: normalizeRoutePath(
    process.env.PAYLOAD_ADMIN_ROUTE_BROWSE_BY_FOLDER,
    '/browse-by-folder',
  ),
  createFirstUser: normalizeRoutePath(
    process.env.PAYLOAD_ADMIN_ROUTE_CREATE_FIRST_USER,
    '/create-first-user',
  ),
  forgot: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_FORGOT, '/forgot'),
  inactivity: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_INACTIVITY, '/logout-inactivity'),
  login: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_LOGIN, '/login'),
  logout: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_LOGOUT, '/logout'),
  reset: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_RESET, '/reset'),
  unauthorized: normalizeRoutePath(process.env.PAYLOAD_ADMIN_ROUTE_UNAUTHORIZED, '/unauthorized'),
};

const adminMeta = {
  titleSuffix: process.env.PAYLOAD_ADMIN_META_TITLE_SUFFIX || ' | CMS',
  ...(adminMetaOGImageType ? { defaultOGImageType: adminMetaOGImageType } : {}),
};

const adminCustom = {
  projectName: process.env.PAYLOAD_ADMIN_PROJECT_NAME || 'Website',
  environmentLabel:
    process.env.PAYLOAD_ADMIN_ENV_LABEL || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
};

const adminToast =
  adminToastDuration !== undefined ||
  adminToastLimit !== undefined ||
  adminToastExpand !== undefined ||
  adminToastPosition !== undefined
    ? {
        ...(adminToastDuration !== undefined ? { duration: adminToastDuration } : {}),
        ...(adminToastLimit !== undefined ? { limit: adminToastLimit } : {}),
        ...(adminToastExpand !== undefined ? { expand: adminToastExpand } : {}),
        ...(adminToastPosition !== undefined ? { position: adminToastPosition } : {}),
      }
    : undefined;

export default buildConfig({
  serverURL,
  routes: rootRoutes,
  i18n: {
    fallbackLanguage: adminFallbackLanguage,
  },
  admin: {
    user: 'users',
    avatar: adminAvatar,
    autoLogin: adminAutoLogin,
    autoRefresh: enableAutoRefresh,
    custom: adminCustom,
    dateFormat: adminDateFormat,
    meta: adminMeta,
    routes: adminRoutes,
    suppressHydrationWarning,
    theme: adminTheme,
    timezones: adminTimezones,
    ...(adminToast ? { toast: adminToast } : {}),
    importMap: {
      baseDir: path.resolve(__dirname),
    },
    livePreview: {
      url: serverURL,
      collections: ['site-pages', 'service-items', 'blog-posts', 'testimonials'],
      globals: ['site-settings', 'ui-settings'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  // ─── Folders ───────────────────────────────────────────────────────────────
  folders: {
    browseByFolder: true,
    collectionSpecific: true,
  },

  // ─── Query Presets ────────────────────────────────────────────────────────
  queryPresets: {
    access: {
      read: () => true,
      create: ({ req }) => userHasAnyRole(req, contentManagerRoles),
      update: ({ req }) => userHasAnyRole(req, contentManagerRoles),
      delete: ({ req }) => userHasAnyRole(req, contentManagerRoles),
    },
    constraints: {
      read: [],
    },
  },

  // ─── Jobs Queue ───────────────────────────────────────────────────────────
  jobs: {
    access: {
      queue: ({ req }) => userHasAnyRole(req, contentManagerRoles),
      run: ({ req }) => userHasAnyRole(req, contentManagerRoles),
    },
    tasks: [],
    workflows: [],
    deleteJobOnComplete: true,
  },

  collections: [
    {
      slug: 'users',
      auth: {
        tokenExpiration: 28800, // 8 hours
        useAPIKey: true,
        maxLoginAttempts: 5,
        lockTime: 600000, // 10 minutes
        verify: false,
      },
      access: {
        admin: ({ req }) => userHasAnyRole(req, allRoles),
        // Relationship fields (e.g. workflow approvedBy) in non-admin collections
        // need to resolve user documents for all authenticated CMS users.
        read: ({ req }) => !!req.user,
        create: ({ req }) => userHasAnyRole(req, ['admin']),
        update: ({ req }) => userHasAnyRole(req, ['admin']),
        delete: ({ req }) => userHasAnyRole(req, ['admin']),
      },
      admin: {
        useAsTitle: 'email',
      },
      enableQueryPresets: true,
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          defaultValue: 'editor',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
            { label: 'Author', value: 'author' },
          ],
          access: {
            update: ({ req }) => userHasAnyRole(req, ['admin']),
          },
          admin: {
            position: 'sidebar',
          },
        },
      ],
    },
    Media,
    ServiceItems,
    SitePages,
    ReusableSections,
    RedirectRules,
    BlogPosts,
    BlogCategories,
    Testimonials,
    AuditLogs,
    TeamMembers,
    Logos,
    EmailTemplates,
  ],
  globals: [SiteSettings, UISettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    push: dbPushSchema,
    pool: {
      connectionString: databaseConnectionString,
      ssl: { rejectUnauthorized: dbRejectUnauthorized },
      max: process.env.VERCEL ? 5 : 10,
      idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
      connectionTimeoutMillis: 10000,
    },
  }),
  secret: (() => {
    const secret = process.env.PAYLOAD_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('PAYLOAD_SECRET environment variable is required in production');
    }
    return secret || 'payload-dev-secret-change-in-development';
  })(),
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // ─── Email ────────────────────────────────────────────────────────────────────
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
          defaultFromName: process.env.RESEND_FROM_NAME || 'Website',
        }),
      }
    : {}),

  // ─── GraphQL ──────────────────────────────────────────────────────────────────
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'payload-graphql-schema.graphql'),
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────────
  plugins: [
    // ── Vercel Blob Storage ───────────────────────────────────────────────────
    // Stores uploaded media in Vercel Blob instead of the ephemeral filesystem.
    // Requires BLOB_READ_WRITE_TOKEN env var (set automatically when Vercel Blob
    // is enabled in the Vercel project dashboard under Storage → Blob).
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
        exports: true,
        imports: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),

    // ── SEO Plugin ────────────────────────────────────────────────────────────
    // Adds meta title, description, and image fields to content collections
    seoPlugin({
      collections: ['service-items', 'site-pages', 'blog-posts', 'testimonials'],
      globals: ['site-settings'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) =>
        `${(doc as Record<string, unknown>)?.title || 'Untitled'} | ${process.env.PAYLOAD_ADMIN_PROJECT_NAME || 'Website'}`,
      generateDescription: ({ doc }) =>
        (doc as Record<string, unknown>)?.summary as string ||
        '',
      generateURL: ({ doc, collectionSlug }) => {
        const slug = (doc as Record<string, unknown>)?.slug as string || '';
        if (collectionSlug === 'service-items') return `${serverURL}/services/${slug}`;
        if (collectionSlug === 'site-pages') return `${serverURL}/${slug}`;
        return `${serverURL}`;
      },
    }),

    // ── Redirects Plugin ──────────────────────────────────────────────────────
    // Manages URL redirects from the admin panel
    redirectsPlugin({
      collections: ['site-pages', 'service-items', 'blog-posts', 'testimonials'],
      overrides: {
        slug: 'payload-redirects',
      },
    }),

    ...(enableNestedDocsPlugin
      ? [
          // ── Nested Docs Plugin ──────────────────────────────────────────────────
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
        ]
      : []),

    // ── Search Plugin ─────────────────────────────────────────────────────────
    // Indexes content for fast full-text search
    searchPlugin({
      collections: ['service-items', 'site-pages', 'blog-posts', 'testimonials'],
      defaultPriorities: {
        'service-items': 20,
        'site-pages': 15,
        'blog-posts': 10,
        'testimonials': 5,
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
        hooks: {
          beforeChange: [
            async ({ data, req }) => {
              if (data.formType) return data;
              const formId = typeof data.form === 'object' ? data.form?.id : data.form;
              if (!formId) return data;
              try {
                const form = await req.payload.findByID({ collection: 'forms', id: formId });
                data.formType = form?.title ?? null;
              } catch {
                // non-fatal — leave formType null
              }
              return data;
            },
          ],
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'formType',
            type: 'text',
            dbName: 'form_type',
            required: false,
            admin: {
              position: 'sidebar',
              readOnly: true,
              description: 'Set automatically — the form this submission came from.',
            },
          },
        ],
      },
    }),

    // ── Import/Export Plugin ───────────────────────────────────────────────────
    // Import and export collection data as CSV or JSON
    // NOTE: Disabled locally — LibSQL cannot handle special chars in Google Drive
    // path. Works fine on Vercel. Re-enable when running outside Google Drive.
    ...(process.env.VERCEL
      ? [
          importExportPlugin({
            collections: [
              { slug: 'service-items' },
              { slug: 'site-pages' },
              { slug: 'reusable-sections' },
              { slug: 'redirect-rules' },
              { slug: 'blog-posts' },
              { slug: 'testimonials' },
              { slug: 'media' },
            ],
          }),
        ]
      : []),

  ],
});
