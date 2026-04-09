# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Three-Layer Context System

This project uses a three-layer system for Claude Code context:

### Layer 1: CLAUDE.md (this file) — Static Project Rules

Authoritative source for architecture, commands, conventions, and environment. Updated manually when the project structure changes. Read automatically at session start.

### Layer 2: `.claude/memory/` — Session-Scoped Context

Mutable files that track who we are, what we've decided, and how we work. Read at session start, updated when something significant is decided or learned.

| File | Purpose |
|---|---|
| [user.md](.claude/memory/user.md) | Who the user is, background, working style |
| [preferences.md](.claude/memory/preferences.md) | Code style, workflow, and tool preferences |
| [decisions.md](.claude/memory/decisions.md) | Key architectural and design decisions with rationale |
| [people.md](.claude/memory/people.md) | Stakeholders and contacts |

### Layer 3: `.claude/hooks/` + Settings — Persistent Cross-Session Hooks

Automated guardrails that enforce rules without Claude needing to remember them. Configured in `.claude/settings.json` and implemented as shell scripts in `.claude/hooks/`.

| Hook | Trigger | Purpose |
|---|---|---|
| `protect_linter_configs.sh` | PreToolUse (Edit/Write) | Blocks edits to linter configs and hook scripts |
| `enforce_package_managers.sh` | PreToolUse (Bash) | Intercepts pip/npm, suggests uv/bun replacements |
| `multi_linter.sh` | PostToolUse (Edit/Write) | Runs multi-language linting after file edits |
| `stop_config_guardian.sh` | Stop | Detects config file changes, prompts to keep or revert |

Hook config lives in `.claude/hooks/config.json`. The `settings.local.json` adds ECC plugin hooks (continuous learning, quality gates, security checks, cost tracking).

**Separation of concerns:** CLAUDE.md tells Claude *what the project is*. Memory tells Claude *what we've been doing*. Hooks *enforce rules automatically* without relying on Claude's context window.

## Core Rules

- **No unsolicited commits.** Only commit when the user explicitly asks.
- **No trailing summaries.** Don't explain what you just did at the end of a response.
- **Minimal scope.** Only change what's directly required. No cleanup, refactors, or bonus features.
- **Prefer editing over creating.** Don't create new files when an existing one can be modified.
- **No backwards-compat hacks.** Remove dead code cleanly; no shim comments.

## Stack

- **Frontend:** Next.js 16 (App Router, TypeScript)
- **Backend:** Fastify (`apps/backend`) for split-runtime API deployments
- **CMS:** Payload CMS 3.x (admin panel at `/admin`)
- **Contracts:** Shared TS contracts (`packages/contracts`) + OpenAPI (`apps/backend/openapi`)
- **Typed API Client:** Generated from OpenAPI (`packages/api-client`)
- **Testing:** Vitest (unit, integration, e2e smoke)
- **Analytics:** Cloudflare Web Analytics
- **Performance:** Vercel Speed Insights
- **Email:** Resend (`@payloadcms/email-resend`)
- **Database:** Supabase Postgres (`@payloadcms/db-postgres`)

## Commands

