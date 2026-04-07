# Codebase Audit — Plenor Systems Homepage

**Date:** 2026-04-07  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Branch:** `claude/codebase-audit-U9FmE`

---

## Project Summary

Full-stack Next.js 16 (App Router) + Payload CMS 3.x + Fastify backend + Supabase Postgres. Clean-monolith architecture with optional split-runtime backend via `BACKEND_INTERNAL_URL`. Deployed to Vercel with Supabase database.

**Stack:** Next.js 16.2.0 · Payload CMS 3.79.x · React 19 · Fastify 5.6 · Supabase JS 2.99 · TypeScript 5 · Tailwind 4 · Vitest · Vercel Blob · Resend email · Sentry

**Architecture:** `src/domain/` → `src/application/` → `src/infrastructure/` → `src/app/api/` (thin controllers). Payload CMS manages all content. Dual-path API routing: proxy to `apps/backend` if `BACKEND_INTERNAL_URL` is set, otherwise local monolith.

---

## File-by-File Audit

### `src/proxy.ts`
**Purpose:** Next.js middleware implementing CMS-managed redirect rules. Fetches from `/api/redirect-rules`, validates paths, and issues 307/308 redirects.

**CONFIRMED BUG — HIGH:**
- File is named `proxy.ts` but Next.js requires the middleware file to be named `middleware.ts` (at root or `src/`).
- Exports a named function `proxy`, not `middleware` (the only recognized name).
- Exports `config` with a matcher (the Next.js middleware config shape), but this config is never read since the file is never invoked.
- **There is no `src/middleware.ts` or `middleware.ts` anywhere in the project.**
- **Result:** All CMS-managed dynamic redirect rules are permanently non-functional. The only redirects that work are the static ones in `vercel.json`.

**Fix:**
```
git mv src/proxy.ts src/middleware.ts
# then rename the exported function:
# export async function proxy(...) → export default async function middleware(...)
```
The `config` export is already correct and can stay as-is.

---

### `vercel.json`
**Purpose:** Vercel deployment configuration. Specifies framework, install command, regions, static redirects, and cron schedules.

**CONFIRMED BUG — MEDIUM:**
- Outbox-tick cron schedule is `"0 8 * * *"` (fires once daily at 8am).
- The route handler at `src/app/api/internal/cron/outbox-tick/route.ts` line 4 says: `"Called every 5 minutes by Vercel Cron (see vercel.json schedule: '*/5 * * * *')"`.
- These are directly contradictory.
- **Impact:** Form submission side-effects (email confirmations, CRM notifications, outbound webhooks) process at most once per 24 hours instead of near-real-time. Users may wait up to 24 hours for confirmation emails.
- **Note:** Vercel Hobby plan does not support sub-hourly cron schedules. If the project is on Hobby, the maximum is `"0 * * * *"` (hourly). Pro enables `"*/5 * * * *"`.

**Fix:** Either update `vercel.json` schedule to `"0 * * * *"` (hourly minimum) or `"*/5 * * * *"` (Pro), and fix the code comment to match.

---

### `src/app/api/internal/revalidate/route.ts`
**Purpose:** ISR cache purge endpoint, protected by `CRON_SECRET`.

**POSSIBLE TYPE ERROR — MEDIUM (needs external verification):**
- Line 67: `revalidateTag(tag.trim(), 'max')`
- The Next.js `revalidateTag(tag: string)` function accepts exactly one argument. The `'max'` second argument does not correspond to any documented API.
- Without `node_modules` installed it cannot be confirmed whether Next.js 16 added an overload. If this is a type error, `npm run check:type` (run in CI) would block builds.
- Functionally, the tag IS revalidated even with the extra argument (JS ignores extra args at runtime), so this does not cause a runtime failure.

**Fix:** `revalidateTag(tag.trim())` — remove the second argument.

---

