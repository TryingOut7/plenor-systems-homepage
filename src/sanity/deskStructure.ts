import type { StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  DocumentsIcon,
  ComponentIcon,
  ComposeIcon,
  BookIcon,
  EditIcon,
  UsersIcon,
  LinkIcon,
  ArchiveIcon,
} from '@sanity/icons';

export const singletonTypeNames = new Set(['siteSettings']);

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // ── Global ─────────────────────────────
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),

      // ── Page Building ──────────────────────
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('sitePage').title('Pages')),
      S.listItem()
        .title('Reusable Sections')
        .icon(ComponentIcon)
        .child(S.documentTypeList('reusableSection').title('Reusable Sections')),
      S.divider(),

      // ── Collections (flat for fewer clicks) ─
      S.listItem()
        .title('Blog Posts')
        .icon(ComposeIcon)
        .child(S.documentTypeList('blogPost').title('Blog Posts')),
      S.listItem()
        .title('Services')
        .icon(EditIcon)
        .child(S.documentTypeList('serviceItem').title('Services')),
      S.listItem()
        .title('Testimonials')
        .icon(UsersIcon)
        .child(S.documentTypeList('testimonial').title('Testimonials')),
      S.divider(),

      // ── Utilities ──────────────────────────
      S.listItem()
        .title('Redirects')
        .icon(LinkIcon)
        .child(S.documentTypeList('redirectRule').title('Redirects')),
      S.divider(),

      // ── Legacy (collapsed) ─────────────────
      S.listItem()
        .title('Legacy Schemas')
        .icon(ArchiveIcon)
        .child(
          S.list()
            .title('Legacy Schemas (deprecated)')
            .items([
              S.listItem().title('Home').child(S.documentTypeList('homePage').title('Home (Legacy)')),
              S.listItem().title('About').child(S.documentTypeList('aboutPage').title('About (Legacy)')),
              S.listItem().title('Services').child(S.documentTypeList('servicesPage').title('Services (Legacy)')),
              S.listItem().title('Pricing').child(S.documentTypeList('pricingPage').title('Pricing (Legacy)')),
              S.listItem().title('Contact').child(S.documentTypeList('contactPage').title('Contact (Legacy)')),
            ])
        ),
    ]);