```bash
# ── Dev ───────────────────────────────────────────────────────────────────────
npm run dev              # Start dev server with Turbopack (localhost:3000)
npm run dev:schema-push  # Dev server with Payload auto-push enabled (use when adding new fields/collections)

# ── Schema / Migrations ────────────────────────────────────────────────────────
npm run generate:migration          # Auto-generate a CMS migration after adding/changing collections or fields
npm run generate:types              # Generate Payload TypeScript types
npm run db:migrate:backend                  # Apply backend table migrations (migrations/versions/)
npm run db:migrate:backend:status           # Show applied/pending backend migrations
npm run db:migrate:rollback         # Roll back the latest backend migration
npm run db:migrate:payload              # Apply pending CMS migrations (migrations/payload/)
npm run db:migrate:payload:status       # Show applied/pending CMS migrations
npm run db:check:payload            # Check Payload generated schema parity against the actual DB
npm run db:check:payload:legacy     # Legacy hardcoded table/column guardrail (may drift)
npm run db:repair:payload           # Repair Payload schema drift in the DB
npm run db:schema:drift             # Alias: runs Payload generated-schema parity check (no longer auto-generates repair migrations)
npm run db:schema:drift:check       # Alias for db:schema:drift (--check-only flag ignored; use db:schema:ensure:check instead)
npm run hooks:install               # Wire up .githooks/ into .git/hooks/ (run once after cloning)
npm run backup                      # Run database backup script

# ── Build / Lint / Type ────────────────────────────────────────────────────────
npm run build            # Production build
npm run lint             # ESLint check
npm run lint:architecture # Enforce architecture boundary imports
npm run check:type       # Repository typecheck (excludes .next noise)
npm run openapi:generate # Generate typed API definitions from OpenAPI
npm run openapi:check    # Verify generated OpenAPI types are up to date

# ── Test ──────────────────────────────────────────────────────────────────────
npm run test:unit        # Domain/application unit tests
npm run test:integration # Fastify route integration tests
npm run test:e2e         # Typed-client smoke tests against live backend instance
npm run test:ci          # Run unit + integration + e2e suites

# ── Backend ───────────────────────────────────────────────────────────────────
npm run backend:dev      # Backend watch mode
npm run backend:start    # Start backend server
npm run backend:lint     # Lint backend app
npm run backend:typecheck # Typecheck backend app

# ── Seed / Data ───────────────────────────────────────────────────────────────
npm run seed:site-pages  # Seed site-pages collection
npm run seed:forms       # Seed form templates
npm run payload          # Payload CLI passthrough
```

## Adding a New Field or Collection (Schema Change Workflow)

When you add or modify a Payload collection or field, follow these steps. **Do not write SQL for Payload-managed tables by hand.**

### For Payload-managed schema (collections, globals, fields)

```bash
# 1. Add/change the field or collection in src/payload/collections/* or src/payload/globals/*
#    IMPORTANT: Use relative paths and explicit .ts extensions for all internal imports.

# 2. Update the Schema Manifest (Source of Truth for pre-push)
#    Add/remove the field in scripts/db/schema-manifest.mjs to prevent 'pre-push' drift errors.

# 3. Generate the migration file from the schema diff
npm run generate:migration
# → Creates migrations/payload/<timestamp>_<name>.ts automatically

# 4. Apply the migration to confirm it runs cleanly
npm run db:migrate:payload

# 5. Commit both the collection change, manifest change, and the generated migration file
git add src/payload/collections/... migrations/payload/... scripts/db/schema-manifest.mjs
git commit -m "feat: add <field> to <Collection>"
```

### ESM Compliance & Import Rules (Critical)

Payload is configured as a **Native ESM** project (`"type": "module"` in `package.json`).
- **Extensions are Mandatory:** All internal imports (hooks, utils, blocks) MUST include the `.ts` or `.js` extension.
- **Relative Paths:** Prefer relative paths over deep aliases in CMS-related files to avoid resolution errors during CLI migration execution.

### Database Stability & Troubleshooting

- **Migrations > Push:** In local dev with Supabase, `PAYLOAD_DB_PUSH=true` (or `npm run dev:schema-push`) may crash due to Drizzle-ORM parameter binding issues. **Prefer generating and running migrations.**
- **Table Names:** Collection `slug` (e.g., `reusable-sections`) and `dbName` (e.g., `reuse_sec`) often differ. Always check the config before writing manual repair scripts.
- **Schema Manifest:** If a column is intentionally dropped, it MUST be removed from `scripts/db/schema-manifest.mjs`, otherwise the `pre-push` hook will block you and generate redundant repair migrations.
- **Diagnostics:** Use programmatic test routes (like `/api/test-runner` if available) to verify CRUD operations across all core collections after a complex migration.

CI runs `npm run db:migrate:payload` on every push. If you forget to generate the migration or update the manifest, CI/pre-push will fail.