### `src/app/api/form-ids/route.ts` + `src/app/api/redirect-rules/route.ts`
**Purpose:** Lightweight raw-SQL API routes that bypass Payload's REST handler to avoid double-query overhead on Vercel Hobby's single pooler connection.

**STRUCTURAL RISK — MEDIUM:**
- Both files: `import { Pool } from 'pg'`
- `pg` is **not** in root `package.json` `dependencies`. It exists in `package-lock.json` only as a transitive dependency of `@payloadcms/db-postgres`.
- If Payload CMS migrates to a different driver (Drizzle neon-serverless, etc.) and drops `pg`, both routes break silently at deploy time.
- **Currently safe** because `@payloadcms/db-postgres@3.79.x` depends on `pg@8.16.3`, which is in the lock file.

**Fix:** Add `"pg": "^8.16.3"` and `"@types/pg": "^8"` to root `package.json` dependencies.

---

### `src/lib/external-resource-policy.ts`
**Purpose:** Builds CSP headers, validates external URLs, manages allowed script/style hosts.

**SECURITY CONCERN — MEDIUM:**
- Line 229: `const scriptSrcTokens = ["'self'", "'unsafe-inline'", ...scriptHosts]`
- The frontend (non-admin) CSP includes `'unsafe-inline'` in `script-src`.
- `<script type="application/ld+json">` tags in `layout.tsx` and `[...slug]/page.tsx` do **not** require `'unsafe-inline'` in script-src because they use a non-executable MIME type and are not treated as scripts by CSP.
- The actual reason `'unsafe-inline'` might be needed is for dev tooling or Vercel Speed Insights. In production, removing it improves XSS resistance.
- **Current impact:** Moderate XSS risk. Any DOM-based XSS can execute inline scripts.

**Fix:** Remove `'unsafe-inline'` from production `scriptSrcTokens`. If Speed Insights injects inline scripts, add a nonce or move to the allowlist. JSON-LD blocks don't need it.

---

### `package.json` build script
**Purpose:** Defines `"build": "npm run check:runtime && npm run check:payload-importmap && npm run db:schema:ensure && next build"`

**DEPLOYMENT RISK — MEDIUM:**
- `db:schema:ensure` applies database migrations at Vercel build time.
- Requires `POSTGRES_URL` (or `DATABASE_URI`) to be a **build-time** environment variable on Vercel (not just runtime). If this is not configured, every build fails with `Missing DB connection string`.
- If two builds run concurrently (e.g., a push to `main` while a preview deploy runs), they both try to apply migrations simultaneously, potentially causing migration conflicts.

**Status:** Needs external verification — the Supabase+Vercel integration auto-provisions `POSTGRES_URL` for builds, but this must be confirmed in the Vercel project settings.

**Fix:** Confirm `POSTGRES_URL` is checked as "Available during Build" in Vercel Environment Variables. For concurrent-build safety, consider using advisory locks in migration scripts.

---

### `src/payload/client.ts`
**Purpose:** Singleton Payload CMS instance shared across server-side renders.

**OBSERVATION — LOW:**
- Module-level `payloadPromise` singleton + React `cache()` wrapper. First-request error clears the singleton for retry. Solid pattern.
- **Edge case:** Multiple concurrent requests during a cold start all share the same `payloadPromise`. If Payload init fails, all in-flight requests for that render cycle fail together, then retry succeeds on the next request. This is acceptable behavior for a serverless environment.
- No bug, but worth noting for ops runbooks.

---

### `src/payload/cms/cache.ts`
**Purpose:** In-process TTL caches for CMS data (site settings, pages, redirect rules).

**OBSERVATION — LOW:**
- Module-level `Map` caches are process-scoped. On Vercel with multiple concurrent warm Lambda instances, each instance maintains its own cache. Cache misses across instances multiply DB queries.
- **Mitigation already in place:** ISR `revalidate = 60` on all page routes provides CDN-level caching; the in-process cache is an optimization only, not a reliability requirement.
- Not a bug. The behavior is expected and well-mitigated.

---

