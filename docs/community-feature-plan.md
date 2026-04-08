# Community / Org-Site Feature Slice — Implementation Plan

## Context

The user is building **Raagalaya**, a new website whose spec defines a community-focused, event-centered web application. The Plenor monorepo is the technical base. The goal is to add every feature the Raagalaya spec requires that Plenor doesn't already have — as an optional, env-gated "community slice" that can be enabled for any site deployed from this codebase.

**Current state of the repo (confirmed by exploration):**
- Zero `org-*` Payload collections exist; no community routes; no secondary nav component; no community env vars
- 15 existing collections (TeamMembers, BlogPosts, SitePages, etc.) + 2 globals (SiteSettings, UISettings)
- Backend submission pattern established via `guideSubmissionService.ts` / `inquirySubmissionService.ts`
- SQL migration runner at `migrations/versions/`; schema manifest at `scripts/db/schema-manifest.mjs`
- No `middleware.ts`; no rewrites in `next.config.ts`

**What the Raagalaya spec adds (not in Plenor today):**
- Events with 4 types, 3 statuses, QR payment (Zelle/Venmo), registration/payment flow
- Community Spotlight (5 categories) with listing + detail pages
- Learning & Giving Back (3 categories) with listing + detail pages
- About section (Founders, Volunteer Team, Mentors) with detail pages
- Sponsors page with embedded donation/QR payment, NOT a separate nav section
- Consistent secondary navigation component across all sections
- Org Home page with featured content selections + fallback logic
- Registration submission backend with 6-state FSM, manual admin verification
- Env gating so community routes are disabled when env var is unset

---

## Locked Rules (Must Not Drift During Implementation)

These rules resolve every ambiguity identified before implementation starts. Any deviation requires an explicit plan update before code changes.

### 1. Base-Path Routing Edge Cases

- `NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH` must be normalized: strip trailing slash, prepend `/` if missing, lowercase.
- **Blocked values:** any value that starts with `/admin`, `/api`, `/_next`, `/favicon`, `/sitemap`, `/robots` — `resolveCommunityBasePath()` returns `null` for these.
- **Reserved path collisions:** if the configured base path would shadow an existing `(frontend)` route (e.g., `/blog`, `/about`), the env var owner is responsible. The code does not auto-detect conflicts; document this in `.env.example`.
- **Rewrite rule is conditional:** only add to `next.config.ts` rewrites array when `process.env.NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH` is non-null at build time. No rewrite = no route exposure.
- **Static params:** `generateStaticParams` is not used for community routes — all pages are ISR (`revalidate = 60`) to avoid blocking builds when CMS is empty.
- **`/_next/*` assets:** rewrites do not match `/_next/:path*`; Next.js handles these before rewrite rules. No special exclusion needed.

### 2. Collection Schema Hard Rules

- **Slug:** `unique: true`, `required: true`, auto-generated from title/name, max 120 chars, lowercase + hyphen only. Admin can override but uniqueness is enforced by Payload.
- **Required fields per collection:**
  - OrgEvents: `title`, `slug`, `eventType`, `eventStatus`, `startDate`, `shortSummary`, `heroImage`
  - OrgSpotlight: `name`, `slug`, `category`, `shortSummary`, `thumbnailImage`
  - OrgAboutProfiles: `name`, `slug`, `category`, `shortBio`, `profileImage`
  - OrgLearning: `title`, `slug`, `category`, `shortSummary`
- **Draft support:** all 4 collections use `_status` + `workflowStatus` following the BlogPosts.ts pattern (draft/published toggle, versions enabled).
- **Admin UI grouping:** all 4 collections + 2 globals appear under an `Org Site` group in the Payload sidebar (`admin.group: 'Org Site'`).
- **`eventStatus` is editorial only** — see rule 3.

### 3. Event Status — Source of Truth (LOCKED)

**`eventStatus` is an editorial field set by CMS authors. It is never derived from dates.**

- Rationale: date-derived logic creates ambiguity for multi-day events, timezone variations, and early-access "current" windows. Editors control when an event becomes `current_ongoing` or `past_completed`.
- `displayWindowStart`/`displayWindowEnd` are **informational only** — they do not change `eventStatus` automatically.
- The frontend renders whichever `eventStatus` value is stored. No date comparison in query helpers or page components.

### 4. Registration FSM — Free vs Paid Branching (LOCKED)

Two distinct FSM paths based on the event's `paymentRequired` flag:

**Free event (`paymentRequired = false`):**
```
null → submitted               (public)
submitted → registration_confirmed  (admin only)
any state → cancelled_rejected      (admin)
```
- States `payment_pending`, `payment_confirmation_submitted`, `payment_confirmed` are **never entered** for free events.
- `canTransition` must enforce: if event is free, block any transition into payment states.
- Registration form for free events: no payment step, no QR shown.

**Paid event (`paymentRequired = true`) — canonical sequence:**
```
null → submitted                                    (public)
submitted → payment_pending                         (admin)
payment_pending → payment_confirmation_submitted    (public, via status-check page)
payment_confirmation_submitted → payment_confirmed  (admin)
payment_confirmed → registration_confirmed          (admin)
any state → cancelled_rejected                      (admin)
```
- `submitted → registration_confirmed` is **not allowed** for paid events.
- `payment_pending → payment_confirmed` directly (skipping public confirmation) is **not allowed** — admin must wait for public to submit confirmation.
- `submitted → payment_confirmation_submitted` by public is **not allowed** — requires admin to gate first via `payment_pending`.
- After submit, UI shows a holding message; submitter returns to `/{basePath}/events/{slug}/register?id={publicId}` to check status and complete step 2 when `payment_pending`.

**Resubmission policy:** After `cancelled_rejected`, no new submission for the same `(event_id, email)` is allowed from the public API. Admin may override by directly inserting a new row. The public API returns `409 ALREADY_EXISTS` for duplicate `(event_id, email)`.

**`canTransition` signature:** `canTransition(role, from, to, eventIsPaid: boolean): boolean`

### 5. Event Capacity / Open-Close Rules (LOCKED)

OrgEvents collection gains these optional fields:
- `maxRegistrations`: number (optional, null = unlimited)
- `registrationOpensAt`: TIMESTAMPTZ (optional)
- `registrationClosesAt`: TIMESTAMPTZ (optional)

