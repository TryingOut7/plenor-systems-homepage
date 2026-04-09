import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { validateEnv } from './lib/env-validation.ts';
import { createStructuredLogger } from './lib/structuredLogger.ts';
import { isNonLocalRuntime } from './lib/runtime.ts';
import { resolveDatabasePoolMax } from './payload/databasePool.ts';
import { acceptedLanguages, type AcceptedLanguages } from '@payloadcms/translations';
import { enTranslations } from '@payloadcms/translations/languages/en';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  BoldFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

// ─── Storage ──────────────────────────────────────────────────────────────────
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

// ─── Plugins ──────────────────────────────────────────────────────────────────
import { seoPlugin } from '@payloadcms/plugin-seo';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { searchPlugin } from '@payloadcms/plugin-search';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { importExportPlugin } from '@payloadcms/plugin-import-export';

// ─── Email Adapters ───────────────────────────────────────────────────────────
import { resendAdapter } from '@payloadcms/email-resend';
import { consoleEmailAdapter } from './payload/email/consoleEmailAdapter.ts';

// ─── Collections & Globals ────────────────────────────────────────────────────

import { Media } from './payload/collections/Media.ts';
import { ServiceItems } from './payload/collections/ServiceItems.ts';
import { SitePages } from './payload/collections/SitePages.ts';
import { PageDrafts } from './payload/collections/PageDrafts.ts';
import { PagePresets } from './payload/collections/PagePresets.ts';
import { PagePlaygrounds } from './payload/collections/PagePlaygrounds.ts';
import { ReusableSections } from './payload/collections/ReusableSections.ts';
import { RedirectRules } from './payload/collections/RedirectRules.ts';
import { BlogPosts } from './payload/collections/BlogPosts.ts';
import { BlogCategories } from './payload/collections/BlogCategories.ts';
import { Testimonials } from './payload/collections/Testimonials.ts';
import { AuditLogs } from './payload/collections/AuditLogs.ts';
import { TeamMembers } from './payload/collections/TeamMembers.ts';
import { Logos } from './payload/collections/Logos.ts';
import { EmailTemplates } from './payload/collections/EmailTemplates.ts';
import { OrgEvents } from './payload/collections/OrgEvents.ts';
import { OrgSpotlight } from './payload/collections/OrgSpotlight.ts';
import { OrgAboutProfiles } from './payload/collections/OrgAboutProfiles.ts';
import { OrgLearning } from './payload/collections/OrgLearning.ts';
import { SiteSettings } from './payload/globals/SiteSettings.ts';
import { UISettings } from './payload/globals/UISettings.ts';
import { OrgSponsors } from './payload/globals/OrgSponsors.ts';
import { OrgHomeFeatures } from './payload/globals/OrgHomeFeatures.ts';
import { CleanPasteFeature } from './payload/editor/features/cleanPasteFeature.ts';
import {
  parseFormTemplateKey,
} from './domain/forms/formTemplates.ts';
import type { CollectionConfig } from 'payload';
import { normalizeFormBuilderData } from './payload/forms/formBuilderNormalization.ts';

validateEnv();

const logger = createStructuredLogger('payload.config');

function readRuntimePortFromArgv(argv: string[]): string | undefined {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--port' || token === '-p') {
      const candidate = argv[index + 1];
      if (candidate && /^\d+$/.test(candidate)) return candidate;
      continue;
    }
    if (token.startsWith('--port=')) {
      const candidate = token.slice('--port='.length);
      if (candidate && /^\d+$/.test(candidate)) return candidate;
    }
  }
  return undefined;
}

function resolveRuntimePort(): string | undefined {
  const candidate =
    readRuntimePortFromArgv(process.argv) || process.env.PORT || process.env.npm_config_port;
  if (typeof candidate !== 'string') return undefined;

  const normalized = candidate.trim();
  return /^\d+$/.test(normalized) ? normalized : undefined;
}

function resolveRuntimePorts(): Set<string> {
  const ports = new Set<string>(['3000']);
  const candidates = [
    process.env.PORT,
    process.env.npm_config_port,
    readRuntimePortFromArgv(process.argv),
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const normalized = candidate.trim();
    if (!/^\d+$/.test(normalized)) continue;
    ports.add(normalized);
  }

  return ports;
}

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function resolveServerURL(): string {
  const runtimePort = resolveRuntimePort();
  const configuredServerUrl =
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  if (configuredServerUrl) {
    const normalizedConfiguredUrl = /^https?:\/\//i.test(configuredServerUrl)
      ? configuredServerUrl
      : `https://${configuredServerUrl}`;
    const parsedConfiguredUrl = tryParseUrl(normalizedConfiguredUrl);

    if (
      parsedConfiguredUrl &&
      process.env.NODE_ENV !== 'production' &&
      runtimePort &&
      isLocalHostname(parsedConfiguredUrl.hostname) &&
      parsedConfiguredUrl.port !== runtimePort
    ) {
      return `${parsedConfiguredUrl.protocol}//${parsedConfiguredUrl.hostname}:${runtimePort}`;
    }

    return normalizedConfiguredUrl;
  }

  return (
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    `http://localhost:${runtimePort || '3000'}`
  );
}