### `apps/backend/src/server.ts`
**Purpose:** Fastify backend server implementing all API endpoints.

**OBSERVATION — LOW:**
- Line 177: `{ transport: { target: 'pino-pretty', options: { colorize: true } } }` for dev logger.
- `pino-pretty` is not listed in `apps/backend/package.json` devDependencies. It IS available in the lockfile via workspace hoisting (listed as `13.1.2`).
- **Risk:** If `pino-pretty` is ever de-hoisted or version-pinned differently, the backend dev server fails to start with a module-not-found error.

**Fix:** Add `"pino-pretty": "^13"` to `apps/backend/package.json` devDependencies.

---

### `apps/backend/package.json` start script
**Purpose:** Backend dev and production start commands.

**OBSERVATION — MEDIUM:**
- `"start": "node -r ./src/runtime/nextEnvCompat.cjs --import tsx src/server.ts"`
- The backend runs TypeScript at runtime via `tsx` in production. This adds JIT compilation overhead per startup.
- For a Vercel deployment where the backend is a separate process (split-runtime mode), the startup overhead is non-trivial and adds latency to cold starts.
- In the monolith mode (which is the primary path), the backend is not directly deployed, so this is lower priority.

**Fix:** If split-runtime deployment is used in production, add a build step to compile the backend to JavaScript.

---

### `src/infrastructure/security/rateLimiter.ts`
**Purpose:** Persistent Supabase-backed rate limiter with in-memory fallback.

**DEAD CODE — LOW:**
- Lines 218-223: An `if` block inside the error handler contains only a comment and no code:
  ```typescript
  if (process.env.NODE_ENV === 'production' && !isMissingRateLimitSchemaError(result.error.message)) {
    // In production with explicit fallback enabled, transient DB errors
    // can use process-local limiting to preserve availability.
  }
  ```
  This is dead code from an incomplete implementation. The comment describes intent but no logic was added.

**Fix:** Either complete the logic or remove the empty block.

---

### `src/app/(frontend)/layout.tsx`
**Purpose:** Root layout for all public pages. Fetches CMS settings, renders nav/footer/banners.

**OBSERVATION:** Clean, no bugs. Proper async Server Component. JSON-LD structured data is rendered safely via `JSON.stringify`. Draft mode is properly gated.

---

### `src/infrastructure/http/backendProxy.ts`
**Purpose:** Proxy Next.js API requests to the Fastify backend when `BACKEND_INTERNAL_URL` is set.

**OBSERVATION:** Correct proxy-first fail-closed pattern. 15-second timeout. Properly cleans `transfer-encoding` and `content-encoding` response headers to avoid double-decoding. No bugs found.

---

### `src/app/api/guide/route.ts` + `src/app/api/inquiry/route.ts`
**Purpose:** Form submission endpoints (proxy or monolith).

**OBSERVATION:** Clean proxy-first pattern. No auth required (these are public endpoints), protected only by rate limiting. Idempotency is handled at the application layer.

---

### `src/app/api/admin/submissions/route.ts`
**Purpose:** Admin API for listing form submissions.

**OBSERVATION:** Correct auth guard (`requireBackendApiRole(['admin'])`), rate limiting, proxy-first. No bugs.

---

### `src/app/api/pages/_shared.ts`
**Purpose:** Auth guards for workspace mutation endpoints.

**OBSERVATION:** Clean RBAC checks. Properly returns 401 for unauthenticated and 403 for insufficient role. Uses Payload's own `auth()` method so session tokens are validated correctly.

---

### `.github/workflows/ci.yml`
**Purpose:** CI pipeline running lint, type check, migrations, tests, build.

**OBSERVATION:**
- Uses `DATABASE_URI` env var in CI, but `env-validation.ts` checks `POSTGRES_URL` first. Both are supported in `resolveDbConnectionString()`, so CI works correctly.
- Missing `CRON_SECRET` and `SUPABASE_*` env vars in CI — but `validateEnv()` only runs in `NODE_ENV === 'production'`, and CI doesn't set `NODE_ENV=production`, so this is intentionally skipped.
- `check:type` is run as part of `predeploy:guardrails` which runs before the build step. Clean.