**Backend enforcement (not CMS-only):**
- If `maxRegistrations` is set: `registrationSubmissionService` counts rows with `event_id = X` and `status NOT IN ('cancelled_rejected')` before persisting. If count ≥ max → return `409 REGISTRATION_FULL`.
- If `registrationOpensAt` is set and `now() < registrationOpensAt` → return `422 REGISTRATION_NOT_OPEN`.
- If `registrationClosesAt` is set and `now() > registrationClosesAt` → return `422 REGISTRATION_CLOSED`.

These checks happen **after rate limit + origin verify, before persist**. Add to schema manifest: `max_registrations`, `registration_opens_at`, `registration_closes_at`.

### 6. Sponsors Content Validation (LOCKED)

- `supportContactPath`: accepts email (`mailto:...`) or URL (`https://...`) only. Payload field validation rejects bare strings without protocol/`mailto:`.
- QR codes (`zelleQrCode`, `venmoQrCode`): static image uploads only (Media relationship). No dynamic QR generation. Alt text is required on upload.
- An anti-fraud disclaimer Lexical block is required in `paymentInstructionsContent` — Payload field validation (custom `validate`) checks that the field is non-empty before publish.
- No external payment processor integration — manual verification only.

### 7. Secondary Nav Active-State Algorithm (LOCKED)

`OrgSecondaryNav` receives `activeHref: string` from the parent page server component (set to `usePathname()` in a client wrapper or passed from the layout).

- Active match uses **prefix matching**: an item is active if `activeHref.startsWith(item.href)` AND `item.href !== basePath` (to avoid the home item always being active).
- Exception: exact match for the community home (`/community` or resolved base).
- On detail pages (`/community/spotlight/student/some-slug`), the parent category tab (`/community/spotlight/student`) is active.
- Keyboard navigation: `role="tablist"`, each item `role="tab"`, `aria-selected`, arrow key navigation within the row.
- Focus management: `tabIndex={0}` on active item, `tabIndex={-1}` on others.

### 8. Home Section Fallback Rules (LOCKED)

For each section in `getOrgHomeFeatures()`:

| Section | Primary source | Fallback | Empty behavior |
|---|---|---|---|
| Events | `featuredEvents` (max 3, published only) | Top 3 `upcoming_planned` by `startDate asc` | Use `eventsPlaceholder` text if non-empty; otherwise hide section entirely |
| Spotlight | `featuredSpotlight` (max 3, published only) | Top 3 spotlight entries by `displayOrder asc` | Use `spotlightPlaceholder` text; otherwise hide section |
| Learning | `featuredLearning` (max 3, published only) | Top 3 learning entries by `displayOrder asc` | Use `learningPlaceholder` text; otherwise hide section |
| Sponsors | Always show if global `org-sponsors` exists and `pageTitle` is set | N/A | Hide section if global not configured |

**Unpublished item handling:** `featuredEvents`/`featuredSpotlight`/`featuredLearning` relationships may reference draft items. Filter out any item where `_status !== 'published'` before rendering. Do not expose drafts on public pages.

**De-duplication:** if fallback pulls an item already in the curated list (e.g., the same event), show it only once.

### 9. Shared Enum Constants (LOCKED)

Single source of truth: `src/domain/org-site/constants.ts`

```ts
export const EVENT_TYPES = ['concert', 'competition', 'festival', 'workshop'] as const;
export const EVENT_STATUSES = ['upcoming_planned', 'current_ongoing', 'past_completed'] as const;
export const SPOTLIGHT_CATEGORIES = ['student', 'teacher', 'volunteer', 'local_organization', 'local_prominent_artist'] as const;
export const ABOUT_CATEGORIES = ['founder', 'volunteer_team', 'mentor'] as const;
export const LEARNING_CATEGORIES = ['knowledge_sharing', 'college_prep', 'mentorship'] as const;
export const REGISTRATION_STATUSES = ['submitted', 'payment_pending', 'payment_confirmation_submitted', 'payment_confirmed', 'registration_confirmed', 'cancelled_rejected'] as const;
```

- Payload collection enum options **import from this file** (use `.map(v => ({ label: v, value: v }))`).
- Route param validation (e.g., `[category]` pages) validates against these arrays → `notFound()` if not a member.
- DB CHECK constraints in SQL mirror these values exactly.
- No inline string literals for these values anywhere in the codebase.

### 10. Admin Auth Model (LOCKED)

- All admin registration backend routes use the existing `x-api-key` mechanism with `role = 'admin'`.
- **Route auth requirements (6 routes total):**
  - `POST /v1/forms/registration` — no auth (public, rate limited by IP)
  - `GET /v1/forms/registration/{publicId}` — no auth (public, rate limited by IP) — returns `{ status, userFacingReason }` only, no PII
  - `POST /v1/forms/registration/{publicId}/payment-confirmation` — no auth (public, rate limited by IP)
  - `GET /v1/admin/registration-submissions` — `admin` role required
  - `GET /v1/admin/registration-submissions/{publicId}` — `admin` role required
  - `PATCH /v1/admin/registration-submissions/{publicId}` — `admin` role required
- **Audit trail:** every `PATCH` that changes status writes a row to `audit_logs` (existing table): `{ action: 'registration_status_update', actor_key_id: string, target_id: publicId, old_status, new_status, reason }`. The status update row write and audit log row write are in the **same Postgres transaction** — if the audit log write fails, the entire PATCH fails with `500`. Accountability must not be lost on partial failure.
- **Read access scope:** admin can list/read all submissions regardless of event. No per-event scoping at MVP.
- **No Payload CMS role for registration management** — all via backend API key, not Payload admin panel.

### 11. PII Retention Policy (LOCKED)

- `registration_payload` JSONB stores: name, email, participant count, instrument, age group, contact preferences. No payment card data (Zelle/Venmo are manual).
- `payment_confirmation_payload` JSONB stores: payer name, payment method, self-reported amount, payment date, optional reference note.
- **Log redaction:** service layer logs email domain only (`user@example.com` → `example.com`), name logged as length (`"name[8]"`). Never log full PII.
- **Retention period:** no automated purge at MVP. Document in `.env.example` that a scheduled job should be added before production for GDPR/COPPA compliance. Add a `TODO(retention)` comment in the repository.
- **Export/delete:** no self-serve export/delete at MVP. Admin can query DB directly. Document the SQL query in `docs/` for operator reference.
- **Storage minimization:** do not store fields not listed above. Validator rejects unknown keys in registration body.

