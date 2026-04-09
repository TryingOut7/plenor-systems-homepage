# CMS Playbook

This is the operational handbook for the current Payload CMS setup in this repository.

It covers:
- login and first-user setup
- user creation and role permissions
- workflow and publishing
- editing `site-pages`
- all available section blocks and how each one behaves
- global settings, media, redirects, forms, and troubleshooting

Last updated: 2026-03-24

---

## 0) Non-Technical Quick Start (Start Here)

This section is for content editors who do not code.

If you only need to update website content, you can ignore most of the technical sections below.

### 0.1 10-Minute Setup

1. Open `http://localhost:3000/admin`.
2. Log in with your CMS account.
3. In the left menu, open `Site Pages`.
4. Click the page you want to edit (`home`, `about`, `services`, `pricing`, `contact`, or a custom page).
5. Edit text in the page sections.
6. Click `Save`.
7. Set `Workflow Status` to `published` if you want changes live.
8. Make sure `isActive = true` for the page.
9. Open the page URL in a new tab and confirm your change.

### 0.2 The 5 Most Common Tasks

#### A) Change text on Home, About, Services, Pricing, Contact
1. Go to `Site Pages`.
2. Open the page record.
3. Find the section with the text you want to change.
4. Update the text fields.
5. Save and publish.

#### B) Add or edit a custom page
1. Go to `Site Pages`.
2. Click `Create New`.
3. Set `title` and `slug`.
4. Set `presetKey = custom`.
5. Add sections under `sections`.
6. Save, publish, and verify `/<slug>`.

#### C) Update top navigation and footer links
1. Go to `Globals > Site Settings`.
2. Edit `navigationLinks` for header menu links.
3. Edit `footerColumns` for footer links.
4. Save and refresh the website.

#### D) Change form button text and privacy link
1. Go to `Globals > Site Settings`.
2. Open `guideForm` and/or `inquiryForm`.
3. Update labels like submit text, success text, and privacy link label/href.
4. Save and test the form on the site.

#### E) Update the 404 page message
1. Go to `Globals > Site Settings`.
2. Open `notFoundPage`.
3. Update:
   - `metaTitle`
   - `metaDescription`
   - `heading`
   - `body`
   - `buttonLabel`
   - `buttonHref`
4. Save and test by opening a URL that does not exist.

### 0.3 Publish Rules (Very Important)

Changes are not fully live unless:
- `Workflow Status` is `published`
- Page `isActive` is `true`

If one of these is missing, the site may still show old content.

### 0.4 Safe Editing Rules

- Edit text freely.
- Avoid deleting or reordering sections on preset pages unless you know why.
- If a change looks wrong, revert that field and save again.
- Verify desktop and mobile after publishing.

### 0.5 When To Ask A Developer

Ask for help if:
- the layout structure should change a lot (not just text)
- a block type is missing a field you need
- a page shows defaults instead of your edited text
- form submissions fail
- you need a new API, integration, or automation

---

## 1) Start The CMS Locally

1. In project root, run:

```bash
npm run dev
```

2. Open:
- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

3. If no users exist yet, open:
- `http://localhost:3000/admin/create-first-user`

---

## 2) Login And First User

1. Go to `/admin/create-first-user` (first time only).
2. Create account with email + password.
3. Set role to `admin`.
4. Login at `/admin/login`.

Current auth settings:
- Token/session expiration: 8 hours
- Max login attempts: 5
- Lock time after max attempts: 10 minutes
- API keys enabled

Staging note:
- If staging lock is enabled in `src/middleware.ts`, `/admin` is still allowed.

---

## 3) User Management

### Create a user
1. Open `Collections > Users`.
2. Click `Create New`.
3. Fill email + password.
4. Optional: add `name`.
5. Set `role` (`admin`, `editor`, `author`).
6. Save.

### Change role
1. Open user record.
2. Change `role`.
3. Save.

### Important constraints
- Only `admin` can create, update, delete users.
- Only `admin` can update role field.
- Authenticated users can read users collection (needed for workflow references like `approvedBy`).

---

## 4) Roles And Permissions Matrix

