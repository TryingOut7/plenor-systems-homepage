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

## Pre-launch Checklist

- [ ] Update founder name, role, and bio (About page)
- [ ] Verify `plenor.ai` sending domain in Resend dashboard (SPF, DKIM, DMARC)
- [ ] Set `GUIDE_PDF_URL` to the real PDF storage URL
- [ ] Set `NEXT_PUBLIC_GA4_ID` to the real GA4 Measurement ID
- [ ] Set all production env vars in Vercel dashboard
- [ ] Remove `STAGING_PASSWORD` from production env