### 12. Idempotency Strategy (LOCKED)

- **`POST /v1/forms/registration`:** Idempotent via `(event_id, email)` uniqueness check (returns `409 ALREADY_EXISTS` on duplicate, not `200`). Client supplies no `Idempotency-Key` for registration — duplicate detection is content-based. **Note:** `email` is inside `registration_payload` JSONB, not a top-level column, so this uniqueness check is **application-level only** (query + check in service layer before persist). There is no DB-level UNIQUE constraint for `(event_id, email)`. A race condition window exists but is acceptable at MVP volume; document for future improvement.
- **One submission per email per event is intentional.** Group registrations (one parent, multiple participants) must be submitted as a single registration with a `participantCount` field in `registration_payload`. Attempting to submit two separate registrations from the same email for the same event returns `409`. Document this rule clearly in `registrationInstructions` CMS field guidance.
- **`POST /v1/forms/registration/{publicId}/payment-confirmation`:** Idempotent via `publicId`. If `payment_confirmation_payload` already set and status is already `payment_confirmation_submitted` or beyond, return `200` with current state (replay-safe).
- **`PATCH /v1/admin/registration-submissions/{publicId}`:** Idempotent via `Idempotency-Key` header (same key = same response). Replay window: 24 hours (matches existing backend idempotency key TTL).
- **Key supply for PATCH:** Admin callers must supply `Idempotency-Key`. Missing key → `400 MISSING_IDEMPOTENCY_KEY`.

### 13. Outbox Payload Schema (LOCKED)

New outbox events follow existing `OutboundEventV1<T>` shape. Payload type definitions:

```ts
type RegistrationCreatedPayload = {
  publicId: string;
  eventId: string;
  eventTitle: string;
  submittedAt: string; // ISO8601
  isPaid: boolean;
};

type PaymentConfirmationPayload = {
  publicId: string;
  eventId: string;
  confirmedAt: string; // ISO8601
};
```

- **Deduplication key** (for webhook/email providers): `${eventType}:${publicId}` — prevents duplicate notifications on outbox retry.
- **Retry policy:** inherit existing backend retry — 3 attempts, exponential backoff (1s, 4s, 16s), then dead-letter state.
- **Transaction boundary:** persist registration row and enqueue outbox job in the **same Postgres transaction**. If outbox enqueue fails, the persist rolls back. This ensures no orphaned registrations without notifications.

### 14. SEO / Sitemap / Structured Data (LOCKED)

- **Sitemap:** community routes are included in `/sitemap.xml` only when `NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH` is set. Use `generateSitemaps()` in community layout or a dedicated `src/app/(community)/community/sitemap.ts`.
- **robots.txt:** when community routes are disabled (env unset), the 404 response is enough — no explicit `Disallow` needed (no physical route is exposed).
- **schema.org Event:** each event detail page (`/community/events/[slug]`) outputs `<script type="application/ld+json">` with `@type: "Event"`, `name`, `startDate`, `location` (if set), `url`. Use values from CMS fields.
- **Internal linking:** event cards on the home/listing pages link to the canonical detail URL using the resolved base path. No hardcoded `/community/...` hrefs — always use `resolveCommunityBasePath()`.
- **OG images:** use existing `generateMetadata` pattern; set `openGraph.images` from `heroImage`/`thumbnailImage`/`profileImage` CMS fields where available.

### 15. Accessibility Acceptance Criteria (LOCKED)

These are pass/fail criteria, not aspirational:

- **Keyboard navigation:** all interactive elements (nav tabs, registration form, payment confirmation form, cards) reachable and operable via keyboard alone.
- **`OrgSecondaryNav`:** `role="tablist"` on container, `role="tab"` + `aria-selected` on items, arrow-key navigation (left/right), focus trap within tab row.
- **`aria-live`:** registration form step transitions announce step changes via `role="status"` or `aria-live="polite"` region. Error messages use `role="alert"`.
- **QR code text alternative:** every QR code image has a descriptive `alt` attribute set in Payload Media upload (`alt` field required = true for QR uploads). Payment destination text (Zelle/Venmo handle) is also present as visible text — never conveyed only via image.
- **Focus management:** after form submission, focus moves to the success/status message container.
- **Color contrast:** new components must meet WCAG AA (4.5:1 text, 3:1 large text). No new low-contrast choices.
- **Landmark regions:** community pages use `<main>`, `<nav aria-label="Community sections">`, `<nav aria-label="Event status">` appropriately.

### 16. Observability (LOCKED)

- **Correlation ID:** registration routes propagate `x-request-id` header (existing backend middleware) through all log entries for the request lifecycle.
- **Structured log fields** added by registration service: `{ event: 'registration.created'|'payment_confirmation.received'|'status.updated', publicId, eventId, status, emailDomain, nameLength, requestId }`.
- **Submission state metrics:** no new metrics infrastructure at MVP. `GET /v1/admin/registration-submissions` response includes `meta.total` and `meta.byStatus` (count per status) for operator visibility.
- **Alerting:** document in `docs/` that operators should set up a Supabase alert on `registration_submissions` rows stuck in `payment_pending` > 72 hours.
- **Backend-down degraded mode:** community frontend pages (CMS read) are unaffected by backend downtime (CMS reads go through Payload, not the Fastify backend). Registration form submission returns a clear `503` if backend is unreachable — no silent failure.

### 17. Additional Tests (LOCKED)

Beyond the 3 unit + 1 integration + 1 e2e already listed, add:

**Unit tests:**
- `tests/unit/org-site/categoryRouteValidation.test.ts` — `notFound()` for invalid category params
- `tests/unit/org-site/homePageFallback.test.ts` — all 4 home sections, published filter, de-duplication
- `tests/unit/org-site/communityBasePath.test.ts` — normalization, reserved paths, null cases (already listed, confirm scope includes all blocked values)
- `tests/unit/org-site/freeEventFSM.test.ts` — free event path never enters payment states
- `tests/unit/org-site/capacityEnforcement.test.ts` — full, not-open, closed scenarios

**Integration tests:**
- `tests/integration/org-site/registrationRoutes.test.ts` — expand to cover: free event → direct `registration_confirmed` path, capacity full `409`, duplicate `(event_id, email)` `409`, payment confirmation replay-safe `200`
- `tests/integration/org-site/adminRegistrationRoutes.test.ts` — auth 401 without key, 403 wrong role, audit log written on PATCH, idempotency key replay