| Area | Admin | Editor | Author |
|---|---|---|---|
| Users | Full | Read only | Read only |
| Site Pages | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Reusable Sections | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Service Items | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Blog Posts | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Testimonials | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Media | Create/Update/Delete | Create/Update/Delete | Create/Update |
| Blog Categories | Full | Full | Read only |
| Redirect Rules | Full | Full | Read only |
| Team Members | Full | Create/Update | Read only |
| Logos | Full | Create/Update | Read only |
| Site Settings (global) | Update | Update | Read only |
| UI Settings (global) | Update | Update | Read only |
| Audit Logs | Read | No access | No access |

Field-level rule:
- In `site-pages`, `isActive` can only be set by `admin` or `editor`.

---

## 5) Workflow And Publishing

Workflow statuses:
- `draft`
- `in_review`
- `approved`
- `rejected`
- `published`

Transition rules:

| From | Author | Editor | Admin |
|---|---|---|---|
| draft | in_review | in_review, approved, published | in_review, approved, published |
| in_review | draft | approved, rejected, draft | approved, rejected, published, draft |
| approved | none | published, draft | published, draft |
| rejected | draft | draft, in_review | draft, in_review, approved, published |
| published | none | draft | draft, in_review |

Behavior:
- On create: if `author` sets non-draft status, hook forces it to `draft`.
- `approvedBy` and `approvedAt` are auto-stamped on `approved/published`.
- Approval fields are cleared when returning to `draft/rejected`.
- Notification email can be sent on key transitions when email env is configured.

Public visibility behavior:
- `service-items`, `blog-posts`, `testimonials`: frontend reads `workflowStatus = published`.
- `site-pages`: frontend reads `workflowStatus = published` and `isActive = true`.

---

## 6) Audit Logs

Collection: `audit-logs`

Behavior:
- auto-created on create/update/delete for most collections
- autosave changes are skipped to avoid log spam
- admin-read only
- not editable/deletable via normal access rules

What gets captured:
- action (`create`, `update`, `delete`)
- collection
- document ID/title
- user and user email
- summary string

---

## 7) Site Pages: Core Concept

Collection: `site-pages`

Main fields:
- `title`
- `slug` (unique, normalized by hook)
- `presetKey` (`custom`, `home`, `services`, `about`, `pricing`, `contact`)
- `pageMode` (`builder`, `template`) (currently mostly metadata)
- `templateKey` (`default`, `landing`, `article`, `product`)
- `sections` (blocks)
- `isActive`
- `hideNavbar`
- `hideFooter`
- `pageBackgroundColor`
- `customHeadScripts`
- workflow fields
- SEO fields

Slug normalization behavior:
- strips leading/trailing slashes
- collapses repeated slashes

---

## 8) Core Pages Vs Custom Pages (Critical)

### Core pages
Core marketing pages are currently custom-rendered routes:
- `/` (home)
- `/about`
- `/services`
- `/pricing`
- `/contact`

Special case:
- not-found UI is custom-rendered in `src/app/(frontend)/not-found.tsx`.

Current extraction model:
- Home and Contact now use centralized resolver modules:
  - `src/lib/page-content/home.ts`
  - `src/lib/page-content/contact.ts`
- Not-found metadata/content now uses:
  - `src/lib/page-content/not-found.ts`
- About, Services, and Pricing still use custom route extraction with some heading-based matching.

### Custom pages
All other slugs render through universal builder:
- `src/app/(frontend)/[...slug]/page.tsx`

This path supports full section-builder behavior from `UniversalSections.tsx`.

---

## 9) Preset Pages: What Is Locked And What Is Editable

If `presetKey` is one of:
- `home`, `services`, `about`, `pricing`, `contact`

Then `applyCorePresetSections` hook regenerates section structure from template on save.

### Text that is preserved on preset pages
- `heroSection`: `sectionLabel`, eyebrow, heading, subheading, primary CTA label/href
- `richTextSection`: `sectionLabel`, heading, content
- `ctaSection`: `sectionLabel`, heading, body, button label/href
- `guideFormSection`: `sectionLabel`, label, heading, highlightText, body
- `inquiryFormSection`: `sectionLabel`, label, heading, subtext, next steps, email/link fields
- `privacyNoteSection`: `sectionLabel`, label and policy link fields
- `simpleTableSection`: `sectionLabel`, heading, column labels, row cell values

### What generally gets reset by preset regeneration
- section ordering
- section additions/removals outside preset template
- many style-structure changes not included in text merge logic

### Heading-based dependencies to keep stable (core routes)

Home:
- No strict heading lock is required for the primary extraction path.
- Resolver is now mostly block-type + field-based, with heading fallback only when needed.

