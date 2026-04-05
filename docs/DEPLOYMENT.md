# Production deployment (Vercel + Supabase)

This app is designed to run on **Vercel** (Next.js) with **Supabase Postgres** as the single database. Operational tables (`guide_submissions`, rate limits, outbox) and **Payload CMS** must use the **same** `POSTGRES_URL` / project as `SUPABASE_URL`.

## Runtime requirements

| Requirement | Notes |
|-------------|--------|
| **Node.js 20.x** | `package.json` `engines`, `.nvmrc`, and `npm run check:runtime` enforce this. In Vercel **Project → Settings → General → Node.js Version**, choose **20.x** if it does not follow `engines` automatically. |
| **Install** | `vercel.json` uses `npm ci` for reproducible installs. |
| **Build** | Default `npm run build` runs backend SQL migrations, **Payload** migrations, schema drift check, then `next build`. The build needs **`POSTGRES_URL`** (and secrets) available during the build. |

## Vercel environment variables

Set at least these for **Production** (and **Preview** where builds run against a DB):

- `POSTGRES_URL` — auto-provisioned by the Supabase+Vercel Marketplace integration (pooler, port 6543). Set manually for deployments not using the integration.
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL` — canonical public URL (use preview URL for Preview deployments when testing).
- `SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; powers rate limiting + form persistence via PostgREST.
- `CRON_SECRET` — must match what secures `/api/internal/cron/*` (see `.env.example`).
- `RESEND_*` / email vars as needed.
- `BLOB_READ_WRITE_TOKEN` — if using Vercel Blob for media / import-export (see `.env.example`).

Optional: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, split-backend vars (`BACKEND_INTERNAL_URL`, API keys), `CRM_WEBHOOK_*`.

## Supabase

- **Migrations**: Backend SQL lives in `migrations/versions/`; Payload migrations in `migrations/payload/`. Production applies them via the build pipeline (`npm run build` includes both chains).
- **PostgREST / anon**: App server code uses the **service role** key only. Do not expose that key to the browser. RLS is enabled on public tables; Payload connects with a DB role that bypasses RLS for CMS operations.
- **Backups**: Use Supabase **PITR** / managed backups for the database; the backup cron route is a heartbeat unless you add export logic.

## Vercel Cron

Cron jobs are declared in `vercel.json`. They require a **paid** Vercel plan that includes cron. Secure routes with `CRON_SECRET` as documented.

## Smoke checks after deploy

1. `GET /` and a CMS-driven page load.
2. `POST /api/guide` or contact flow with valid origin (rate limit + DB).
3. Payload admin `/admin` login.
4. Cron routes return 401 without `Authorization: Bearer <CRON_SECRET>` in production.