const serverURL = resolveServerURL();
const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
const hasBlobReadWriteToken =
  typeof blobReadWriteToken === 'string' && blobReadWriteToken.length > 0;

const nonLocalRuntime = isNonLocalRuntime();

// Use Blob storage in all non-local runtimes (preview/staging/production) when token is present.
// Local environments can opt-in explicitly.
const blobStorageEnabled =
  hasBlobReadWriteToken &&
  (nonLocalRuntime || process.env.ENABLE_LOCAL_BLOB_STORAGE === 'true');

// Import/Export is only active on Vercel with a blob token. When absent, inject
// a banner component into the affected collections so admins understand why the
// feature is unavailable and what step is needed to restore it.
const importExportEnabled = Boolean(process.env.VERCEL) && hasBlobReadWriteToken;

const IMPORT_EXPORT_BANNER_PATH =
  '@/payload/admin/components/ImportExportUnavailableBanner';

/**
 * Injects the ImportExportUnavailableBanner into a collection's beforeList
 * when Import/Export is not active. When the plugin IS active, returns the
 * collection unchanged so Payload renders the native import/export controls.
 */
function withImportExportBanner<T extends CollectionConfig>(collection: T): T {
  if (importExportEnabled) return collection;
  const existing = collection.admin?.components?.beforeList ?? [];
  const beforeList = Array.isArray(existing) ? existing : [existing];
  return {
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        beforeList: [...beforeList, IMPORT_EXPORT_BANNER_PATH],
      },
    },
  };
}

const dbRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';

function resolveDatabaseSslOption(
  connectionString: string | undefined,
): { rejectUnauthorized: boolean } | false {
  if (!connectionString) return { rejectUnauthorized: false };
  try {
    const url = new URL(connectionString);
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return false;
    }
  } catch {
    // unparseable connection string — assume remote, use SSL
  }
  return { rejectUnauthorized: dbRejectUnauthorized };
}

const dbPushEnv = process.env.PAYLOAD_DB_PUSH?.trim();
const dbPushConfirmed = process.env.PAYLOAD_CONFIRM_SCHEMA_PUSH === 'true';
const parsedDbPushEnv =
  dbPushEnv === 'true'
    ? true
    : dbPushEnv === 'false'
      ? false
      : undefined;

// Migrations-first workflow for all environments.
// Schema push remains available, but only via explicit opt-in.
let dbPushSchema = false;
if (parsedDbPushEnv !== undefined) {
  dbPushSchema = parsedDbPushEnv;
}

if (dbPushSchema && !dbPushConfirmed) {
  dbPushSchema = false;
  console.warn(
    'PAYLOAD_DB_PUSH=true ignored because PAYLOAD_CONFIRM_SCHEMA_PUSH is not set to true. ' +
      'Set both env vars to opt into schema push explicitly.',
  );
}
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

function normalizeOrigin(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  try {
    return new URL(raw).origin;
  } catch {
    if (/^[a-z]+:\/\//i.test(raw)) return null;
    try {
      return new URL(`https://${raw}`).origin;
    } catch {
      return null;
    }
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

function resolvePayloadAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const addOrigin = (candidate?: string) => {
    if (!candidate) return;
    const origin = normalizeOrigin(candidate);
    if (origin) origins.add(origin);
  };

  addOrigin(serverURL);
  addOrigin(process.env.NEXT_PUBLIC_SERVER_URL);

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    addOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (process.env.VERCEL_URL) {
    addOrigin(`https://${process.env.VERCEL_URL}`);
  }

  for (const origin of parseCsvList(process.env.PAYLOAD_ALLOWED_ORIGINS)) {
    addOrigin(origin);
  }

  const runtimePorts = resolveRuntimePorts();

  try {
    const parsedServerUrl = new URL(serverURL);
    if (parsedServerUrl.port) runtimePorts.add(parsedServerUrl.port);

    if (process.env.NODE_ENV !== 'production' || isLocalHostname(parsedServerUrl.hostname)) {
      for (const port of runtimePorts) {
        const normalizedPort = port.trim();
        if (!normalizedPort) continue;
        addOrigin(`http://localhost:${normalizedPort}`);
        addOrigin(`http://127.0.0.1:${normalizedPort}`);
      }
    }
  } catch {
    // Ignore invalid serverURL values in this helper; runtime validation handles required env.
  }

  return [...origins];
}

function normalizePreviewSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/^\/+|\/+$/g, '');
  return normalized || null;
}

