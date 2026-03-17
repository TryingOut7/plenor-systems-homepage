import type { StructureResolver } from 'sanity/structure';

export const singletonTypeNames = new Set(['siteSettings']);

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.listItem().title('Pages').child(S.documentTypeList('sitePage').title('Pages')),
      S.listItem().title('Reusable Sections').child(S.documentTypeList('reusableSection').title('Reusable Sections')),
      S.listItem()
        .title('Collections')
        .child(
          S.list()
            .title('Collections')
            .items([
              S.listItem().title('Blog Posts').child(S.documentTypeList('blogPost').title('Blog Posts')),
              S.listItem().title('Service Items').child(S.documentTypeList('serviceItem').title('Service Items')),
              S.listItem().title('Testimonials').child(S.documentTypeList('testimonial').title('Testimonials')),
            ])
        ),
      S.listItem().title('Redirect Rules').child(S.documentTypeList('redirectRule').title('Redirect Rules')),
      S.divider(),
      S.listItem()
        .title('Legacy Page Schemas')
        .child(
          S.list()
            .title('Legacy Page Schemas')
            .items([
              S.listItem().title('Home (Legacy)').child(S.documentTypeList('homePage').title('Home (Legacy)')),
              S.listItem().title('About (Legacy)').child(S.documentTypeList('aboutPage').title('About (Legacy)')),
              S.listItem().title('Services (Legacy)').child(S.documentTypeList('servicesPage').title('Services (Legacy)')),
              S.listItem().title('Pricing (Legacy)').child(S.documentTypeList('pricingPage').title('Pricing (Legacy)')),
              S.listItem().title('Contact (Legacy)').child(S.documentTypeList('contactPage').title('Contact (Legacy)')),
            ])
        ),
    ]);