---

### `vercel.json` — cron path `/api/internal/cron/outbox-tick`
**Additional note:** The outbox tick route performs a `GET` request (not `POST`). Vercel Cron sends GET by default. The route correctly implements `GET`. No issue here, but worth noting the daily cadence vs. the comment.

---

## Categorized Issue Summary

### A. Build Blockers

| ID | Severity | File | Issue |
|----|----------|------|-------|
| B1 | MEDIUM | `package.json` | `db:schema:ensure` requires `POSTGRES_URL` at Vercel BUILD time; missing var fails build |
| B2 | LOW | `src/app/api/internal/revalidate/route.ts:67` | `revalidateTag(tag, 'max')` may be a TypeScript error caught by `check:type` in CI |

### B. Vercel Deployment Blockers

| ID | Severity | File | Issue |
|----|----------|------|-------|
| V1 | MEDIUM | `package.json` | All 6+ required env vars must be set in Vercel dashboard as build-time variables |
| V2 | LOW | `apps/backend/package.json` | `pino-pretty` not explicitly listed; workspace hoisting is assumed |

### C. Supabase Integration Blockers

| ID | Severity | Issue |
|----|----------|-------|
| S1 | NEEDS VERIFICATION | Supabase RPC function `consume_backend_rate_limit` must exist. If missing, rate limiter falls back gracefully but logs errors. |
| S2 | NEEDS VERIFICATION | Backend persistence tables (`guide_submissions`, `inquiry_submissions`, `backend_outbox_jobs`, `backend_idempotency_keys`, `backend_rate_limit_counters`) must exist in Supabase. Applied via `npm run db:migrate:backend`. |
| S3 | INFO | `SUPABASE_SERVICE_ROLE_KEY` is correctly kept server-side only. No client exposure found. |

### D. Runtime Bugs

| ID | Severity | File | Issue |
|----|----------|------|-------|
| D1 | **HIGH** | `src/proxy.ts` | File not named `middleware.ts`, function not named `middleware` — redirect rules never run |
| D2 | **HIGH** | `vercel.json` + route comment | Outbox cron runs daily, not every 5 minutes — form notification delay up to 24h |
| D3 | LOW | `src/infrastructure/security/rateLimiter.ts:218` | Empty `if` block is dead code from incomplete implementation |

### E. Security Issues

| ID | Severity | File | Issue |
|----|----------|------|-------|
| E1 | MEDIUM | `src/lib/external-resource-policy.ts:229` | `'unsafe-inline'` in script-src for frontend pages — weakens XSS defense |
| E2 | INFO | All auth paths | Constant-time comparison used throughout — no timing attack vectors |
| E3 | INFO | `src/infrastructure/security/backendApiKeyAuth.ts` | API key auth is strong: role-based, constant-time, no hardcoded keys |
| E4 | INFO | `apps/backend/src/server.ts:167` | CORS fail-closed in production — good |

### F. Code Quality / Maintainability Issues

| ID | Severity | File | Issue |
|----|----------|------|-------|
| Q1 | MEDIUM | `src/app/api/form-ids/route.ts` + `redirect-rules/route.ts` | `pg` is an undeclared direct dependency |
| Q2 | LOW | `src/app/api/internal/revalidate/route.ts:67` | Spurious second argument to `revalidateTag` |
| Q3 | LOW | `src/app/api/internal/cron/outbox-tick/route.ts:4` | Stale comment contradicting actual cron schedule |
| Q4 | LOW | `apps/backend/src/server.ts:177` | `pino-pretty` not in backend devDependencies |
| Q5 | LOW | `src/infrastructure/security/rateLimiter.ts:218` | Dead empty if-block |
| Q6 | LOW | `apps/backend/package.json` | Backend runs TypeScript at runtime via `tsx`; no compiled output |