About:
- `Who we are`
- `Narrow by design. Deep by necessity.`
- `What we believe`
- `Want to work together?`

Services:
- `Testing & QA`
- `Launch & Go-to-Market`
- `Why a framework, not a one-off engagement`
- `What it covers`
- `Not sure yet?`

Pricing:
- `Everything you need to ship with confidence.`
- `No minimum team size. Any stage.`
- `Ready to talk?`
- `Not ready to talk yet?`

Contact:
- No strict heading lock is required for primary extraction.
- Resolver reads block fields directly by block type.

If you rename the listed About/Services/Pricing headings, those routes may fall back to defaults.

---

## 10) Step-By-Step: Create A New Custom Page

1. Open `Collections > Site Pages`.
2. Click `Create New`.
3. Enter `title`.
4. Enter `slug` (for example `case-studies/acme`).
5. Set `presetKey = custom`.
6. Keep `pageMode = builder`.
7. Add sections in `sections`.
8. Set sidebar controls:
- `isActive = true`
- optional `hideNavbar`
- optional `hideFooter`
- optional `pageBackgroundColor`
- optional `customHeadScripts`
9. Fill SEO fields.
10. Set workflow to `published`.
11. Save.
12. Verify at `/<slug>`.

---

## 11) Step-By-Step: Edit A Core Preset Page Safely

1. Open `site-pages` document (`home`, `about`, `services`, `pricing`, or `contact`).
2. Keep `presetKey` as current core value.
3. Edit only text-level fields listed in Section 9.
4. Avoid changing preset structural assumptions unless you also update route code.
5. Keep required heading identities stable for About/Services/Pricing (see Section 9).
6. Set workflow to `published` if needed.
7. Save and verify route output.

---

## 12) Common Section Controls (Most Blocks)

Common controls from `sectionCommonFields`:
- `theme`: `navy`, `charcoal`, `black`, `white`, `light`
- `sectionLabel` (optional eyebrow/section kicker used by custom renderers)
- `backgroundColor` (custom CSS color)
- `size`: `compact`, `regular`, `spacious`
- `anchorId`
- `customClassName`
- `isHidden`
- `visibleFrom`
- `visibleUntil`
- `headingSize`: `xs`, `sm`, `md`, `lg`, `xl`
- `textAlign`: `left`, `center`, `right`
- `headingTag`: `h1`, `h2`, `h3`, `h4`

Renderer behavior:
- custom `backgroundColor` overrides theme background
- custom background darkness is estimated and contrast theme adjusts automatically
- invalid color strings are ignored
- hidden/scheduled sections are not rendered

Note:
- `spacerSection` does not use these common controls.

---

## 13) Section Catalog (All Available Blocks)

### 13.1 `heroSection`
- Purpose: top hero with optional media background
- Required: `heading`
- Key fields: eyebrow, heading, subheading, primary/secondary CTA, background image/video, text alignment, min height
- Behavior: video takes precedence over image; overlay added automatically

### 13.2 `richTextSection`
- Purpose: long-form rich text block
- Required: none
- Key fields: heading, rich text content

### 13.3 `ctaSection`
- Purpose: centered conversion callout
- Required: none
- Key fields: heading, body, button label/href

### 13.4 `statsSection`
- Purpose: KPI/stat tile grid
- Required in items: `value`, `label`
- Key fields: heading, subheading, stats array

### 13.5 `faqSection`
- Purpose: FAQ accordion
- Required in items: `question`, `answer`
- Key fields: heading, subheading, items
- Behavior: injects FAQ JSON-LD script

### 13.6 `featureGridSection`
- Purpose: feature cards
- Required in features: `title`, `description`
- Key fields: heading, subheading, columns (2/3/4), icon/link per feature

### 13.7 `formSection`
- Purpose: render Payload Form Builder form
- Required: `form` relationship to `forms`
- Key fields: heading, subheading, successMessage
- Behavior: fetches `/api/forms/:id`, submits to `/api/form-submissions`

### 13.8 `teamSection`
- Purpose: team member cards
- Required: none
- Key fields: heading, subheading, members relationship, columns
- Current behavior: renderer displays selected `members`; it does not auto-fetch all if empty

### 13.9 `logoBandSection`
- Purpose: customer/partner logo strip
- Required: none
- Key fields: heading, logos relationship, display mode, logo height
- Modes: `static` or `marquee`
- Current behavior: renderer displays selected `logos`; it does not auto-fetch all if empty