function resolveCollectionLivePreviewPath(
  collectionSlug: string | undefined,
  data: Record<string, unknown> | undefined,
): string | null {
  if (!collectionSlug) return null;

  const slug = normalizePreviewSlug(data?.slug);

  if (collectionSlug === 'site-pages') {
    if (!slug || slug === 'home') return '/';
    return `/${slug}`;
  }

  if (collectionSlug === 'service-items') {
    if (!slug) return '/services';
    return `/services/${slug}`;
  }

  return null;
}

function resolveGlobalLivePreviewPath(globalSlug: string | undefined): string | null {
  if (!globalSlug) return null;
  if (globalSlug === 'site-settings' || globalSlug === 'ui-settings') {
    return '/';
  }
  return null;
}

function readPreviewRecordId(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  const id = data.id;
  if (typeof id === 'number') return String(id);
  if (typeof id === 'string' && id.trim()) return id.trim();
  return null;
}

function resolveLivePreviewURL(args: {
  collectionConfig?: { slug?: string };
  globalConfig?: { slug?: string };
  data?: unknown;
}): string | null {
  const data = args.data && typeof args.data === 'object'
    ? (args.data as Record<string, unknown>)
    : undefined;
  const previewSecret = process.env.PAYLOAD_PREVIEW_SECRET || process.env.PAYLOAD_SECRET;
  if (!previewSecret) return null;

  if (args.collectionConfig?.slug === 'page-drafts') {
    const draftId = readPreviewRecordId(data);
    if (!draftId) return null;
    return `/preview/page-drafts/${encodeURIComponent(draftId)}?secret=${encodeURIComponent(previewSecret)}`;
  }

  const path =
    resolveCollectionLivePreviewPath(args.collectionConfig?.slug, data) ||
    resolveGlobalLivePreviewPath(args.globalConfig?.slug);
  if (!path) return null;

  const params = new URLSearchParams({
    secret: previewSecret,
    slug: path,
  });

  return `/api/draft-mode/enable?${params.toString()}`;
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

function readAuthenticatedUserId(req: { user?: unknown } | undefined): string | null {
  const user = req?.user;
  if (!user || typeof user !== 'object') return null;
  const candidateId = (user as Record<string, unknown>).id;
  if (typeof candidateId === 'number') return String(candidateId);
  if (typeof candidateId === 'string' && candidateId.trim()) return candidateId.trim();
  return null;
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

const databaseConnectionString = normalizeDatabaseConnectionString(
  process.env.POSTGRES_URL || process.env.DATABASE_URI || process.env.DATABASE_URL,
);
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

const payloadAllowedOrigins = resolvePayloadAllowedOrigins();
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
  cors: payloadAllowedOrigins,
  csrf: payloadAllowedOrigins,
  routes: rootRoutes,
  i18n: {
    fallbackLanguage: adminFallbackLanguage,
    translations: {
      en: {
        ...enTranslations,
        error: {
          ...enTranslations.error,
          unauthorized:
            "Unauthorized. If you're already logged in, your account may not have permission for this action.",
        },
      },
    },
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
      url: resolveLivePreviewURL,
      collections: ['site-pages', 'page-drafts', 'service-items'],
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
        admin: ({ req }) => userHasAnyRole(req, contentManagerRoles),
        // Relationship fields (e.g. workflow approvedBy) in non-admin collections
        // must still resolve, but lower-privilege users should only resolve self.
        read: ({ req }) => {
          if (userHasAnyRole(req, contentManagerRoles)) return true;
          const userId = readAuthenticatedUserId(req);
          if (!userId) return false;
          return { id: { equals: userId } };
        },
        create: ({ req }) => userHasAnyRole(req, ['admin']),
        update: ({ req }) => {
          if (userHasAnyRole(req, ['admin'])) return true;
          const userId = (req.user as unknown as Record<string, unknown> | undefined)?.id;
          if (typeof userId !== 'string' && typeof userId !== 'number') return false;
          return { id: { equals: String(userId) } };
        },
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
        {
          name: 'cmsLanePreference',
          type: 'select',
          defaultValue: 'simple',
          options: [
            { label: 'Simple (Recommended)', value: 'simple' },
            { label: 'Advanced settings (use with caution)', value: 'advanced' },
          ],
          access: {
            update: ({ req }) => userHasAnyRole(req, ['admin']),
          },
          admin: {
            position: 'sidebar',
            description:
              'Controls field visibility in the CMS. Admin-only setting to prevent accidental exposure of advanced/system fields.',
          },
        },
        {
          name: 'canManageSystemFields',
          type: 'checkbox',
          defaultValue: false,
          access: {
            update: ({ req }) => userHasAnyRole(req, ['admin']),
          },
          admin: {
            position: 'sidebar',
            description:
              'Trusted editor capability for system-level fields (for example redirects and script/canonical controls).',
          },
        },
        {
          name: 'showCmsTrainingHints',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            position: 'sidebar',
            description: 'Show inline training hints in editor forms.',
          },
        },
      ],
    },
    withImportExportBanner(Media),
    withImportExportBanner(ServiceItems),
    withImportExportBanner(SitePages),
    PageDrafts,
    PagePresets,
    PagePlaygrounds,
    withImportExportBanner(ReusableSections),
    withImportExportBanner(RedirectRules),
    withImportExportBanner(BlogPosts),
    BlogCategories,
    withImportExportBanner(Testimonials),
    AuditLogs,
    TeamMembers,
    Logos,
    EmailTemplates,
    withImportExportBanner(OrgEvents),
    withImportExportBanner(OrgSpotlight),
    withImportExportBanner(OrgAboutProfiles),
    withImportExportBanner(OrgLearning),
  ],
  globals: [SiteSettings, UISettings, OrgSponsors, OrgHomeFeatures],
  editor: lexicalEditor({
    features: () => [
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({ disableAutoLinks: 'creationOnly' }),
      CleanPasteFeature(),
      InlineToolbarFeature(),
    ],
  }),
  db: postgresAdapter({
    push: dbPushSchema,
    migrationDir: path.join(__dirname, '../migrations/payload'),
    pool: {
      connectionString: databaseConnectionString,
      ssl: resolveDatabaseSslOption(databaseConnectionString),
      max: resolveDatabasePoolMax(Boolean(process.env.VERCEL)),
      idleTimeoutMillis: process.env.VERCEL ? 10000 : 30000,
      connectionTimeoutMillis: 30000,
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
  email: (() => {
    if (process.env.RESEND_API_KEY) {
      if (!process.env.RESEND_FROM_EMAIL) {
        throw new Error('RESEND_FROM_EMAIL is required when RESEND_API_KEY is provided.');
      }
      return resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.RESEND_FROM_EMAIL,
        defaultFromName: process.env.RESEND_FROM_NAME || 'Website',
      });
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Email configuration is missing! RESEND_API_KEY must be provided in production to prevent silent email loss.',
      );
    }

    logger.info(
      'RESEND_API_KEY is missing. Using consoleEmailAdapter; outgoing emails will be printed to stdout.',
    );
    return consoleEmailAdapter();
  })(),


  // ─── GraphQL ──────────────────────────────────────────────────────────────────
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'payload-graphql-schema.graphql'),
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────────
  plugins: [
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
    }),

    // NOTE: We intentionally use the custom `redirect-rules` collection as the
    // single source of truth for redirects and keep plugin-based redirects off.

    // ── Nested Docs Plugin ──────────────────────────────────────────────────
    // Keep this deterministic across environments to avoid migration drift.
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
        enableQueryPresets: true,
        hooks: {
          beforeChange: [
            ({ data, operation, originalDoc }) =>
              normalizeFormBuilderData({ data, operation, originalDoc }),
          ],
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'templateKey',
            type: 'select',
            dbName: 'template_key',
            required: false,
            options: [
              { label: 'Guide', value: 'guide' },
              { label: 'Inquiry', value: 'inquiry' },
              { label: 'Newsletter', value: 'newsletter' },
            ],
            admin: {
              position: 'sidebar',
              readOnly: true,
              description:
                'Immutable template discriminator used by frontend submission routing.',
            },
          },
          {
            name: 'emailTemplate',
            type: 'relationship',
            relationTo: 'email-templates',
            required: false,
            admin: {
              position: 'sidebar',
              condition: (data) => data?.templateKey === 'guide',
              description:
                'Email template to use when delivering a guide to the subscriber. Only applies to forms with templateKey = "guide".',
            },
          },
        ],
        admin: {
          group: 'Leads',
          components: {
            beforeList: [
              '@/payload/admin/components/CreateFormTemplateActions',
            ],
          },
        },
      },
      formSubmissionOverrides: {
        slug: 'form-submissions',
        admin: {
          group: 'Leads',
        },
        hooks: {
          beforeChange: [
            async ({ data, req }) => {
              if (data.formType) return data;
              const formId = typeof data.form === 'object' ? data.form?.id : data.form;
              if (!formId) return data;
              try {
                const form = await req.payload.findByID({ collection: 'forms', id: formId });
                const templateKey = parseFormTemplateKey(form?.templateKey);
                data.formType = templateKey ?? form?.title ?? null;
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

    // ── Vercel Blob Storage ───────────────────────────────────────────────────
    // Must run after plugins that register upload collections (e.g. import-export)
    // so adapter assignment includes those collections.
    vercelBlobStorage({
      enabled: blobStorageEnabled,
      collections: {
        media: true,
        exports: true,
        imports: true,
      },
      token: blobReadWriteToken ?? '',
    }),

  ],
});
