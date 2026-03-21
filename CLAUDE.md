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

- **Framework:** Next.js 16 (TypeScript)
- **Hosting:** Vercel
- **CMS:** Payload CMS 3.x (admin panel at `/admin`)
- **Analytics:** Cloudflare Web Analytics
- **Performance:** Vercel Speed Insights
- **Email:** Resend (via `@payloadcms/email-resend`)
- **Database:** Supabase (Postgres via `@payloadcms/db-postgres`)
- **Design:** Playfair Display (headings) + DM Sans (body), navy hero sections

## Commands

```bash
npm run dev              # Start dev server with Turbopack (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run payload          # Payload CLI
npm run generate:types   # Generate Payload TypeScript types
npm run seed:site-pages  # Seed site-pages collection
```

No test suite exists yet.

## Environment Variables

```
DATABASE_URI                    # Postgres connection string (Supabase pooler)
DATABASE_SSL_REJECT_UNAUTHORIZED # SSL cert verification (default: false)
PAYLOAD_DB_PUSH                 # Enable Payload schema push (default: true)
PAYLOAD_SECRET                  # Auth token secret for Payload CMS
PAYLOAD_SEED_SECRET             # Optional secret for seed command
NEXT_PUBLIC_SERVER_URL          # Public server URL
STAGING_PASSWORD                # If set, gates the site behind a password
ENABLE_DEV_REDIRECT_RULES       # Enable redirect rules in local dev (default: false)
```

Plus Resend keys (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `CONTACT_EMAIL`), Supabase keys (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), and many `PAYLOAD_ADMIN_*` customisation vars. See `.env.example` for the full list.

## Architecture

### CMS Layer (`src/payload/`)

All content is managed through Payload CMS, with the admin panel at `/admin`. The CMS layer has two entry points:

- **`src/payload/client.ts`** — `getPayload()` wrapper that initializes the Payload instance. Import as a server-only module.
- **`src/payload/cms.ts`** — All data-fetching functions and TypeScript types. Functions: `getSiteSettings`, `getUISettings`, `getSitePageBySlug`, `getCollectionData`, `getSitemapSlugs`, `getRedirectRules`.

### Rendering

All pages use the CMS page-builder path. The `site-pages` collection stores pages with a `sections[]` array rendered by `UniversalSections` (`src/components/cms/UniversalSections.tsx`). If a page has no sections, it returns `notFound()`. There is no legacy template fallback.

### Section Types (UniversalSections)

`UniversalSections` is a `'use client'` component. It renders these `blockType` values from a `sections[]` array:

<<<<<<< HEAD
`heroSection`, `richTextSection`, `ctaSection`, `imageSection`, `videoSection`, `simpleTableSection`, `comparisonTableSection`, `dynamicListSection`, `reusableSectionReference`, `spacerSection`, `dividerSection`
=======
`heroSection`, `richTextSection`, `ctaSection`, `guideFormSection`, `inquiryFormSection`, `privacyNoteSection`, `imageSection`, `videoSection`, `simpleTableSection`, `comparisonTableSection`, `dynamicListSection`, `reusableSectionReference`, `spacerSection`, `dividerSection`
>>>>>>> 0656c14 (Claude MD)

All sections accept `theme` (`navy` | `charcoal` | `black` | `white` | `light`) and `size` (`compact` | `regular` | `spacious`). Dark themes are navy/charcoal/black; light themes are white/light.

`dynamicListSection` pulls live data from `collections` (blogPosts, serviceItems, testimonials), passed down from the page server component.

`reusableSectionReference` embeds a `reusable-sections` document's own `sections[]`.

### Route Groups & Routing

The app uses Next.js route groups: `(frontend)` for public pages, `(payload)` for the admin panel, and `(diagnostics)` for internal tools.

| Route | Source |
|---|---|
| `/` | `src/app/(frontend)/page.tsx` — site-pages `"home"` |
| `/about`, `/services`, `/pricing`, `/contact` | `src/app/(frontend)/*/page.tsx` |
| `/services/[slug]` | `src/app/(frontend)/services/[slug]/page.tsx` — individual service pages |
| `/privacy` | `src/app/(frontend)/privacy/page.tsx` |
| `/staging-login` | `src/app/(frontend)/staging-login/page.tsx` |
| `/[...slug]` | `src/app/(frontend)/[...slug]/page.tsx` — any active `site-pages` entry by slug |
| `/admin/[[...segments]]` | `src/app/(payload)/admin/[[...segments]]/page.tsx` — Payload CMS admin panel |
| `/admin-diagnostics` | `src/app/(diagnostics)/admin-diagnostics/page.tsx` |

All pages use `export const revalidate = 60` (ISR, 60-second cache).

### API Routes

- `POST /api/inquiry` — Contact form submission → Resend email
- `POST /api/guide` — Guide download form → Resend email + Supabase insert
- `GET/POST /api/draft-mode/enable` — Enables Next.js draft mode (requires `PAYLOAD_SECRET`)
- `GET /api/draft-mode/disable` — Disables draft mode
- `POST /api/staging-auth` — Sets/clears the `staging_auth` session cookie
- `POST /api/internal/seed-site-pages` — Seeds site-pages collection (requires `PAYLOAD_SEED_SECRET`)

### Payload Config (`src/payload.config.ts`)

**Users collection** — Defined inline with roles: `admin`, `editor`, `viewer`. API key auth enabled. Role-based access control throughout.

**Plugins:**
- `seoPlugin` — Meta title, description, image fields on content collections
- `redirectsPlugin` — URL redirects from admin panel
- `nestedDocsPlugin` — Parent/child page hierarchy (opt-in via `PAYLOAD_ENABLE_NESTED_DOCS`)
- `searchPlugin` — Full-text search indexing with priority weights
- `formBuilderPlugin` — Form creation with submissions (`forms` / `form-submissions` collections)
- `importExportPlugin` — CSV/JSON import/export for collections
- `@payloadcms/plugin-mcp` — MCP integration
- Live Preview — Configured for site-pages, service-items, blog-posts, testimonials

### Payload Schema Structure

**Globals:**
- **`SiteSettings`** — Global config: nav links, footer, form labels, cookie banner, JSON-LD, analytics ID, privacy policy, 404 copy.
- **`UISettings`** — UI design tokens: colors, typography, layout, buttons.

**Collections:**
- **`SitePages`** — Page builder documents. Has `slug`, `sections[]` (array of section blocks), `seo`, `isActive`.
- **`ReusableSections`** — Shared section blocks embeddable in any SitePage.
- **`RedirectRules`** — CMS-managed redirects with `fromPath`, `toPath`, `isPermanent`, `enabled`.
- **`ServiceItems`** — Individual service entries with slugs.
- **`BlogPosts`** — Blog content.
- **`Testimonials`** — Customer testimonials.
- **`Media`** — File/image uploads (uses `sharp` for processing).