**E2E:**
- `tests/e2e/org-site/registrationSmoke.test.ts` — paid event full flow (already listed)
- `tests/e2e/org-site/freeRegistrationSmoke.test.ts` — free event: submit → admin confirm, no payment states visited

**Total new test files: 10** (5 unit + 3 integration + 2 e2e).

### 18. Migration Sequencing — One Consolidated Run (LOCKED)

**Do not generate migrations incrementally per collection.** Instead:

1. Create all 4 collection files + 2 global files.
2. Register all 6 in `payload.config.ts` in dependency order: OrgEvents → OrgSpotlight → OrgAboutProfiles → OrgLearning → OrgSponsors → OrgHomeFeatures.
3. Update `scripts/db/schema-manifest.mjs` with ALL new tables at once.
4. Run `npm run generate:migration` once → produces a single migration file covering all new tables and relationships.
5. Run `npm run db:migrate:payload` → apply.
6. Run `npm run db:migrate:payload:status` → confirm clean.
7. Create `registration_submissions` SQL migration files.
8. Run `npm run db:migrate:backend`.
9. Confirm both systems clean before any commit.

**Rationale:** Incremental per-collection migrations create multiple migration files that must be applied in order, increasing CI complexity. One consolidated Payload migration is cleaner.

**Exception:** if any individual collection's migration fails, split into individual collection migrations for debugging, then consolidate before committing.

### 19. Content Governance Per Collection (LOCKED)

- **Who can publish:**
  - All 4 collections: Payload `admin` and `editor` roles can publish. `contributor` role can create/edit drafts but cannot publish (set `access.update._status` to require `admin | editor`).
  - OrgSponsors global: `admin` only can update (no editor access to payment QR fields).
  - OrgHomeFeatures global: `admin` and `editor`.
- **Draft preview policy:** community pages support Payload draft mode via existing `getCmsReadOptions()` pattern. Draft mode is activated by the existing `/api/draft-mode/enable` route (which sets the Next.js draft cookie). When `draftMode().isEnabled` is true, `getCmsReadOptions()` returns `{ draft: true, overrideAccess: true }` which bypasses published-only filtering. Env gating still applies during preview — `resolveCommunityBasePath()` must return non-null for any community page to render, even in draft mode.
- **Workflow status:** all 4 collections use the existing `workflowStatus` hook (matching BlogPosts pattern). Values: `draft → in_review → approved → published`.
- **Sponsor approval:** OrgSponsors requires admin-only field updates because QR codes represent financial destinations. Document this access restriction in admin UI help text.

### 20. Frontend Rendering Rules (LOCKED)

- **Lexical renderer:** reuse the existing Lexical-to-JSX renderer already used by BlogPosts/SitePages detail pages. Do not write a new rich text renderer.
- **Image aspect ratios:**
  - Event `heroImage`: 16:9 (1200×675 recommended). Constrained via CSS `aspect-ratio: 16/9`.
  - Spotlight/About `thumbnailImage`/`profileImage`: 1:1 (400×400). CSS `aspect-ratio: 1`.
  - Learning `thumbnail`: 4:3 (800×600). CSS `aspect-ratio: 4/3`.