### For backend operational tables (guide_submissions, outbox, idempotency, etc.)

These tables are **not** Payload-managed. Write `.up.sql` and `.down.sql` files manually in `migrations/versions/` following the existing naming convention (`NNNN_description.up.sql`). Then run `npm run db:migrate:backend`.

### Which system owns which tables

| System | Directory | Tables |
|--------|-----------|--------|
| Payload (`db:migrate:payload`) | `migrations/payload/` | All CMS collections: site_pages, testimonials, blog_posts, media, users, etc. |
| Custom runner (`db:migrate:backend`) | `migrations/versions/` | Backend ops: guide_submissions, inquiry_submissions, backend_outbox_jobs, backend_idempotency_keys, backend_rate_limit_counters, schema_migrations, audit_logs |

## Schema Drift Detection (Pre-Push Hook)

A pre-push git hook automatically checks the live database for schema drift before every push. This prevents the DB and TypeScript schema from silently diverging.

### How it works

1. **Schema manifest** — `scripts/db/schema-manifest.mjs` is the single source of truth for all expected columns across every table (Payload-managed and custom). It declares column names and SQL types.
2. **Drift detector** — `scripts/db/schema-drift.mjs` queries `information_schema.columns`, diffs against the manifest, and reports any missing columns.
3. **Pre-push hook** — `.githooks/pre-push` runs two checks before every `git push`:
   - Pending SQL migrations (blocks if any `migrations/versions/` file hasn't been applied)
   - Schema drift (blocks if any manifest column is missing from the DB)

### When the hook blocks a push

If drift is detected, the hook auto-generates a numbered repair migration and prints instructions:

```
❌ Schema drift: N missing column(s)
📄 Repair migration generated:
   migrations/versions/NNNN_auto_schema_drift.up.sql
   migrations/versions/NNNN_auto_schema_drift.down.sql

⚠️  NEXT STEPS:
   1. Review the generated migration (check types and defaults)
   2. git add migrations/versions/NNNN_auto_schema_drift.{up,down}.sql
   3. git commit -m "fix: repair schema drift"
   4. npm run db:migrate:backend   ← apply it locally first
   5. Push again
```

The migration uses `ADD COLUMN IF NOT EXISTS` only — additive, never destructive. Missing tables are reported but never auto-created.

### Adding a new field to the manifest

When you add a column to a Payload collection/global or a custom table, also add it to `scripts/db/schema-manifest.mjs`:

```js
// In SCHEMA_MANIFEST, under the relevant table:
my_table: {
  existing_col: 'character varying',
  new_col: 'character varying',   // ← add this
},
```

If the manifest is out of date, the hook will generate spurious repair migrations.

### Hook installation (after cloning)

The hook file lives in `.githooks/pre-push` (committed to the repo). It must be wired up once per clone:

```bash
npm run hooks:install
```

### Manual drift check

```bash
npm run db:schema:ensure:check   # check Payload generated-schema parity against live DB
npm run db:schema:drift          # deprecated alias — delegates to generated-schema parity check
```

## Environment Variables

```
POSTGRES_URL                    # Postgres connection string — auto-provisioned by Supabase+Vercel integration (pooler, port 6543)
DATABASE_SSL_REJECT_UNAUTHORIZED # SSL cert verification (default: false)
PAYLOAD_DB_PUSH                 # Enable Payload schema push (default: false in .env.example)
PAYLOAD_SECRET                  # Auth token secret for Payload CMS
PAYLOAD_SEED_SECRET             # Optional secret for seed command
NEXT_PUBLIC_SERVER_URL          # Public server URL
ENABLE_DEV_REDIRECT_RULES       # Enable redirect rules in local dev (default: false)

BACKEND_INTERNAL_URL            # Optional proxy target for Next API routes
BACKEND_HOST                    # Backend bind host (default 127.0.0.1)
BACKEND_PORT                    # Backend bind port (default 18000)
BACKEND_RATE_LIMIT_MAX          # Backend edge rate limit max requests/window
BACKEND_RATE_LIMIT_WINDOW_MS    # Backend edge rate limit window length
BACKEND_CORS_ORIGINS            # Backend CORS allowlist (required in production unless NEXT_PUBLIC_SERVER_URL is set)
ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK # Set true only for explicit local/test in-memory limiter fallback
BACKEND_API_KEYS                # Comma-separated key entries: key:role:keyId
BACKEND_INTERNAL_API_KEY        # Optional dedicated internal role key
BACKEND_ADMIN_API_KEY           # Optional dedicated admin role key

OUTBOUND_WEBHOOK_URL            # Optional signed outbound event webhook endpoint
OUTBOUND_WEBHOOK_SECRET         # Optional HMAC secret for outbound webhook signatures
CMS_SKIP_PAYLOAD                # Optional local/test bypass for payload-backed CMS calls
```

Plus Resend keys (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `CONTACT_EMAIL`), Supabase keys (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), and many `PAYLOAD_ADMIN_*` customisation vars. See `.env.example` for the full list.

## Repository Layout

| Path | Purpose |
|---|---|
| `src/` | Next.js app + clean-monolith layers (`domain`, `application`, `infrastructure`) |
| `apps/backend/` | Fastify backend runtime for split deployment |
| `packages/contracts/` | Shared DTO/contracts package |
| `packages/api-client/` | Generated typed client from OpenAPI |
| `tests/` | Unit, integration, and e2e suites |

## Architecture (Current)

### Phase 1: Clean Monolith Boundaries (inside `src/`)

- **`src/domain/`** — Pure business rules/validation (no framework or infra imports).
- **`src/application/`** — Use-case orchestration and service results, consuming dependency ports.
- **`src/infrastructure/`** — External adapters (DB, email, Payload, HTTP adapters, security).
- **`src/app/api/`** — Thin controllers only (request/response mapping + service call).
- **`src/components/`** — UI layer.
- **`src/application/ports/`** — Stable repository/service interfaces consumed by application layer.
- Payload-specific schema/collection knowledge is isolated to infrastructure adapters (for example `src/infrastructure/cms/*`), not application services.

Import boundaries are enforced by ESLint via `lint:architecture`.

### Phase 2: Split Runtime Support

- Backend app at `apps/backend/src/server.ts` exposes:
  - `GET /health`
  - `GET /health/ready`
  - `GET /metrics` (internal/admin API key required)
  - `GET /v1/search`
  - `POST /v1/forms/guide`
  - `POST /v1/forms/inquiry`
  - `POST /v1/forms/templates/create`
  - `POST /v1/internal/seed-site-pages`
  - `POST /v1/pages/live/:id/create-preset`
  - `POST /v1/pages/drafts/:id/create-preset`
  - `POST /v1/pages/drafts/:id/promote-to-live`
  - `POST /v1/pages/playgrounds/:id/create-draft`
  - `POST /v1/pages/playgrounds/:id/create-preset`
  - `GET /v1/content/pages/:slug`
  - `GET /v1/content/navigation`
  - `GET /v1/admin/submissions`
  - `GET /v1/admin/submissions/:id`
  - `POST /v1/admin/submissions/:id/replay-side-effects`
  - `GET /v1/integrations/status`
- Backend includes:
  - centralized error handler
  - response `x-request-id`
  - response timing header `x-response-time-ms`
  - standardized backend error envelope (`success=false`, `code`, `message`, `status`, `requestId`)
  - POST idempotency support via `Idempotency-Key`
  - persistent outbox pipeline with retry/dead-letter state
  - shared DB-backed edge rate limiting middleware (`apps/backend/src/middleware/rateLimit.ts`)
- Next API routes that proxy to the backend when `BACKEND_INTERNAL_URL` is set (**proxy-first fail-closed**): `/api/search`, `/api/guide`, `/api/inquiry`, `/api/internal/seed-site-pages`, `/api/content/*`, `/api/admin/submissions*`, `/api/integrations/status`, `/api/pages/*`, `/api/forms/templates/*`.
- Routes that are **always local** in Next (no proxy): `/api/draft-mode/*` (Next draft cookies), `/api/internal/cron/*` (Vercel Cron jobs: outbox-tick, backup), `/api/internal/seed-forms`.

### Contracts and API Schema

- Shared app contracts live in `packages/contracts`.
- Backend OpenAPI spec lives in `apps/backend/openapi/openapi.yaml`.
- Typed client and OpenAPI-derived types live in `packages/api-client`.
- Regeneration flow:
  - `npm run openapi:generate`
  - `npm run openapi:check` (used in CI to prevent schema/client drift)
- The source of truth for implementing backend feature changes is `## Backend Feature Implementation Playbook (Mandatory)` in this document.

## CMS and Rendering

### CMS Data Layer (`src/payload/`)

- **`src/payload/client.ts`** — Payload init wrapper (`getPayload`), imported lazily by infra adapters when needed.
- **`src/payload/cms.ts`** — CMS fetch helpers/types (`getSiteSettings`, `getUISettings`, `getSitePageBySlug`, etc.).

### Section Rendering

- `UniversalSections` is now a thin orchestrator.
- Individual section renderers live in `src/components/cms/sections/*`.
- Shared section helpers/components live in:
  - `src/components/cms/sections/registry.ts`
  - `src/components/cms/sections/utils.ts`
  - `src/components/cms/sections/shared/*`
- Payload block definitions are split per section under `src/payload/blocks/sections/*` and re-exported by `src/payload/blocks/pageSections.ts`.

## Routing

The app uses route groups:
- `(frontend)` public pages
- `(payload)` admin panel
- `(diagnostics)` internal tools

Key frontend routes:
- `/`, `/about`, `/services`, `/pricing`, `/contact`, `/privacy`
- `/services/[slug]`
- `/[...slug]` (active CMS pages)
- `/admin/[[...segments]]` (Payload admin)

## Testing Strategy

### Unit Tests (`tests/unit`)

- Domain validation/parsing and application guard behavior.
- Fast and deterministic, no network/DB required.

### Integration Tests (`tests/integration`)

- `buildBackendServer()` + `fastify.inject()` route tests.
- Validates real HTTP contract behavior at backend layer.

### E2E Smoke (`tests/e2e`)

- Boots backend server and exercises endpoints using generated typed API client.
- Ensures OpenAPI client and runtime behavior stay aligned.

## CI Pipeline

CI workflow (`.github/workflows/ci.yml`) runs against a local Postgres 16 container:
1. `npm run check:runtime`
2. `npm ci`
3. `npm run db:migrate:backend` — apply backend table migrations
4. `npm run db:migrate:backend:status -- --check` — fail if any backend migrations are pending
5. `npm run db:migrate:payload` — apply CMS migrations
6. `npm run db:migrate:payload:status` — fail if any CMS migrations are pending
7. `npm run predeploy:guardrails` — runtime check + Payload schema check + CMS governance check + type check + importmap check
8. `npm run lint`
9. `npm run lint:architecture`
10. `npm run openapi:check`
11. `npm run test:ci`
12. `npm run build`

## Operational Notes

- If backend proxy is down or unreachable while `BACKEND_INTERNAL_URL` is set, proxy-enabled Next API routes return `503 BACKEND_UNAVAILABLE` (no local fallback).
- In production, backend startup fails fast if CORS allowlist is not configured (`BACKEND_CORS_ORIGINS` or `NEXT_PUBLIC_SERVER_URL`).
- `/health` and `/health/ready` are intentionally excluded from backend edge rate limiting.
- Non-public backend routes use API key role checks (`internal`, `admin`) via `x-api-key`.
- Versioned SQL migrations live in `migrations/versions`, tracked by `public.schema_migrations`.
- When adding/changing backend endpoints:
  1. Update `apps/backend/openapi/openapi.yaml`
  2. Run `npm run openapi:generate`
  3. Update/add integration and e2e tests
  4. Run `npm run openapi:check && npm run test:ci`

## Frontend Content Externalization Phases

This section tracks the phased removal of hardcoded frontend content so future sites can reuse backend/CMS contracts and swap UI with minimal code edits.

### Phase A (Completed)

- Standardized brand/site fallbacks via `src/lib/site-config.ts`.
- Removed direct `Plenor` hardcoding from metadata, OG/icon generation, footer/nav defaults, and payload defaults.
- Replaced large hardcoded `DEFAULT_SITE_PAGES` fallback payload in `src/payload/cms.ts` with preset-based generation (`buildCorePresetSections`).

### Phase B (Completed)

- Made form legal links fully CMS-configurable:
  - `site-settings.guideForm.privacyLabel`
  - `site-settings.guideForm.privacyHref`
  - `site-settings.inquiryForm.privacyLabel`
  - `site-settings.inquiryForm.privacyHref`
- Wired CMS `UniversalSections` form rendering to consume those CMS fields instead of hardcoded `Privacy Policy` + `/privacy`.
- Reduced home/contact hardcoded hero/form copy by reading existing section fields:
  - hero eyebrow + primary CTA label/href
  - guide section label/heading/highlight/body
  - inquiry section label
  - table-based stage labels for home cards
- Contact page bottom legal notice now uses `site-settings.inquiryForm` consent/privacy fields.

### Phase C (Completed)

- Added shared page-content resolvers so route-level fallback/override logic is centralized and testable:
  - `src/lib/page-content/home.ts`
  - `src/lib/page-content/not-found.ts`
- Updated custom home rendering to use CMS-driven section content for previously hardcoded structural copy:
  - problem label via `richTextSection.sectionLabel`
  - "What We Do" heading/link via `ctaSection` (`heading`, `buttonLabel`, `buttonHref`)
  - audience label via `simpleTableSection.sectionLabel`
- Added `sectionLabel` to `sectionCommonFields` so custom page layouts can expose/edit eyebrow-style labels across block types.
- Updated preset-merge behavior (`src/payload/hooks/sitePagePreset.ts`) to preserve `sectionLabel` when core presets are regenerated.
- Added not-found CMS metadata fields (`notFoundPage.metaTitle`, `notFoundPage.metaDescription`) and wired `generateMetadata` on `/not-found` to use them.
- Added regression tests for CMS fallback/override behavior:
  - `tests/unit/cms/pageContentResolvers.test.ts`

## Backend Feature Implementation Playbook (Mandatory)

This section is normative and mandatory for all backend feature work.

- Every backend feature **MUST** follow a contract-first workflow.
- No backend route or behavior change is complete without matching tests, OpenAPI updates, and a full gate pass.
- Any skipped step **MUST** be explicitly marked `N/A` with reason in PR notes.

### Change Type Classifier

Complete this classifier before writing code.

| Change Type | Required Work |
|---|---|
| `New endpoint` | Add contracts (`packages/contracts`), add OpenAPI path/schema, implement domain/application/infrastructure flow, wire backend route, add proxy route if frontend-consumed, add unit/integration/e2e tests, run full gate. |
| `Endpoint behavior change` | Update/confirm contracts and OpenAPI behavior docs, adjust application logic and/or adapters, ensure backward compatibility note, expand regression tests, run full gate. |
| `Validation/security change` | Update validation/auth/rate-limit/origin logic, document 401/403/429 behavior in OpenAPI/contracts, add negative-path tests for auth and validation, run full gate. |
| `Integration change (CRM/email/webhook)` | Isolate provider changes in `src/infrastructure`, document payload/timeout/retry behavior, add failure-mode tests and observability notes, update env docs if needed, run full gate. |
| `Data schema/migration change` | Define migration plan and rollback path, update persistence adapters and related contracts if exposed, validate data compatibility, add migration verification steps, run full gate plus migration checks. |
| `Background job/outbox change` | Document enqueue/dequeue lifecycle, retry/backoff/dead-letter behavior, idempotency expectations, add reliability tests for duplicate and retry scenarios, run full gate. |

### Step-by-Step Execution Matrix

Use this matrix in order. A feature is incomplete if any non-`N/A` row fails done criteria.

| Step | Required Inputs | Required Outputs | Commands | Done Criteria |
|---|---|---|---|---|
| **Step 0: Classify feature and risk** | Feature request, affected paths, release context | `feature_type`, `risk_level`, `breaking_change=true/false` recorded in spec | `N/A` | Classifier completed and reviewed before coding starts. |
| **Step 1: Define contract delta first** | Existing contracts + OpenAPI spec | Updated request/response/error shapes with compatibility note | Edit `packages/contracts/*`, edit `apps/backend/openapi/openapi.yaml` | Contract diff is explicit, version-safe, and understandable without reading implementation code. |
| **Step 2: Regenerate typed client** | Updated OpenAPI file | Intentional generated client diff | `npm run openapi:generate` | Generated diff is clean, expected, and free of unrelated churn. |
| **Step 3: Domain layer implementation** | Contract definitions and business rules | Deterministic domain functions and validation logic in `src/domain` | `N/A` | No framework or infrastructure imports in domain code. |
| **Step 4: Application layer orchestration** | Domain outputs + use-case requirements | One service entrypoint returning normalized `ServiceResult` in `src/application` | `N/A` | Orchestration is centralized and transport-agnostic. |
| **Step 5: Infrastructure adapters** | External system requirements (DB, email, CRM, CMS, webhook) | Provider-specific adapters in `src/infrastructure` only | `N/A` | External side effects are isolated from domain/application logic. |
| **Step 6: HTTP surface wiring** | Application service(s), backend route requirement | Thin backend route in `apps/backend/src/server.ts` mapped to service | `N/A` | No business logic in transport layer; route only maps request/context/response. |
| **Step 7: Proxy behavior check** | Backend route path, frontend consumption path | Thin proxy-first route in `src/app/api/*` (if frontend-consumed) with explicit fallback policy | `N/A` | Frontend route behavior is deterministic with proxy-first + safe fallback (when applicable). |
| **Step 8: Security requirements** | Auth model, validation rules, rate-limit/origin policies | Explicit 401/403/429 behavior in contracts and tests | `N/A` | Security checks execute before side effects; failure paths are covered by tests. |
| **Step 9: Reliability requirements** | Mutation semantics, async side-effect behavior | Documented idempotency/retry behavior and duplicate handling | `N/A` | Mutating operations are retry-safe or explicitly constrained and documented. |
| **Step 10: Observability requirements** | Logging/monitoring standards, request ID policy | Structured log fields, request ID propagation, health/readiness impact notes | `N/A` | Operators can diagnose failures for the new/changed path without code inspection. |
| **Step 11: Test requirements** | Contract diff + implementation diff | Unit + integration + e2e coverage for changed behavior | Add tests under `tests/unit`, `tests/integration`, `tests/e2e` | Tests cover happy path, validation errors, auth errors, rate-limit, and integration failure mode. |
| **Step 12: Full gate commands (mandatory, ordered)** | Code/tests/docs complete | Passing gate report | `npm run lint`<br/>`npm run lint:architecture`<br/>`npm run check:type`<br/>`npm run db:migrate:backend`<br/>`npm run db:migrate:backend:status -- --check`<br/>`npm run backend:lint`<br/>`npm run backend:typecheck`<br/>`npm run openapi:check`<br/>`npm run test:ci`<br/>`npm run build` | All commands pass in order with no skipped steps unless marked `N/A` in PR notes. |
| **Step 13: Documentation sync** | Final merged behavior + env/config changes | Updated CLAUDE/README/.env docs for routes, vars, and ops behavior | Update docs files directly | No undocumented configuration or behavior drift remains. |
| **Step 14: Release readiness note** | Deployment target, risk classification, rollback strategy | Rollout steps, rollback trigger, post-deploy smoke checks | `N/A` | Release note is explicit enough for another engineer to execute without clarification. |
| **Step 15: Completion rule** | Evidence from Steps 0-14 | Final feature checklist with pass/`N/A` status | `N/A` | Feature is not complete until Steps 0-14 are satisfied or explicitly marked `N/A` with rationale. |

### Backend Feature Spec Template

Copy/paste and fill before implementation:

```md
# Backend Feature Spec

## 1) Feature Summary
- Feature name:
- Owner:
- Date:
- Related issue/ticket:

## 2) Change Classifier
- feature_type: (`New endpoint` | `Endpoint behavior change` | `Validation/security change` | `Integration change` | `Data schema/migration change` | `Background job/outbox change`)
- risk_level: (`low` | `medium` | `high`)
- breaking_change: (`true` | `false`)
- backward_compatibility_note:

## 3) Contract Delta (Required Before Coding)
- Contracts to update (`packages/contracts/*`):
- OpenAPI paths/schemas to update (`apps/backend/openapi/openapi.yaml`):
- Request shape changes:
- Response shape changes:
- Error shape changes (401/403/429/5xx as relevant):

## 4) Implementation Plan by Layer
- Domain (`src/domain/*`):
- Application (`src/application/*`):
- Infrastructure (`src/infrastructure/*`):
- Backend route wiring (`apps/backend/src/server.ts`):
- Next proxy updates (`src/app/api/*`, if frontend-consumed):

## 5) Security and Reliability
- Auth/role requirements:
- Validation requirements:
- Rate-limit/origin expectations:
- Idempotency/duplicate handling:
- Retry/backoff/dead-letter behavior (if async side effects):

## 6) Observability
- Request ID propagation impact:
- Logs added/updated:
- Health/readiness impact:
- Alerting/metrics notes:

## 7) Tests
- Unit tests:
- Integration tests:
- E2E typed-client tests:
- Failure-mode tests:

## 8) Mandatory Full Gate (Ordered)
1. npm run lint
2. npm run lint:architecture
3. npm run check:type
4. npm run db:migrate:backend
5. npm run db:migrate:backend:status -- --check
6. npm run backend:lint
7. npm run backend:typecheck
8. npm run openapi:check
9. npm run test:ci
10. npm run build

## 9) Documentation and Release
- Docs updated (CLAUDE/README/.env):
- Rollout steps:
- Rollback trigger:
- Post-deploy smoke checks:
```

### Backend Feature Definition of Done Checklist

Copy/paste in PR description and mark each line:

```md
# Backend Feature DoD Checklist

- [ ] Step 0 complete: classifier recorded (`feature_type`, `risk_level`, `breaking_change`).
- [ ] Step 1 complete: contracts + OpenAPI updated before coding.
- [ ] Step 2 complete: `npm run openapi:generate` run and generated diff is intentional.
- [ ] Step 3 complete: domain logic is pure and framework/infra-free.
- [ ] Step 4 complete: application service returns normalized `ServiceResult`.
- [ ] Step 5 complete: external providers isolated in infrastructure adapters.
- [ ] Step 6 complete: backend HTTP route wiring is thin and transport-only.
- [ ] Step 7 complete: proxy-first Next API route verified (if frontend-consumed).
- [ ] Step 8 complete: explicit security behavior documented/tested (401/403/429).
- [ ] Step 9 complete: reliability/idempotency behavior documented/tested.
- [ ] Step 10 complete: observability/log/request-id/health notes completed.
- [ ] Step 11 complete: unit + integration + e2e + failure-mode coverage added.
- [ ] Step 12 complete: full gate commands passed in required order.
- [ ] Step 13 complete: CLAUDE/README/.env docs synced.
- [ ] Step 14 complete: rollout, rollback, and smoke checks documented.
- [ ] Step 15 complete: any skipped step is marked `N/A` with rationale.
```
