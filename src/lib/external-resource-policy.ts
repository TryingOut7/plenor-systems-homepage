type ResourceKind = 'script' | 'style';

const DEFAULT_ALLOWED_SCRIPT_HOSTS = [
  'static.cloudflareinsights.com',
  'cdn.jsdelivr.net',
  'va.vercel-scripts.com',
];
const DEFAULT_ALLOWED_STYLE_HOSTS = ['fonts.googleapis.com'];

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

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

function collectRuntimePorts(env: NodeJS.ProcessEnv): Set<string> {
  const ports = new Set<string>(['3000']);
  const candidates = [
    env.PORT,
    env.npm_config_port,
    readRuntimePortFromArgv(process.argv),
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const normalized = candidate.trim();
    if (!/^\d+$/.test(normalized)) continue;
    ports.add(normalized);
  }

  const configuredServerUrl = env.NEXT_PUBLIC_SERVER_URL;
  if (configuredServerUrl) {
    try {
      const parsed = new URL(configuredServerUrl);
      if (isLocalHostname(parsed.hostname) && parsed.port) {
        ports.add(parsed.port);
      }
    } catch {
      // Ignore invalid URLs here; env validation handles critical checks elsewhere.
    }
  }

  return ports;
}

export function resolveLocalDevelopmentOrigins(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  if (env.NODE_ENV === 'production') return [];

  const origins = new Set<string>();
  for (const port of collectRuntimePorts(env)) {
    origins.add(`http://localhost:${port}`);
    origins.add(`http://127.0.0.1:${port}`);
  }
  return [...origins];
}

function normalizeHost(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.host.toLowerCase();
  } catch {
    return null;
  }
}

function parseHostList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((item) => normalizeHost(item))
    .filter((item): item is string => !!item);
}

function allowedHostsFor(kind: ResourceKind, env: NodeJS.ProcessEnv): Set<string> {
  const configured = parseHostList(
    kind === 'script'
      ? env.CMS_ALLOWED_EXTERNAL_SCRIPT_HOSTS
      : env.CMS_ALLOWED_EXTERNAL_STYLE_HOSTS,
  );
  const defaults =
    kind === 'script' ? DEFAULT_ALLOWED_SCRIPT_HOSTS : DEFAULT_ALLOWED_STYLE_HOSTS;

  const merged = new Set<string>();
  for (const host of [...defaults, ...configured]) {
    const normalized = normalizeHost(host);
    if (normalized) {
      merged.add(normalized);
    }
  }

  return merged;
}

function isAllowedProtocol(url: URL, env: NodeJS.ProcessEnv): boolean {
  if (url.protocol === 'https:') {
    return true;
  }

  if (
    env.NODE_ENV !== 'production' &&
    url.protocol === 'http:' &&
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
}

function isRelativePath(value: string): boolean {
  return value.startsWith('/');
}

export function isAllowedExternalResourceUrl(
  rawUrl: string | undefined | null,
  kind: ResourceKind,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!rawUrl) {
    return false;
  }

  const value = rawUrl.trim();
  if (!value) {
    return false;
  }

  if (isRelativePath(value)) {
    return true;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (!isAllowedProtocol(parsed, env)) {
    return false;
  }

  if (parsed.username || parsed.password) {
    return false;
  }

  return allowedHostsFor(kind, env).has(parsed.host.toLowerCase());
}

export function getSafeStylesheetUrl(
  rawUrl: string | undefined | null,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  if (!isAllowedExternalResourceUrl(rawUrl, 'style', env)) {
    return null;
  }

  return rawUrl ? rawUrl.trim() : null;
}

export function extractSafeHeadScriptSrcs(
  rawScripts: string | undefined | null,
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  if (!rawScripts) {
    return [];
  }

  const matches = rawScripts.matchAll(/<script\b([^>]*)>\s*<\/script>/gi);
  const safe: string[] = [];

  for (const match of matches) {
    const attributes = match[1] || '';
    const srcMatch = attributes.match(/\bsrc\s*=\s*(['"])(.*?)\1/i);
    const src = srcMatch?.[2]?.trim();
    if (!src) {
      continue;
    }

    if (isAllowedExternalResourceUrl(src, 'script', env)) {
      safe.push(src);
    }
  }

  return safe;
}

function hostToOrigin(host: string): string {
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return `http://${host}`;
  }

  return `https://${host}`;
}

export function buildContentSecurityPolicy(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const scriptHosts = [...allowedHostsFor('script', env)].map(hostToOrigin);
  const styleHosts = [...allowedHostsFor('style', env)].map(hostToOrigin);
  const localDevOrigins = resolveLocalDevelopmentOrigins(env);
  const isProduction = env.NODE_ENV === 'production';

  const scriptSrcTokens = [`'self'`, `'unsafe-inline'`, ...scriptHosts];
  if (!isProduction) {
    scriptSrcTokens.push(`'unsafe-eval'`);
  }
  const scriptSrc = scriptSrcTokens.join(' ');
  const styleSrc = [`'self'`, `'unsafe-inline'`, ...styleHosts].join(' ');
  const imgSrc = [`'self'`, 'https:', 'data:', ...localDevOrigins].join(' ');
  const connectSrc = [`'self'`, 'https:', ...localDevOrigins].join(' ');
  const frameSrc = [`'self'`, ...localDevOrigins].join(' ');
  const frameAncestors = [`'self'`, ...localDevOrigins].join(' ');

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src 'self' https:`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    `frame-ancestors ${frameAncestors}`,
  ].join('; ');
}
