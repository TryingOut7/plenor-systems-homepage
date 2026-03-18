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
- **CMS:** Sanity (Studio embedded at `/studio`)
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

# Sanity CMS data scripts (always run --dry-run first)
npm run migrate:sanity:pages          # Dry-run page migration
npm run migrate:sanity:pages:apply    # Apply page migration
npm run bootstrap:sanity:cms          # Dry-run CMS bootstrap
npm run bootstrap:sanity:cms:apply    # Apply CMS bootstrap
```

No test suite exists yet.

## Environment Variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID   # Sanity project ID
NEXT_PUBLIC_SANITY_DATASET      # Sanity dataset (default: "production")
SANITY_API_READ_TOKEN           # Sanity viewer token — enables draft mode and bypasses CDN
STAGING_PASSWORD                # If set, gates the entire site behind a password
```

Plus Resend and Supabase keys for API routes.

## Architecture

### CMS Layer (`src/sanity/`)

All content is managed through Sanity Studio, embedded at `/studio`. The CMS layer has two entry points:

- **`src/sanity/client.ts`** — `sanityFetch()` wrapper that switches between the CDN client (production) and a `previewDrafts` client with stega encoding (draft mode). Import as a server-only module.
- **`src/sanity/cms.ts`** — All GROQ queries and TypeScript types for every content type. Functions: `getSiteSettings`, `getSitePageBySlug`, `getCollectionData`, `getBlogPostBySlug`, `getServiceItemBySlug`, `getTestimonialBySlug`, `getSitemapSlugs`, `getRedirectRules`.

### Dual Rendering Path

Pages support two rendering modes, chosen per-page in Sanity:

1. **Legacy template mode** — Dedicated page components (`HomeSections`, `AboutSections`, etc.) receive typed CMS fields from schema-specific documents (`homePage`, `aboutPage`, etc.). Content has hardcoded fallbacks.

2. **CMS page-builder mode** (`sitePage` with `sections[]`) — `UniversalSections` (`src/components/cms/UniversalSections.tsx`) renders an array of typed section blocks. This is the new path; all future pages should use this.

The home page (`src/app/page.tsx`) illustrates the transition: it checks for a `sitePage` with slug `"home"` and its `sections` array first; if empty/absent it falls back to legacy `homePage` document rendering.

### Section Types (UniversalSections)

`UniversalSections` is a `'use client'` component that handles Sanity Visual Editing (optimistic updates via `useOptimistic`). It renders these `_type` values from a `sections[]` array:

`heroSection`, `richTextSection`, `ctaSection`, `imageSection`, `videoSection`, `simpleTableSection`, `comparisonTableSection`, `dynamicListSection`, `reusableSectionReference`, `spacerSection`, `dividerSection`, `advancedDataSection`

All sections accept `theme` (`navy` | `charcoal` | `black` | `white` | `light`) and `size` (`compact` | `regular` | `spacious`). Dark themes are navy/charcoal/black; light themes are white/light.

`dynamicListSection` pulls live data from `collections` (blogPosts, serviceItems, testimonials), passed down from the page server component.

`reusableSectionReference` embeds a `reusableSection` document's own `sections[]`, with its own `documentId` for visual editing attribution.

### Routing

| Route | Source |
|---|---|
| `/` | `src/app/page.tsx` — sitePage `"home"` or legacy `homePage` |
| `/about`, `/services`, `/pricing`, `/contact` | Dedicated page files + `*Sections` components |
| `/blog/[slug]`, `/services/[slug]`, `/testimonials/[slug]` | Collection detail pages |
| `/[...slug]` | `src/app/[...slug]/page.tsx` — any active `sitePage` by slug |
| `/studio/[[...tool]]` | Embedded Sanity Studio (client component) |

All pages use `export const revalidate = 60` (ISR, 60-second cache).

### Middleware (`src/middleware.ts`)

Runs on every non-static request. Two responsibilities in order:

1. **Staging auth gate** — if `STAGING_PASSWORD` is set, redirects unauthenticated requests to `/staging-login`. Exempt paths: `/staging-login`, `/api/staging-auth`, `/api/draft-mode/*`, `/studio/*`.
2. **CMS redirects** — fetches `redirectRule` documents from Sanity via direct API call (not the SDK, so it works in Edge runtime). Rules are cached in-memory for 60 seconds. Supports trailing `/*` wildcard patterns.

### API Routes

- `POST /api/inquiry` — Contact form submission → Resend email
- `POST /api/guide` — Guide download form → Resend email + Supabase insert
- `GET/POST /api/draft-mode/enable` — Enables Next.js draft mode (requires `SANITY_API_READ_TOKEN`)
- `GET /api/draft-mode/disable` — Disables draft mode
- `POST /api/staging-auth` — Sets/clears the `staging_auth` session cookie

### Sanity Schema Structure

- **`siteSettings`** (singleton) — Global config: nav links, footer, form labels, cookie banner, JSON-LD, analytics ID, privacy policy, 404 copy.
- **`sitePage`** — Page builder document. Has `slug`, `sections[]` (array of section objects), `seo`, `isActive`.
- **`reusableSection`** — Shared section blocks embeddable in any sitePage via `reusableSectionReference`.
- **`redirectRule`** — CMS-managed redirects with `fromPath`, `toPath`, `isPermanent`, `enabled`.
- **`homePage`, `aboutPage`, `servicesPage`, `contactPage`, `pricingPage`** — Legacy singleton documents for the typed template path.
- **`blogPost`, `serviceItem`, `testimonial`** — Collection documents with slugs, SEO, and PortableText body.

The Sanity Studio desk structure is customised in `src/sanity/deskStructure.ts`.
