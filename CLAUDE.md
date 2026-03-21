# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Protocol

**At the start of every session**, read these files to restore context:
- [.claude/memory/user.md](.claude/memory/user.md) — who the user is and their working style
- [.claude/memory/preferences.md](.claude/memory/preferences.md) — code style and workflow rules
- [.claude/memory/decisions.md](.claude/memory/decisions.md) — key architectural and design decisions
- [.claude/memory/people.md](.claude/memory/people.md) — stakeholders and contacts

**At the end of every session** (or when something significant is decided/learned), update the relevant memory files so future sessions stay in sync.

## Core Rules

- **No unsolicited commits.** Only commit when the user explicitly asks.
- **No trailing summaries.** Don't explain what you just did at the end of a response.
- **Minimal scope.** Only change what's directly required. No cleanup, refactors, or bonus features.
- **Prefer editing over creating.** Don't create new files when an existing one can be modified.
- **No backwards-compat hacks.** Remove dead code cleanly; no shim comments.

## Stack

- **Framework:** Next.js 16 (TypeScript)
- **Hosting:** Vercel
- **CMS:** Payload CMS (admin panel at `/admin`)
- **Analytics:** Cloudflare Web Analytics
- **Performance:** Vercel Speed Insights
- **Email:** Resend
- **Database:** Supabase
- **Design:** Playfair Display (headings) + DM Sans (body), navy hero sections

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
```

No test suite exists yet.

## Environment Variables

```
DATABASE_URI          # Postgres connection string (Supabase pooler)
PAYLOAD_SECRET        # Auth token secret for Payload CMS
NEXT_PUBLIC_SERVER_URL  # Public server URL (used by middleware for redirect fetching)
STAGING_PASSWORD      # If set, gates the entire site behind a password
```

Plus Resend and Supabase keys for API routes. See `.env.example` for the full list.

## Architecture

### CMS Layer (`src/payload/`)

All content is managed through Payload CMS, with the admin panel at `/admin`. The CMS layer has two entry points:

- **`src/payload/client.ts`** — `getPayload()` wrapper that initializes the Payload instance. Import as a server-only module.
- **`src/payload/cms.ts`** — All data-fetching functions and TypeScript types. Functions: `getSiteSettings`, `getUISettings`, `getSitePageBySlug`, `getCollectionData`, `getSitemapSlugs`, `getRedirectRules`.

### Dual Rendering Path

Pages support two rendering modes, chosen per-page in the CMS:

1. **Legacy template mode** — Dedicated page components (`HomeSections`, `AboutSections`, etc.) receive typed CMS fields from schema-specific globals. Content has hardcoded fallbacks.

2. **CMS page-builder mode** (`site-pages` collection with `sections[]`) — `UniversalSections` (`src/components/cms/UniversalSections.tsx`) renders an array of typed section blocks. This is the new path; all future pages should use this.

The home page (`src/app/page.tsx`) illustrates the transition: it checks for a `site-pages` entry with slug `"home"` and its `sections` array first; if empty/absent it falls back to legacy rendering.

### Section Types (UniversalSections)

`UniversalSections` is a `'use client'` component. It renders these `blockType` values from a `sections[]` array:

`heroSection`, `richTextSection`, `ctaSection`, `imageSection`, `videoSection`, `simpleTableSection`, `comparisonTableSection`, `dynamicListSection`, `reusableSectionReference`, `spacerSection`, `dividerSection`

All sections accept `theme` (`navy` | `charcoal` | `black` | `white` | `light`) and `size` (`compact` | `regular` | `spacious`). Dark themes are navy/charcoal/black; light themes are white/light.

`dynamicListSection` pulls live data from `collections` (blogPosts, serviceItems, testimonials), passed down from the page server component.

`reusableSectionReference` embeds a `reusable-sections` document's own `sections[]`.

### Routing

| Route | Source |
|---|---|
| `/` | `src/app/page.tsx` — site-pages `"home"` or legacy globals |
| `/about`, `/services`, `/pricing`, `/contact` | Dedicated page files + `*Sections` components |
| `/[...slug]` | `src/app/[...slug]/page.tsx` — any active `site-pages` entry by slug |
| `/admin/[[...segments]]` | Embedded Payload CMS admin panel |

All pages use `export const revalidate = 60` (ISR, 60-second cache).

### Middleware (`src/middleware.ts`)

Runs on every non-static request. Two responsibilities in order:

1. **Staging auth gate** — if `STAGING_PASSWORD` is set, redirects unauthenticated requests to `/staging-login`. Exempt paths: `/staging-login`, `/api/staging-auth`, `/api/draft-mode/*`, `/admin/*`.
2. **CMS redirects** — fetches `redirect-rules` documents from Payload REST API (works in Edge runtime). Rules are cached in-memory for 60 seconds. Supports trailing `/*` wildcard patterns.

### API Routes

- `POST /api/inquiry` — Contact form submission → Resend email
- `POST /api/guide` — Guide download form → Resend email + Supabase insert
- `GET/POST /api/draft-mode/enable` — Enables Next.js draft mode (requires `PAYLOAD_SECRET`)
- `GET /api/draft-mode/disable` — Disables draft mode
- `POST /api/staging-auth` — Sets/clears the `staging_auth` session cookie

### Payload Schema Structure

- **`SiteSettings`** (global) — Global config: nav links, footer, form labels, cookie banner, JSON-LD, analytics ID, privacy policy, 404 copy.
- **`UISettings`** (global) — UI design tokens: colors, typography, layout, buttons.
- **`SitePages`** (collection) — Page builder documents. Has `slug`, `sections[]` (array of section blocks), `seo`, `isActive`.
- **`ReusableSections`** (collection) — Shared section blocks embeddable in any SitePage.
- **`RedirectRules`** (collection) — CMS-managed redirects with `fromPath`, `toPath`, `isPermanent`, `enabled`.