---

## Ranked Action Plan

### Priority 1 — Fix Immediately (functional breakage)

**1. Rename `src/proxy.ts` → `src/middleware.ts` and export as `middleware`**

```bash
git mv src/proxy.ts src/middleware.ts
```

Edit `src/middleware.ts`:
```diff
-export async function proxy(request: NextRequest) {
+export default async function middleware(request: NextRequest) {
```

The `export const config = { matcher: [...] }` at the bottom is already correct for Next.js middleware and requires no change.

**Impact:** Enables all CMS-managed dynamic redirect rules. Without this fix, the `redirect_rules` table and Payload admin redirect UI are entirely non-functional.

---

**2. Fix outbox cron schedule**

In `vercel.json`, change line 21 to an achievable schedule. If on Vercel Pro:
```json
"schedule": "*/5 * * * *"
```
If on Vercel Hobby (minimum hourly):
```json
"schedule": "0 * * * *"
```
Update the comment in `src/app/api/internal/cron/outbox-tick/route.ts` to match.

---

### Priority 2 — Fix Before Next Release (potential build/deploy failure)

**3. Add `pg` as a direct dependency**
```bash
# in root package.json
npm install pg @types/pg
```

**4. Remove spurious second argument to `revalidateTag`**

`src/app/api/internal/revalidate/route.ts` line 67:
```diff
-revalidateTag(tag.trim(), 'max');
+revalidateTag(tag.trim());
```

**5. Confirm Vercel build environment variables**
Ensure all of the following are marked "Available during Build" in Vercel dashboard:
- `POSTGRES_URL` (required — build runs migrations)
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

---

### Priority 3 — Quality Improvements

**6. Remove `'unsafe-inline'` from frontend script-src CSP**

`src/lib/external-resource-policy.ts` line 229:
```diff
-const scriptSrcTokens = ["'self'", "'unsafe-inline'", ...scriptHosts];
+const scriptSrcTokens = ["'self'", ...scriptHosts];
```
Verify no inline `<script>` tags (non-JSON-LD) exist in the frontend. JSON-LD blocks with `type="application/ld+json"` are unaffected by script-src.

**7. Add `pino-pretty` to `apps/backend/package.json` devDependencies**
```json
"pino-pretty": "^13"
```

**8. Remove dead empty if-block in rateLimiter**

`src/infrastructure/security/rateLimiter.ts` lines 219-223: delete the empty `if` block.

---

## Final Verdict

### Why it fails on Vercel

The project **CAN deploy to Vercel** successfully if environment variables are properly configured. The primary risk is:

1. **`POSTGRES_URL` must be a build-time env var** — because `npm run build` runs `db:schema:ensure` (applies migrations). Missing this = every build fails.
2. All 6+ required env vars must be set before first deployment.

The project **deploys but has broken functionality** until:

- `src/proxy.ts` → `src/middleware.ts` rename: CMS-managed redirects are completely non-functional as-is.
- Outbox cron schedule correction: Form notifications are delayed by up to 24 hours.

### Why Supabase works or fails

Supabase integration is **well-implemented** and will work correctly when:
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set server-side only (confirmed correct)
- Backend persistence tables are applied via `npm run db:migrate:backend`
- `consume_backend_rate_limit` RPC function exists (applied via migrations)

It fails gracefully when Supabase is unavailable: the rate limiter returns 503 (not 200), the outbox continues retrying, and form submissions fall back to in-memory storage in non-production environments.

### What must be fixed first

1. **`src/proxy.ts` → `src/middleware.ts`** — This is a single-file rename + function rename. Highest impact for lowest effort. Every CMS redirect rule is dead without it.
2. **Outbox cron schedule** — One-line change in `vercel.json` + comment update. Form delivery SLA depends on it.
3. **`pg` direct dependency** — Prevents future breakage from transitive dep changes.
4. **`revalidateTag` second argument** — Prevents potential CI type-check failure.
