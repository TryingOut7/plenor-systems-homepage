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
cp .env.local .env.local
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, problem, services overview, guide CTA |
| `/services` | Services — Testing & QA and Launch & GTM detail |
| `/pricing` | Pricing — engagement model |
| `/about` | About — team, mission, focus |
| `/contact` | Contact — guide form + inquiry form |
| `/privacy` | Privacy policy |

## Build

```bash
npm run build
```

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
