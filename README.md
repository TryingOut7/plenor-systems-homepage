# Plenor Systems — Homepage

Next.js 16 marketing site for [plenor.ai](https://plenor.ai).

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (App Router, `src/` directory)
- Resend (transactional email)
- Cloudflare Web Analytics (strict consent-gated)
- Supabase/Postgres (CMS + backend persistence)

## Getting Started

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend Service (Phase 2)

An optional backend service now exists at `apps/backend` for split-runtime setups.

Run backend locally:

```bash
npm run backend:start
```

Run backend in dev watch mode:

```bash
npm run backend:dev
```

When `BACKEND_INTERNAL_URL` is set in `.env.local`, Next API routes proxy to backend with **fail-closed** behavior. If backend is unreachable, proxy routes return `503 Backend Unavailable` (no local mutation fallback).

In production, backend CORS is also **fail-closed**: you must set either `BACKEND_CORS_ORIGINS` or `NEXT_PUBLIC_SERVER_URL`, otherwise backend startup fails.

Current backend routes:

- `GET /health`
- `GET /health/ready`
- `GET /metrics` (requires `x-api-key` with internal/admin role)
- `GET /v1/search`
- `POST /v1/forms/guide` (supports `Idempotency-Key`)
- `POST /v1/forms/inquiry` (supports `Idempotency-Key`)
- `POST /v1/forms/templates/create` (workspace auth)
- `POST /v1/internal/seed-site-pages`
- `POST /v1/pages/live/{id}/create-preset` (workspace auth)
- `POST /v1/pages/drafts/{id}/create-preset` (workspace auth)
- `POST /v1/pages/drafts/{id}/promote-to-live` (workspace auth)
- `POST /v1/pages/playgrounds/{id}/create-draft` (workspace auth)
- `POST /v1/pages/playgrounds/{id}/create-preset` (workspace auth)
- `GET /v1/content/pages/{slug}`
- `GET /v1/content/navigation`
- `GET /v1/admin/submissions` (admin API key)
- `GET /v1/admin/submissions/{id}` (admin API key)
- `POST /v1/admin/submissions/{id}/replay-side-effects` (admin API key, supports `Idempotency-Key`)
- `GET /v1/integrations/status` (internal/admin API key)

## Environment Variables

See `.env.example` for all variables:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Transactional email sending |
| `RESEND_FROM_EMAIL` | Sender address (must be verified in Resend) |
| `CONTACT_EMAIL` | Optional legacy fallback; primary contact routing now lives in Site Settings |
| `GUIDE_PDF_URL` | Optional legacy fallback; guide links now live in Site Settings |
| `PAYLOAD_SECRET` | Payload auth secret |
| `PAYLOAD_PREVIEW_SECRET` | Optional dedicated secret for Payload live preview draft-mode URLs (falls back to `PAYLOAD_SECRET`) |
| `PAYLOAD_SEED_SECRET` | Optional dedicated seed secret (falls back to `PAYLOAD_SECRET`) |
| `NEXT_PUBLIC_SERVER_URL` | Public base URL used for origin verification and canonical links |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `BACKEND_INTERNAL_URL` | Optional split-runtime backend target; enables fail-closed proxy mode |
| `BACKEND_API_KEYS` | Comma-separated API keys (`key:role:keyId`) for backend role auth |
| `BACKEND_INTERNAL_API_KEY` | Optional dedicated internal API key (alternative to `BACKEND_API_KEYS`) |
| `BACKEND_ADMIN_API_KEY` | Optional dedicated admin API key (alternative to `BACKEND_API_KEYS`) |
| `BACKEND_CORS_ORIGINS` | Comma-separated backend CORS allowlist (required in production unless `NEXT_PUBLIC_SERVER_URL` is set) |
| `ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK` | Set to `true` only for local/test fallback when shared Supabase rate limiting is unavailable |
| `OUTBOUND_WEBHOOK_URL` | Optional signed outbound event webhook target |
| `OUTBOUND_WEBHOOK_SECRET` | Optional HMAC secret for `X-Plenor-Signature` |
| `CMS_SKIP_PAYLOAD` | Optional local/test flag to bypass payload-backed CMS calls |
| `CMS_ALLOWED_EXTERNAL_STYLE_HOSTS` | Optional allowlist override for CMS external stylesheet hosts |
| `CMS_ALLOWED_EXTERNAL_SCRIPT_HOSTS` | Optional allowlist override for CMS external script hosts |

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, problem, services overview, guide CTA |
| `/about` | About — team, mission, focus |
| `/services` | Services — Testing & QA and Launch & GTM detail |
| `/pricing` | Pricing — engagement model |
| `/contact` | Contact — CMS-managed form sections |
| `/privacy` | Privacy policy |

## Build

```bash
npm run build
```

## Database Migrations

Versioned backend persistence migrations live in `migrations/versions` (including shared rate-limit counters for distributed throttling).

Apply pending migrations:

```bash
npm run db:migrate:backend
```

Show migration status:

```bash
npm run db:migrate:backend:status
```

Fail if any migration is pending (CI check mode):

```bash
npm run db:migrate:backend:status -- --check
```

Rollback the last applied migration:

```bash
npm run db:migrate:rollback
```

Migration tracking table: `public.schema_migrations`.

## Contracts (OpenAPI + Typed Client)

Generate API types from backend OpenAPI spec:

```bash
npm run openapi:generate
```

Verify generated types are up to date:

```bash
npm run openapi:check
```

Spec location: `apps/backend/openapi/openapi.yaml`  
Generated client types: `packages/api-client/src/generated.ts`

## Tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Run all test suites:

```bash
npm run test:ci
```

Architecture boundary lint:

```bash
npm run lint:architecture
```

Architecture boundary note:
- Application services use repository ports from `src/application/ports/*`.
- Payload collection/table specifics stay in infrastructure adapters (`src/infrastructure/cms/*`, `src/infrastructure/persistence/*`).

## Seed Payload Site Pages

Create the default Payload `site-pages` documents (`home`, `about`, `services`, `pricing`, `contact`):

```bash
npm run seed:site-pages
```

Notes:
- Run this while the local dev server is running.
- The command is safe to re-run.
- It creates missing docs and auto-fills starter sections for any existing page that has no sections yet.
- Auth uses `PAYLOAD_SEED_SECRET` (or falls back to `PAYLOAD_SECRET`).
- Core marketing routes (`/`, `/about`, `/services`, `/pricing`, `/contact`) are CMS-first and read from Payload `site-pages`.

## Analytics Consent

- Cloudflare analytics script is loaded only after explicit cookie consent (`accepted`).
- `declined` consent remains persisted and prevents analytics script loading until consent changes.

## Live Preview

- Payload live preview URLs point to `GET /api/draft-mode/enable?secret=...&slug=...`.
- The route enables Next draft mode and redirects to the requested frontend slug.
- Auth uses `PAYLOAD_PREVIEW_SECRET` when set, otherwise falls back to `PAYLOAD_SECRET`.

## Pre-launch Checklist

- [ ] Update founder name, role, and bio (About page)
- [ ] Verify `plenor.ai` sending domain in Resend dashboard (SPF, DKIM, DMARC)
- [ ] Set Site Settings → Content Routing → `guidePdfUrl` to the real PDF storage URL
- [ ] Set all production env vars in Vercel dashboard