### 13.10 `quoteSection`
- Purpose: testimonial quote styles
- Required: `quote`
- Key fields: attribution, role, photo, style (`centered`, `left-border`, `pull`)

### 13.11 `tabsSection`
- Purpose: tabbed content
- Required in tabs: `label`
- Key fields: heading, subheading, tab heading/body/image/link fields

### 13.12 `guideFormSection`
- Purpose: guide lead form area
- Required: none
- Key fields: label, heading, highlightText, body
- Behavior: embeds `GuideForm` client component posting to `/api/guide`
- Form text and legal link can be overridden globally via `site-settings.guideForm.*`:
  - `submitLabel`, `submittingLabel`, `successHeading`, `successBody`, `footerText`
  - `privacyLabel`, `privacyHref`
  - `namePlaceholder`, `emailPlaceholder`

### 13.13 `inquiryFormSection`
- Purpose: direct inquiry lead form area
- Required: none
- Key fields: label, heading, subtext, next-step copy, contact fields
- Behavior: embeds `InquiryForm` posting to `/api/inquiry`
- Form text and legal link can be overridden globally via `site-settings.inquiryForm.*`:
  - `submitLabel`, `submittingLabel`, `successHeading`, `successBody`, `consentText`
  - `privacyLabel`, `privacyHref`
  - `namePlaceholder`, `emailPlaceholder`, `companyPlaceholder`, `challengePlaceholder`

### 13.14 `privacyNoteSection`
- Purpose: short legal consent note
- Required: none
- Key fields: label, policy link label/href

### 13.15 `imageSection`
- Purpose: image grid/slideshow
- Required in each row: image upload
- Key fields: display mode, aspect ratio, grid columns, image array, captions, link href

### 13.16 `videoSection`
- Purpose: embedded video
- Required: none
- Key fields: heading, embed URL, poster image
- Behavior: iframe if embed URL exists; poster fallback; placeholder message otherwise

### 13.17 `simpleTableSection`
- Purpose: generic tabular content
- Required: none
- Key fields: heading, columns, rows/cells

### 13.18 `comparisonTableSection`
- Purpose: plan/feature comparison
- Required: practical usage requires plan columns + feature rows
- Key fields: heading, plan columns, features with per-plan values

### 13.19 `dynamicListSection`
- Purpose: pull cards/list/table from collections
- Required: `source`
- Sources: `serviceItem`, `blogPost`, `testimonial`
- Key fields: view mode, filter field/value, sort field/direction, limit, pagination
- Behavior: only published source docs are loaded by backend collection fetch

### 13.20 `splitSection`
- Purpose: two-column mixed media/text section
- Required: none
- Key fields: layout ratio, mobile reverse, vertical align, left/right content type (richText/image/video), optional CTA per side

### 13.21 `reusableSectionReference`
- Purpose: include shared reusable section document
- Required: `reusableSection` relationship
- Key fields: override heading
- Behavior: renders nested sections recursively

### 13.22 `spacerSection`
- Purpose: vertical spacing
- Required: none
- Key fields: height

### 13.23 `dividerSection`
- Purpose: horizontal separator with optional label
- Required: none
- Key fields: label + common section fields

### 13.24 Legacy blocks
- `legacyHeroSection`
- `legacyNarrativeSection`
- `legacyNumberedStageSection`
- `legacyAudienceGridSection`
- `legacyChecklistSection`
- `legacyQuoteSection`
- `legacyCenteredCtaSection`

Use these when maintaining older designs/content shape.

---

## 14) Globals

### `site-settings` global
Main groups:
- branding
- header buttons and navigation
- announcement banner
- footer links and social links
- default SEO
- JSON-LD organization data
- guide/inquiry form label overrides (including privacy link label/href)
- cookie banner labels and text
- privacy policy rich text and last updated
- not found page content + not-found metadata (`metaTitle`, `metaDescription`)
- analytics token

### `ui-settings` global
Tabs:
- Colors
- Typography
- Layout
- Buttons

These map to CSS variables in frontend layout and are applied globally.

---

## 15) Media, Team, Logos, Redirects

### Media (`media`)
- Upload types: images and PDF
- Required metadata: `alt`
- Optional: caption

### Team Members (`team-members`)
- name, role, bio, photo, social links, order
- write: admin/editor
- delete: admin only