- **Fallback images:** if a required image field has no value (shouldn't happen given required=true, but defense-in-depth): render a styled placeholder div, not a broken `<img>` tag.
- **Date/timezone display:**
  - Display all event dates using the event's `eventTimezone` field if set; else display as UTC with a "(UTC)" label.
  - Use `Intl.DateTimeFormat` with the event timezone. Do not use `moment.js` or `date-fns` unless already in the project's dependencies.
  - Date format: `MMMM D, YYYY` (e.g., "April 7, 2026"). Time format: `h:mm a tz` (e.g., "7:00 PM ET").
- **Past event list cap:** 12 most recent `past_completed` events on the events listing page. Implement via `limit: 12, sort: '-startDate'` in the CMS query for that bucket.

---

## Phase 0 — Env Gating + Routing Infrastructure

**Files to create/modify:**
- `.env.example` — add `NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH=/community`
- `src/lib/community-site-config.ts` (new) — `resolveCommunityBasePath()` helper: normalize, reject reserved paths (`/admin`, `/api`), return `null` if falsy
- `next.config.ts` — add rewrite rule: `{COMMUNITY_BASE_PATH}/:path* → /community/:path*` (Option A from blueprint; keeps file structure stable under `app/(community)/community/`)
- `src/app/(community)/community/layout.tsx` (new) — calls `resolveCommunityBasePath()`, returns `notFound()` if null; provides community layout shell (separate from marketing `(frontend)` layout)

**Key decision (locked):** Use Option A rewrites. The physical folder is always `app/(community)/community/...`; the public URL prefix comes from env.

---

## Phase 1 — Payload CMS Collections + Globals

### New Collections (in `src/payload/collections/`)

All collections follow existing patterns: `workflowStatus`, `_status`/draft support, conditional read access (published or authenticated), `createdBy`, audit hooks.

**1. `OrgEvents.ts`** (slug: `org-events`)
- `title`, `slug` (auto)
- `eventType`: enum — `concert | competition | festival | workshop`
- `eventStatus`: enum — `upcoming_planned | current_ongoing | past_completed`
- `startDate`, `endDate` (optional), `startTime`/`endTime` (optional)
- `eventTimezone` (optional text, default UTC)
- `shortSummary`, `description` (Lexical rich text)
- `heroImage` → Media relationship
- `venue` / `location` (optional text)
- `isFeatured` boolean, `displayPriority` number
- `registrationRequired` boolean, `paymentRequired` boolean
- **Collection-level validation:** `paymentRequired = true` requires `registrationRequired = true`. Payload `validate` hook on `paymentRequired` rejects save if `paymentRequired && !registrationRequired`, with message: "Payment cannot be required if registration is not required."
- Conditional: `registrationInstructions` (Lexical, when registrationRequired)
- Conditional: `paymentReferenceFormat` (text — what note/reference format user must include)
- Conditional: `zelleQrCode` → Media, `venmoQrCode` → Media, `paymentInstructions` (Lexical)
- Conditional: `displayWindowStart`/`displayWindowEnd` TIMESTAMPTZ (when status = current_ongoing)
- Capacity: `maxRegistrations` (number, optional — null = unlimited), `registrationOpensAt` (TIMESTAMPTZ, optional), `registrationClosesAt` (TIMESTAMPTZ, optional)
- Optional: `relatedSpotlight` (hasMany → org-spotlight), `relatedLearning` (hasMany → org-learning), `mediaGallery` (array of Media relationships), `externalLinks` (array of url+label)
- Festival: `relatedEvents` (hasMany → org-events, visible when eventType = festival)

**2. `OrgSpotlight.ts`** (slug: `org-spotlight`)
- `name`, `slug` (auto)
- `category`: enum — `student | teacher | volunteer | local_organization | local_prominent_artist`
- `thumbnailImage` → Media, `shortSummary` (textarea), `detailContent` (Lexical)
- `role`/`title` (optional), `affiliation` (optional)
- `additionalImages` (array → Media), `externalLink` (optional)
- `isFeatured` boolean, `displayOrder` number
- `relatedEvents` (hasMany → org-events, optional)

**3. `OrgAboutProfiles.ts`** (slug: `org-about-profiles`)
- `name`, `slug` (auto)
- `category`: enum — `founder | volunteer_team | mentor`
- `profileImage` → Media, `shortBio` (textarea), `detailContent` (Lexical)
- `role`/`title` (optional), `affiliation` (optional)
- `additionalImages` (array → Media), `externalLink` (optional)
- `displayOrder` number

**4. `OrgLearning.ts`** (slug: `org-learning`)
- `title`, `slug` (auto)
- `category`: enum — `knowledge_sharing | college_prep | mentorship`
- `shortSummary` (textarea), `detailContent` (Lexical)
- `thumbnail` → Media (optional)
- `author` (optional text), `relatedEvent` → org-events (optional), `relatedSpotlight` → org-spotlight (optional)
- `externalReferenceLink` (optional), `isFeatured` boolean, `displayOrder` number

### New Globals (in `src/payload/globals/`)

**5. `OrgSponsors.ts`** (slug: `org-sponsors`)
- `pageTitle`, `supportSummary` (Lexical), `sponsorAcknowledgmentContent` (Lexical)
- `donationInstructions` (Lexical), `zelleQrCode` → Media, `venmoQrCode` → Media
- `paymentInstructionsContent` (Lexical)
- `supportContactPath` (text — link or email)
- `sponsorLogos` (array of Media + optional label), `featuredSupporterText` (optional Lexical)
- `supportFaq` (array of question+answer)
- `displayOrder` for content blocks (array of enum keys, optional)

**6. `OrgHomeFeatures.ts`** (slug: `org-home-features`)
- `featuredEvents` (hasMany → org-events, max 3)
- `featuredSpotlight` (hasMany → org-spotlight, max 3)
- `featuredLearning` (hasMany → org-learning, max 3)
- Per-section empty-state placeholder text: `eventsPlaceholder`, `spotlightPlaceholder`, `learningPlaceholder`
- `homeSectionOrder` (array of enum: `events | spotlight | learning | sponsors`, optional reorder)

### Database Migration Strategy (Phase 1)

Two separate migration systems own different tables. Both must be updated in sequence.

#### System A — Payload-managed tables (`migrations/payload/`)

**One consolidated migration only** — see Locked Rule 18. Do not generate per-collection migrations.

Payload auto-generates migrations when you change collections. Register all 6 (4 collections + 2 globals) first, then generate once. Expected new tables — **names are estimates**; inspect actual generated migration file and update schema-manifest.mjs to exact emitted names before committing:

| Payload collection | Likely main table | Likely relationship / block tables (verify against generated migration) |
|---|---|---|
| `org-events` | `org_events` | `org_events_rels`, `org_events_media_gallery`, `org_events_external_links` |
| `org-spotlight` | `org_spotlight` | `org_spotlight_rels`, `org_spotlight_additional_images` |
| `org-about-profiles` | `org_about_profiles` | `org_about_profiles_rels`, `org_about_profiles_additional_images` |
| `org-learning` | `org_learning` | `org_learning_rels` |
| `org-sponsors` (global) | `org_sponsors` | `org_sponsors_sponsor_logos`, `org_sponsors_support_faq` |
| `org-home-features` (global) | `org_home_features` | `org_home_features_rels`, `org_home_features_home_section_order` |

**Migration workflow (consolidated — do once after all 6 files are written):**

```bash
# 1. Write all 4 collection files + 2 global files
# 2. Register all 6 in payload.config.ts (dependency order: OrgEvents → OrgSpotlight → OrgAboutProfiles → OrgLearning → OrgSponsors → OrgHomeFeatures)
npm run generate:migration        # single migration file for all new tables
# 3. Inspect the generated migration file — note exact table names
# 4. Update scripts/db/schema-manifest.mjs with exact emitted table names
npm run db:migrate:payload        # apply
npm run db:migrate:payload:status # confirm clean
```

**Schema manifest rule:** Update `scripts/db/schema-manifest.mjs` with exact table names from the generated migration **before any push**. The pre-push hook blocks on drift.

#### System B — Custom SQL runner (`migrations/versions/`)

Used for `registration_submissions` (not Payload-managed). Get the next migration number from the last file in `migrations/versions/`:

```
NNNN_registration_submissions.up.sql
NNNN_registration_submissions.down.sql
```

**`.up.sql` content:**
```sql
CREATE TABLE IF NOT EXISTS registration_submissions (
  id              BIGSERIAL PRIMARY KEY,
  public_id       UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  event_id        TEXT,
  status          TEXT NOT NULL CHECK (status IN (
    'submitted', 'payment_pending', 'payment_confirmation_submitted',
    'payment_confirmed', 'registration_confirmed', 'cancelled_rejected'
  )),
  registration_payload          JSONB NOT NULL,
  payment_confirmation_payload  JSONB,
  internal_reason               TEXT,
  user_facing_reason            TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON registration_submissions (status, submitted_at DESC);
CREATE INDEX ON registration_submissions (public_id);
CREATE INDEX ON registration_submissions (event_id);
```

**`.down.sql` content:**
```sql
DROP TABLE IF EXISTS registration_submissions;
```

After creating: `npm run db:migrate:backend` → apply; `npm run db:migrate:backend:status -- --check` → confirm clean.

Also add `registration_submissions` to `scripts/db/schema-manifest.mjs` with all columns.

#### Schema manifest additions summary

Add to `scripts/db/schema-manifest.mjs` (under appropriate table groups):

```js
// New org-site Payload tables
org_events: { id, title, slug, event_type, event_status, start_date, end_date,
  short_summary, hero_image_id, venue, is_featured, display_priority,
  registration_required, payment_required, display_window_start, display_window_end,
  max_registrations, registration_opens_at, registration_closes_at,
  workflow_status, created_by_id, created_at, updated_at },
org_events_rels: { id, parent_id, path, order, org_spotlight_id, org_learning_id, org_events_id },
org_spotlight: { id, name, slug, category, short_summary, is_featured, display_order,
  workflow_status, created_by_id, created_at, updated_at },
org_about_profiles: { id, name, slug, category, short_bio, display_order,
  workflow_status, created_by_id, created_at, updated_at },
org_learning: { id, title, slug, category, short_summary, is_featured, display_order,
  workflow_status, created_by_id, created_at, updated_at },
// Globals (single-row tables)
org_sponsors: { id, page_title, support_contact_path, created_at, updated_at },
org_home_features: { id, created_at, updated_at },
// Custom backend table
registration_submissions: { id, public_id, event_id, status,
  registration_payload, payment_confirmation_payload,
  internal_reason, user_facing_reason, submitted_at, updated_at },
```

Register all 4 collections + 2 globals in `src/payload.config.ts`.

### CMS Read Helpers

New file `src/infrastructure/cms/orgSiteQueries.ts`:
- `getOrgEventById(id, opts)` — by Payload numeric ID (used by registration admin service to check `paymentRequired` flag)
- `getOrgEventBySlug(slug, opts)` — published only
- `getOrgEventsByStatus(status, opts)` — published only, sorted by `displayPriority desc, startDate asc`; `past_completed` bucket hard-capped at 12 (`limit: 12, sort: '-startDate'`)
- `getOrgSpotlightByCategory(category, opts)` — published only, sorted by `displayOrder asc`
- `getOrgAboutByCategory(category, opts)` — published only, sorted by `displayOrder asc`
- `getOrgLearningByCategory(category, opts)` — published only, sorted by `displayOrder asc`
- `getOrgSponsorsGlobal(opts)` — returns null if global not configured or `pageTitle` unset
- `getOrgHomeFeatures(opts)` — implements full locked fallback logic per Rule 8:
  - Events: use `featuredEvents` (published only, max 3); if empty, fallback to top 3 `upcoming_planned` by `startDate asc`; if still empty, return placeholder text or null
  - Spotlight: use `featuredSpotlight` (published only, max 3); if empty, fallback to top 3 by `displayOrder asc`; if still empty, return placeholder text or null
  - Learning: use `featuredLearning` (published only, max 3); if empty, fallback to top 3 by `displayOrder asc`; if still empty, return placeholder text or null
  - Sponsors: include if `getOrgSponsorsGlobal` returns non-null
  - All relationship items: filter out `_status !== 'published'` before returning
  - De-duplicate: if fallback item already in curated list, include once only

---

## Phase 2 — Frontend Routes + Components

### OrgSecondaryNav Component

New `src/components/org-site/OrgSecondaryNav.tsx`:
- Props: `{ items: { label: string; href: string }[]; activeHref: string }`
- Desktop: horizontal tab row with underline active state
- Mobile: horizontally scrollable tab row (consistent across ALL sections — no per-section variation)
- Reused in: Events (status tabs), Spotlight, Learning, About, and wherever secondary nav is needed

### Route Group + Pages

New route group `src/app/(community)/community/` with these pages:

11 page files + 1 layout file:

| Route | File | Data |
|---|---|---|
| `/community` | `page.tsx` | Org Home with featured content |
| `/community/events` | `events/page.tsx` | Status-partitioned listings |
| `/community/events/[slug]` | `events/[slug]/page.tsx` | Event detail |
| `/community/spotlight/[category]` | `spotlight/[category]/page.tsx` | Category listing |
| `/community/spotlight/[category]/[slug]` | `spotlight/[category]/[slug]/page.tsx` | Entry detail (validate category) |
| `/community/learning/[category]` | `learning/[category]/page.tsx` | Category listing |
| `/community/learning/[category]/[slug]` | `learning/[category]/[slug]/page.tsx` | Entry detail |
| `/community/about/[category]` | `about/[category]/page.tsx` | Profile listing |
| `/community/about/[category]/[slug]` | `about/[category]/[slug]/page.tsx` | Profile detail |
| `/community/sponsors` | `sponsors/page.tsx` | Sponsors + embedded donation |
| `/community/events/[slug]/register` | `events/[slug]/register/page.tsx` | Registration flow + status-check view (`?id={publicId}`) |

**Layout (`src/app/(community)/community/layout.tsx`):**
- Gate check via `resolveCommunityBasePath()` → `notFound()` if null
- Renders community-specific Navbar variant (reuse existing `Navbar` with different `navigationLinks` passed from layout, OR separate `OrgNavbar` — choose reuse to avoid duplicate header CSS)
- Primary nav items: Home, Events, Community Spotlight, Learning and Giving Back, About, Sponsors (hrefs prefixed with resolved base path)

**Events page logic (status-first):**
- Partition into 3 buckets: `upcoming_planned`, `current_ongoing`, `past_completed`
- Within each: sort by `displayPriority desc`, then `startDate asc`
- OrgSecondaryNav tabs for status switching
- Event type label visible on every card
- Past events: cap at 12 most recent

**Empty states:**
- Each Home section with no content: use `org-home-features` placeholder text or hide gracefully
- No bare empty layout blocks

**Metadata/OG:** Use `resolveSiteUrl()` from `src/lib/site-config.ts` (already exists) for canonical URLs; use CMS fields for title/description per page.

**Caching:** Match existing pattern (`export const revalidate = 60` or Next 16 cache directives).

---

## Phase 3 — Registration Backend

### SQL Migration

The `registration_submissions` table and its migration files are fully specified in the **Database Migration Strategy** section above (Phase 1, System B). Apply it here: `npm run db:migrate:backend`.

### Domain FSM

New `src/domain/org-site/registrationWorkflow.ts`:
- States imported from `src/domain/org-site/constants.ts` (`REGISTRATION_STATUSES`)
- `canTransition(role: 'public' | 'admin', from: State, to: State, eventIsPaid: boolean): boolean`

**Free event path:**
- public: `null → submitted`
- admin: `submitted → registration_confirmed`, any → `cancelled_rejected`
- Payment states (`payment_pending`, `payment_confirmation_submitted`, `payment_confirmed`) are **unreachable** for free events.

**Paid event path (LOCKED — single canonical sequence):**
```
null → submitted               (public)
submitted → payment_pending    (admin)
payment_pending → payment_confirmation_submitted  (public)
payment_confirmation_submitted → payment_confirmed  (admin)
payment_confirmed → registration_confirmed          (admin)
any → cancelled_rejected       (admin)
```

- Admin may NOT skip: `submitted → registration_confirmed` is blocked when `eventIsPaid = true`.
- Admin may NOT skip payment confirmation: `payment_pending → payment_confirmed` is **only** allowed when transitioning from `payment_confirmation_submitted`, not directly from `payment_pending` (the "when no public confirmation" shortcut from prior draft is **removed**).
- Public may NOT go from `submitted → payment_confirmation_submitted` directly — they must wait for admin to move to `payment_pending` first.

**UI implication (paid event registration flow):**
- After public submit, UI shows: "Registration received. Check back here or your email for payment instructions." Do NOT show payment QR immediately.
- After admin moves to `payment_pending`, submitter returns to the status page and sees payment QR + instructions + step 2 confirmation form.
- This means the registration page must support a status-check view (poll or re-visit by `publicId` URL).
- Add `GET /v1/forms/registration/{publicId}` (public, no auth) to support status polling. Returns `{ status, userFacingReason }` only — no PII.

New `src/domain/org-site/registrationValidator.ts`:
- Validates registration body (name, email, participant info, event ID)
- Validates payment confirmation body (payer name, payment method, amount, date, optional reference)
- Uses existing `isValidEmail()`, `sanitizeText()` from domain common

### Application Services

`src/application/org-site/registrationSubmissionService.ts`:
- Pattern: rate limit → origin verify → validate → duplicate check (`findSubmissionByEventAndEmail`) → capacity check (Rule 5: `maxRegistrations`, `registrationOpensAt`, `registrationClosesAt`) → persist + enqueue outbox (same transaction, Rule 13)
- Reuses `checkRateLimit`, `verifyRequestOrigin`, `enqueueIntegrationJobs`, `processOutboxTick` from existing infra
- PII redaction in logs (email domain only, name length)
- Capacity check queries event's CMS fields via `getOrgEventById` (fetches `maxRegistrations`, `registrationOpensAt`, `registrationClosesAt`) and counts non-cancelled registrations before persisting

`src/application/org-site/registrationAdminService.ts`:
- `listRegistrationSubmissions(filters, pagination)`
- `getRegistrationSubmission(publicId)`
- `updateRegistrationStatus(publicId, { status, internalReason, userFacingReason }, role)`:
  - Fetches submission row to get current `status` and `event_id`
  - Fetches event via `getOrgEventBySlug` (or by ID) to determine `paymentRequired` flag
  - Calls `canTransition(role, currentStatus, newStatus, event.paymentRequired)` — returns 403 if disallowed
  - Persists status + audit log in same transaction (Rule 10)

### Persistence

Extend `src/infrastructure/persistence/backendStore.ts` OR create parallel `src/infrastructure/persistence/registrationSubmissionRepository.ts`:
- `persistRegistrationSubmission(data)` → returns `{ id, public_id, submitted_at }`
- `persistPaymentConfirmation(publicId, payload)` → updates row
- `updateSubmissionStatus(publicId, status, reason?)` → updates row
- `listSubmissions(filters)`, `getSubmissionByPublicId(publicId)` — full row for admin use
- `getSubmissionStatusByPublicId(publicId)` → returns `{ status, userFacingReason }` only (public-safe, used by status-check endpoint — never returns PII fields)
- `findSubmissionByEventAndEmail(eventId, email)` → queries `registration_payload->>'email'` for application-level duplicate check
- Follows hybrid Supabase/in-memory pattern from `backendStore.ts`

### Contracts + OpenAPI

`packages/contracts/src/forms.ts`:
- `RegistrationSubmissionRequest` (required: `eventId`, `name`, `email`; optional: `participantCount` for group registrations, `instrument`, `ageGroup`, `contactPreferences`)
- `RegistrationStatusResponse` (public: `{ publicId, status, userFacingReason }` — no PII)
- `PaymentConfirmationRequest`, `AdminStatusUpdateRequest`
- `RegistrationSubmissionResponse` (includes `publicId`, `status`, `userFacingReason`)

`apps/backend/openapi/openapi.yaml` — add paths:
- `POST /v1/forms/registration`
- `GET /v1/forms/registration/{publicId}` — public status check (returns `{ status, userFacingReason }` only, no PII)
- `POST /v1/forms/registration/{publicId}/payment-confirmation`
- `GET /v1/admin/registration-submissions`
- `GET /v1/admin/registration-submissions/{publicId}`
- `PATCH /v1/admin/registration-submissions/{publicId}`

Run `npm run openapi:generate` after changes.

### Backend Routes

`apps/backend/src/server.ts` — add 6 new routes following existing fastify.inject pattern with rate limiting, CORS, idempotency on POSTs.

### Next API Proxies

`src/app/api/forms/registration/route.ts` — proxy POST to backend
`src/app/api/forms/registration/[publicId]/route.ts` — proxy GET (status check, public)
`src/app/api/forms/registration/[publicId]/payment-confirmation/route.ts`
`src/app/api/admin/registration-submissions/route.ts`
`src/app/api/admin/registration-submissions/[publicId]/route.ts`

### Registration UI

`src/app/(community)/community/events/[slug]/register/page.tsx` — client component with two modes:

**Mode A: Initial registration submission**
- Registration form fields (name, email, participant count, etc.)
- Free event: submit → show "Registration received" success message with publicId URL for status checking
- Paid event: submit → show "Registration received. Check back here or your email for payment instructions." holding message with publicId URL bookmark prompt
- Do NOT show payment QR immediately after submit for paid events — admin must first move status to `payment_pending`

**Mode B: Status-check / payment confirmation (accessed via `?id={publicId}`)**
- On load: `GET /v1/forms/registration/{publicId}` to fetch current status
- `submitted` → "Your registration has been received. We'll notify you with next steps."
- `payment_pending` → show event's payment QR codes, payment instructions, reference format, and payment confirmation form (payer name, method, amount, date, reference note). Submit → `POST /v1/forms/registration/{publicId}/payment-confirmation`
- `payment_confirmation_submitted` → "Payment confirmation received. Pending admin verification."
- `payment_confirmed` → "Payment verified. Awaiting final registration confirmation."
- `registration_confirmed` → "You're confirmed! See you at the event."
- `cancelled_rejected` → show `userFacingReason` if set, else "Registration cancelled."

**Shared UI rules:**
- Disable submit while request pending; no retry confusion
- Focus moves to status/success message container after submission (Rule 15)
- Error messages use `role="alert"`; step transitions use `aria-live="polite"` (Rule 15)

---

## Phase 4 — Outbox Events + Hardening

### Outbox Event Types

`src/infrastructure/integrations/outboundEvents.ts`:
- Add `'submission.registration.created'`, `'submission.registration.payment_confirmation.submitted'`
- Add `'email.registration'` outbox provider
- Route to: `['email.registration', 'webhook']`

### Status Messaging

Ensure each outbox event includes `publicId` and human-readable status for notification email templates.

### Admin UX (minimal)

Optional: Add a minimal diagnostics page at `src/app/(diagnostics)/registration-submissions/page.tsx` for admin to view/update statuses without Postman. Admin API key required. Not required for MVP but unblocks non-technical admins.

---

## Phase 5 — Tests + Full Gate

### Unit Tests

`tests/unit/org-site/registrationWorkflow.test.ts` — all FSM transition permutations
`tests/unit/org-site/eventSortBuckets.test.ts` — status-first partition + sort order
`tests/unit/org-site/communityBasePath.test.ts` — normalization edge cases

### Integration Tests

`tests/integration/org-site/registrationRoutes.test.ts` — happy path, 400, 401/403, idempotency replay, duplicate submission

### E2E

`tests/e2e/org-site/registrationSmoke.test.ts` — typed client: create → payment confirmation → admin patch to `registration_confirmed`

### Full Gate (ordered)

```bash
npm run lint
npm run lint:architecture
npm run check:type
npm run db:migrate:backend
npm run db:migrate:backend:status -- --check
npm run db:migrate:payload
npm run db:migrate:payload:status
npm run backend:lint
npm run backend:typecheck
npm run openapi:check
npm run test:ci
npm run build
```

---

## Critical Files to Create/Modify

| File | Action |
|---|---|
| `src/lib/community-site-config.ts` | Create |
| `.env.example` | Modify (add community env var) |
| `next.config.ts` | Modify (add rewrite rule) |
| `src/payload/collections/OrgEvents.ts` | Create |
| `src/payload/collections/OrgSpotlight.ts` | Create |
| `src/payload/collections/OrgAboutProfiles.ts` | Create |
| `src/payload/collections/OrgLearning.ts` | Create |
| `src/payload/globals/OrgSponsors.ts` | Create |
| `src/payload/globals/OrgHomeFeatures.ts` | Create |
| `src/payload.config.ts` | Modify (register new collections/globals) |
| `scripts/db/schema-manifest.mjs` | Modify (add new tables) |
| `src/infrastructure/cms/orgSiteQueries.ts` | Create |
| `src/components/org-site/OrgSecondaryNav.tsx` | Create |
| `src/app/(community)/community/layout.tsx` | Create |
| `src/app/(community)/community/...` (all pages) | Create (11 page files + 1 layout file) |
| `src/domain/org-site/constants.ts` | Create (shared enums/status arrays) |
| `src/domain/org-site/registrationWorkflow.ts` | Create |
| `src/domain/org-site/registrationValidator.ts` | Create |
| `src/application/org-site/registrationSubmissionService.ts` | Create |
| `src/application/org-site/registrationAdminService.ts` | Create |
| `src/infrastructure/persistence/registrationSubmissionRepository.ts` | Create |
| `migrations/versions/NNNN_registration_submissions.up.sql` | Create |
| `migrations/versions/NNNN_registration_submissions.down.sql` | Create |
| `packages/contracts/src/forms.ts` | Modify |
| `apps/backend/openapi/openapi.yaml` | Modify |
| `apps/backend/src/server.ts` | Modify |
| `src/app/api/forms/registration/...` | Create (3 proxy routes: POST, GET status, POST payment-confirmation) |
| `src/app/api/admin/registration-submissions/...` | Create (2 proxy routes) |

## Existing Utilities to Reuse

| Utility | File |
|---|---|
| `resolveSiteUrl`, `resolveSiteName` | `src/lib/site-config.ts` |
| `getCmsReadOptions` | `src/lib/cms-read-options.ts` |
| `checkRateLimit` | `src/infrastructure/security/rateLimiter.ts` |
| `verifyRequestOrigin` | `src/infrastructure/security/originVerifier.ts` |
| `enqueueIntegrationJobs`, `processOutboxTick` | `src/infrastructure/integrations/outboxService.ts` |
| `toBackendErrorResponse` | `apps/backend/src/adapters/errorEnvelope.ts` |
| `isValidEmail`, `sanitizeText` | `src/domain/common/` |
| `ServiceResult` type | `src/application/` |
| `proxyRequestToBackend` | `src/infrastructure/http/backendProxy.ts` |

## Verification

1. Set `NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH=/community` → community routes render; unset → 404
2. Set base path to `/admin` → `resolveCommunityBasePath()` returns null → community routes 404
3. Create an org-event in Payload CMS → appears on `/community/events` under correct status bucket (editor-set `eventStatus`, not date-derived)
4. Submit registration for **free** event → `status = submitted`; admin PATCH → `registration_confirmed` directly (no payment states visited)
5. Submit registration for **paid** event → `status = submitted`; admin PATCH → `payment_pending`; public GET status shows payment QR; public POST payment confirmation → `payment_confirmation_submitted`; admin PATCH → `payment_confirmed`; admin PATCH → `registration_confirmed`
6. Admin PATCH `submitted → registration_confirmed` on a **paid** event → `403 TRANSITION_FORBIDDEN`
7. Submit second registration with same `(event_id, email)` → `409 ALREADY_EXISTS`
8. Create event with `maxRegistrations = 1` → first submit succeeds; second submit → `409 REGISTRATION_FULL`
9. Invalid category param (e.g., `/community/spotlight/invalid`) → 404
10. All `tests/unit/org-site/`, `tests/integration/org-site/`, `tests/e2e/org-site/` pass
11. `npm run test:ci` passes; `npm run build` succeeds; `npm run lint:architecture` passes
