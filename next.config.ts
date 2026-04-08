import type { NextConfig } from "next";
import path from "path";
import { withPayload } from "@payloadcms/next/withPayload";
import { withSentryConfig } from "@sentry/nextjs";
import {
  buildContentSecurityPolicy,
  resolveLocalDevelopmentOrigins,
} from "./src/lib/external-resource-policy";
function normalizeRoutePath(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return value.startsWith("/") ? value : `/${value}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveAllowedDevOriginsForNextConfig(
  env: NodeJS.ProcessEnv,
): string[] {
  const hosts = new Set<string>(['localhost', '127.0.0.1']);

  for (const origin of resolveLocalDevelopmentOrigins(env)) {
    try {
      const parsed = new URL(origin);
      if (parsed.hostname) hosts.add(parsed.hostname);
      if (parsed.host) hosts.add(parsed.host);
    } catch {
      // ignore malformed origins from env
    }
  }

  return [...hosts];
}

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  allowedDevOrigins:
    process.env.NODE_ENV === 'production'
      ? undefined
      : resolveAllowedDevOriginsForNextConfig(process.env),
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const localDevOrigins = resolveLocalDevelopmentOrigins(process.env);
    const adminRoute = normalizeRoutePath(process.env.PAYLOAD_ROUTE_ADMIN, '/admin');
    const adminRouteToken = adminRoute.replace(/^\/+/, '');
    const nonAdminSource = adminRouteToken
      ? `/((?!${escapeRegExp(adminRouteToken)}).*)`
      : '/:path*';
    const sharedSecurityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    const maybeFrameOptions = isProduction
      ? [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]
      : [];
    const adminConnectSources = [
      "'self'",
      'https:',
      'http:',
      'ws:',
      'wss:',
      ...localDevOrigins,
    ];
    const adminFrameSources = ["'self'", ...localDevOrigins];

    const adminCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      `img-src 'self' https: data: blob:${localDevOrigins.length ? ` ${localDevOrigins.join(' ')}` : ''}`,
      "font-src 'self' https: data:",
      `connect-src ${adminConnectSources.join(' ')}`,
      "worker-src 'self' blob:",
      `frame-src ${adminFrameSources.join(' ')}`,
      `frame-ancestors ${adminFrameSources.join(' ')}`,
    ].join("; ");

    return [
      // Security headers for all routes except the Payload admin panel.
      {
        source: nonAdminSource,
        headers: [
          ...maybeFrameOptions,
          ...sharedSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(process.env),
          },
        ],
      },
      // Payload admin panel — allow same-origin framing, relaxed script/style for CMS editor
      {
        source: adminRoute,
        headers: [
          ...maybeFrameOptions,
          ...sharedSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: adminCsp,
          },
        ],
      },
      {
        source: `${adminRoute}/:path*`,
        headers: [
          ...maybeFrameOptions,
          ...sharedSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: adminCsp,
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withPayload(nextConfig), {
  silent: true,
  sourcemaps: { disable: true },
});
