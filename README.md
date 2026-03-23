# Plenor Systems — Homepage

Next.js 16 marketing site for [plenor.ai](https://plenor.ai).

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (App Router, `src/` directory)
- Resend (transactional email)
- GA4 (analytics, cookie-gated)
- Supabase (form submission logging)

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

When `BACKEND_INTERNAL_URL` is set in `.env.local`, Next API routes proxy to backend first and fall back to local handlers if backend is unreachable.

Current backend routes:

- `GET /health`
- `GET /health/ready`
- `GET /metrics` (requires `x-api-key` with internal/admin role)
- `GET /v1/search`
- `POST /v1/forms/guide` (supports `Idempotency-Key`)
- `POST /v1/forms/inquiry` (supports `Idempotency-Key`)
- `POST /v1/internal/seed-site-pages`
- `GET /v1/content/pages/{slug}`
- `GET /v1/content/navigation`
- `GET /v1/admin/submissions` (admin API key)
- `GET /v1/admin/submissions/{id}` (admin API key)
- `POST /v1/admin/submissions/{id}/replay-side-effects` (admin API key, supports `Idempotency-Key`)
- `GET /v1/integrations/status` (internal/admin API key)

## Environment Variables

See `.env.local` for all required variables:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Transactional email sending |
| `RESEND_FROM_EMAIL` | Sender address (must be verified in Resend) |
| `CONTACT_EMAIL` | Internal inbox for inquiry notifications |
| `GUIDE_PDF_URL` | Secure URL for the downloadable guide PDF |
| `NEXT_PUBLIC_GA4_ID` | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `SANITY_API_READ_TOKEN` | Viewer token used for draft mode and visual editing |
| `SANITY_API_WRITE_TOKEN` | Write token used by Sanity migration scripts |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `STAGING_PASSWORD` | Optional — enables password gate on all routes |
| `BACKEND_API_KEYS` | Comma-separated API keys (`key:role:keyId`) for backend role auth |
| `BACKEND_INTERNAL_API_KEY` | Optional dedicated internal API key (alternative to `BACKEND_API_KEYS`) |
| `BACKEND_ADMIN_API_KEY` | Optional dedicated admin API key (alternative to `BACKEND_API_KEYS`) |
| `OUTBOUND_WEBHOOK_URL` | Optional signed outbound event webhook target |
| `OUTBOUND_WEBHOOK_SECRET` | Optional HMAC secret for `X-Plenor-Signature` |
| `CMS_SKIP_PAYLOAD` | Optional local/test flag to bypass payload-backed CMS calls |

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, problem, services overview, guide CTA |
| `/about` | About — team, mission, focus |
| `/services` | Services — Testing & QA and Launch & GTM detail |
| `/pricing` | Pricing — engagement model |
| `/contact` | Contact — guide form + inquiry form |
| `/privacy` | Privacy policy |

## Build

```bash
npm run build
```

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

## Sanity Migrations

Run page migrations in dry-run mode:

```bash
npm run migrate:sanity:pages
```

Apply migrations:

```bash
npm run migrate:sanity:pages:apply
```

Useful flags:

```bash
# One page type
npm run migrate:sanity:pages -- --type aboutPage

# One migration id
npm run migrate:sanity:pages -- --migration about-legacy-to-sections-v1

# One document id
npm run migrate:sanity:pages -- --id <sanity-doc-id>
```

## Pre-launch Checklist

- [ ] Update founder name, role, and bio (About page)
- [ ] Verify `plenor.ai` sending domain in Resend dashboard (SPF, DKIM, DMARC)
- [ ] Set `GUIDE_PDF_URL` to the real PDF storage URL
- [ ] Set all production env vars in Vercel dashboard
