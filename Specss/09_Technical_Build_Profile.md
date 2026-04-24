# Technical Build Profile
**Status:** Active Governing Implementation
**Reference:** Plenor.ai Governance Model (Doc 09)
**Effective Date:** Current

## 1. Purpose, Scope, Role, and Authority
### 1.1 Purpose
This document defines the stack-specific technical realization profile for the Plenor.ai website solution. Its purpose is to translate the governed artifact stack into a concrete technical implementation model so that implementation is repeatable, structural intent is preserved, page realization is controlled, CMS behavior is realized within governed boundaries, configuration behavior is technically enforced, and conformance can be assessed against a defined technical target.

### 1.2 Scope
This document is in scope for the selected Next.js/Payload/Supabase technical stack for this implementation; technical realization mappings from governing artifacts; logical module to technical realization mapping; buildable module, reusable component, page type, page instance, and page composition realization; CMS technical realization; runtime configuration realization; technical interfaces and runtime contracts; implementation rules; code-generation operating rules; codebase, environment, and delivery model; and technical conformance expectations.

## 2. Selected Technology Profile
### 2.1 Selected Frontend Framework
**Selected technology:** Next.js 15 (App Router, Server Components, React 19)
**Reason for selection:** Next.js App Router provides superior support for server-side generation, static rendering, and layout composition necessary for a CMS-driven architecture.
**Role in governed realization:** Realizes the presentation layer, page rendering behavior, approved component model, approved module rendering behavior, and approved page-composition output.

### 2.2 Selected CMS / Content Platform
**Selected technology:** Payload CMS 3.x
**Reason for selection:** Deep integration with Next.js, code-first configuration, strong TypeScript support, and modular architecture.
**Role in governed realization:** Realizes content management, page-instance management, global settings management, workflow and lifecycle behavior, preview and publishing behavior.

### 2.3 Selected Backend / Orchestration Pattern
**Selected technology:** Next.js Server Components and Server Actions
**Reason for selection:** Eliminates the need for a separate BFF by handling data fetching securely on the server.
**Role in governed realization:** Realizes shaping, aggregation, validation, page composition support, CMS boundary enforcement, and runtime contract enforcement.

### 2.4 Selected Hosting / Deployment Platform
**Selected technology:** Vercel
**Reason for selection:** Native Next.js support, edge caching, automated preview deployments, and integrated CI/CD.
**Role in governed realization:** Realizes runtime hosting, deployment behavior, environment separation, and delivery posture.

### 2.5 Selected Storage / Persistence Model
**Selected technology:** PostgreSQL (Supabase) + Vercel Blob
**Reason for selection:** High-performance relational database mapping naturally to Payload's models, plus edge-optimized blob storage for media.
**Role in governed realization:** Realizes approved persistence concerns such as CMS data storage and inquiry submissions.

### 2.6 Selected Validation, Testing, and Build Tooling
**Selected technologies:** TypeScript, ESLint, Prettier, Vercel Build Pipeline
**Reason for selection:** Industry standard tools ensuring type-safety and code quality.
**Role in governed realization:** Realize technical correctness controls, contract validation, build integrity, and automated delivery quality gates.

## 3. Realization Mapping from Governing Artifacts
### 3.1 Website Specification to Technical Realization
Technical realization implements required page and view behaviors, CMS-managed generation of detail pages (Insights, Solutions, Framework, About), inquiry flow and lifecycle, accessibility behavior, and responsive behavior.

### 3.2 Configuration Artifacts to Runtime Configuration
The `Site Configuration Record` values are actively managed via Payload Global configurations (e.g., `SiteSettings.ts`, `UISettings.ts`). These are loaded via `getSiteSettings()` and injected into layouts.

### 3.3 Solution Architecture Standard to Technical Realization
Orthogonality and dependencies map directly to Next.js architectural boundaries (components, lib, payload).

### 3.4 Realization and Page Composition Standard
Buildable modules are implemented as Payload blocks (`src/payload/blocks/pageSections.ts`) and rendered dynamically via `UniversalSections.tsx` to prevent structural invention.

## 4. Logical Module to Technical Realization Mapping

| ID | Logical Module | Technical Realization (Next.js / Payload) |
|---|---|---|
| LM-1 | Core Application Shell | `src/app/(frontend)/layout.tsx`, `<Navbar>`, `<Footer>`, `globals.css` |
| LM-2 | Scheme Switcher & Theming | `src/payload/globals/UISettings.ts`, `UIStyleInjector` |
| LM-3 | Identity & Assets | `src/payload/globals/SiteSettings.ts`, `resolveSiteName` |
| LM-4 | Page Configuration | `src/payload/collections/SitePages.ts`, Next.js metadata API |
| LM-5 | Navigation Hierarchy | `SiteSettings.navigationLinks`, Next.js static routing + `[...slug]` |
| LM-6 | Form Intake & Processing | `src/application/forms/inquirySubmissionService.ts`, `src/infrastructure/persistence/backendStore.ts`, `<FormRenderer>` |
| LM-7 | Component Library | `src/components/`, `globals.css` (Design System tokens) |
| LM-8 | Proof/Validation Pipeline | `src/payload/collections/Testimonials.ts` |
| LM-9 | Document Delivery | `src/payload/collections/Media.ts`, Vercel Blob |
| LM-10| CMS Administration | `src/payload.config.ts`, Payload Admin UI |
| LM-11| CI/CD & Deployment | Vercel Build Pipeline, Vercel Speed Insights |

## 5. Buildable Module, Component, and Page Realization
- **Buildable Modules:** Realized as Payload blocks (`HeroSection`, `FaqSection`, `RichTextSection`, etc.).
- **Page Composition:** Evaluated dynamically at request time via `UniversalSections.tsx`. Governance constraints (like FAQ rendering scope) are enforced directly in the rendering iteration.

## 6. CMS Realization Model
- **CMS Content Types:** `FrameworkEntries`, `SolutionEntries`, `InsightEntries`, `SitePages`.
- **Global Settings:** `SiteSettings`, `UISettings`.
- **Suppressed Modules:** Events, Spotlight, Learning, and ServiceItems are explicitly disabled per governance configuration.

## 7. Runtime Configuration and Technical Contracts
- **Source of Truth:** Payload globals act as the dynamic configuration source of truth.
- **Resolution Path:** Fetched via typed Payload Local API (`payload.findGlobal`).
- **Failure boundaries:** Handled gracefully with statically typed fallbacks matching governed defaults.

## 8. Implementation and Code-Generation Rules
- **No Direct Raw CMS Usage:** All access routes through abstracted payload queries (`src/payload/cms`).
- **No Redefinition:** Page-type meanings must not be overridden in code.
- **No Bypass:** Configuration overrides bypassing the CMS are strictly prohibited.

## 9. Codebase, Environment, and Delivery Model
- **Codebase Structure:** App Router structure (`src/app`), decoupled components (`src/components`), decoupled CMS (`src/payload`).
- **CI/CD:** Automated testing (`npm run test:ci`), linting, and type-checking executed before deployment on Vercel. Database schema migrations enforced via `npm run predeploy:guardrails`.

## 10. Conformance Model
All technical realization must conform to the defined mappings. Exceptions must be explicitly requested and merged via approved governance PRs.

## 11. Final Governing Statements
This document must realize upstream governing artifacts and must not redefine them. All implementation and code-generation outputs within scope must conform to this profile.