### Logos (`logos`)
- name, image, href, order
- write: admin/editor
- delete: admin only

### Redirect Rules (`redirect-rules`)
- fromPath, toPath, isPermanent, enabled
- wildcard pattern supported (for example `/old-blog/*`)
- proxy maps to 308 if permanent, else 307

---

## 16) Forms In This Project

### Guide form
- Frontend component: `GuideForm`
- API route: `POST /api/guide`
- Validation: name + email
- DB logging: `guide_submissions` (if Supabase env configured)
- Email delivery triggered after submission
- Privacy link label/href come from `site-settings.guideForm` (with local fallback)

### Inquiry form
- Frontend component: `InquiryForm`
- API route: `POST /api/inquiry`
- Validation: name + email + company + challenge
- DB logging: `inquiry_submissions` (if Supabase env configured)
- Notification + acknowledgement email flow
- Consent text + privacy link label/href come from `site-settings.inquiryForm` (with local fallback)

### Form Builder block
- `formSection` uses Payload plugin collections:
  - `forms`
  - `form-submissions`

---

## 17) Operational Commands

Run app:

```bash
npm run dev
```

Seed core site pages (safe to re-run):

```bash
npm run seed:site-pages
```

Seed core section templates (safe to re-run):

```bash
npm run seed:page-presets
```

Seed route:
- `POST /api/internal/seed-site-pages`
- development only
- bearer secret required (`PAYLOAD_SEED_SECRET` or `PAYLOAD_SECRET`)

Template seed route:
- `POST /api/internal/seed-page-presets`
- available in both development and production
- bearer secret required (`PAYLOAD_SEED_SECRET` or `PAYLOAD_SECRET`)

---

## 18) Publishing Checklist

Before releasing changes:
1. Content workflow set to `published`.
2. `site-pages` also has `isActive = true`.
3. Slug is correct and unique.
4. Images have valid `alt`.
5. Links are valid (`/path` for internal, `https://` for external).
6. If editing About/Services/Pricing presets, verify heading-dependent extractors still match.
7. If editing Home/Contact presets, verify resolver-mapped fields render as expected (labels, CTA copy, form/legal text).
8. Verify desktop and mobile render.
9. Verify forms submit successfully.
10. Verify SEO fields and canonical URL.
11. Verify redirects if slug moved.

---

## 19) Troubleshooting

### "I saved but frontend did not update"
- Check workflow status is `published`.
- For `site-pages`, also check `isActive = true`.
- Confirm correct slug/route.

### "Core page layout keeps reverting"
- Expected when `presetKey` is core preset.
- Preset hook regenerates structure.

### "Core page content unexpectedly falls back to defaults"
- About/Services/Pricing: heading-based section matching may no longer match.
- Home/Contact: check required block types and mapped fields in resolver modules.
- Check resolver files:
  - `src/lib/page-content/home.ts`
  - `src/lib/page-content/contact.ts`
  - `src/lib/page-content/not-found.ts`

### "Section does not show"
- Check `isHidden`, `visibleFrom`, `visibleUntil`.

### "Team or logos section empty"
- Select explicit related records in block relation field.

### "Form block says no form selected"
- Choose a `forms` record in `formSection`.

### "Guide/inquiry DB errors"
- Verify Supabase env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Ensure required tables exist:
  - `guide_submissions`
  - `inquiry_submissions`

---

## 20) Source Pointers

Key files behind this guide:
- `src/payload.config.ts`
- `src/payload/collections/SitePages.ts`
- `src/payload/blocks/pageSections.ts`
- `src/payload/fields/sectionCommon.ts`
- `src/payload/hooks/workflow.ts`
- `src/payload/hooks/sitePagePreset.ts`
- `src/payload/hooks/normalizeSlug.ts`
- `src/lib/page-content/home.ts`
- `src/lib/page-content/contact.ts`
- `src/lib/page-content/not-found.ts`
- `src/components/cms/UniversalSections.tsx`
- `src/app/(frontend)/[...slug]/page.tsx`
- `src/app/(frontend)/page.tsx`
- `src/app/(frontend)/about/page.tsx`
- `src/app/(frontend)/services/page.tsx`
- `src/app/(frontend)/pricing/page.tsx`
- `src/app/(frontend)/contact/page.tsx`
- `src/app/(frontend)/not-found.tsx`
