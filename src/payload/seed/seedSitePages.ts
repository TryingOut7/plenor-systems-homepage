import { getPayload } from '@/payload/client';

type SeedPage = {
  slug: string;
  title: string;
  sections: Record<string, unknown>[];
};

type SeedResultItem = {
  slug: string;
  title: string;
  action: 'created' | 'hydrated' | 'exists';
  id: string;
};

export type SeedSitePagesResult = {
  created: number;
  existing: number;
  items: SeedResultItem[];
};

const DEFAULT_SITE_PAGES: SeedPage[] = [
  {
    slug: 'home',
    title: 'Home',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Product Development Framework',
        heading:
          'Plenor Systems brings structure to the two most failure-prone stages of product development.',
        subheading: 'Testing & QA and Launch & Go-to-Market, done right.',
        primaryCtaLabel: 'Get the Free Guide',
        primaryCtaHref: '/contact#guide',
      },
      {
        blockType: 'ctaSection',
        theme: 'white',
        heading: 'Most product failures happen at the end, not the beginning.',
        body:
          'Teams often rush testing and launch planning. Plenor Systems gives your team a repeatable framework for release quality and go-to-market execution.',
        buttonLabel: 'See Services',
        buttonHref: '/services',
      },
      {
        blockType: 'dynamicListSection',
        theme: 'light',
        heading: 'Framework modules',
        source: 'serviceItem',
        viewMode: 'cards',
        sortField: 'updatedAt',
        sortDirection: 'desc',
        limit: 6,
        enablePagination: false,
      },
      {
        blockType: 'ctaSection',
        theme: 'white',
        heading: 'Ready to reduce launch risk?',
        body:
          'Start with the free guide to understand the common mistakes and what to do instead.',
        buttonLabel: 'Go to Contact',
        buttonHref: '/contact#guide',
      },
    ],
  },
  {
    slug: 'about',
    title: 'About',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'About',
        heading: 'Who we are',
        subheading:
          'Plenor Systems focuses on Testing & QA and Launch & Go-to-Market, where most preventable product failures occur.',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Narrow by design. Deep by necessity.',
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Want to work together?',
        body:
          'Get in touch to discuss your team and product context, or start with the free guide.',
        buttonLabel: 'Contact Us',
        buttonHref: '/contact',
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Services',
        heading:
          'Two framework stages. The two that decide whether a product succeeds.',
        subheading:
          'Testing & QA and Launch & Go-to-Market are where most product failures originate.',
      },
      {
        blockType: 'dynamicListSection',
        theme: 'white',
        heading: 'Our service modules',
        source: 'serviceItem',
        viewMode: 'cards',
        sortField: 'updatedAt',
        sortDirection: 'desc',
        limit: 12,
        enablePagination: true,
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Not sure where to start?',
        body: 'Use the contact page and we will help choose the right path for your team.',
        buttonLabel: 'Talk to Us',
        buttonHref: '/contact',
      },
    ],
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Pricing',
        heading: 'Let’s find the right fit for your team.',
        subheading:
          'Pricing is tailored based on team size and scope. Reach out and we will send a proposal.',
      },
      {
        blockType: 'ctaSection',
        theme: 'white',
        heading: 'Everything you need to ship with confidence.',
        body:
          'Engagements are designed to stay practical and lightweight while bringing structure where it matters most.',
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Ready to discuss pricing?',
        body: 'Tell us about your product and team and we will share a recommended approach.',
        buttonLabel: 'Contact Us',
        buttonHref: '/contact',
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Contact',
        heading: 'Let’s talk.',
        subheading:
          'Tell us about your product and team and we will get back to you within 2 business days.',
      },
      {
        blockType: 'guideFormSection',
        theme: 'light',
        label: 'Free resource',
        heading: 'Get the free guide',
        body:
          'Enter your name and email and we will send the guide to your inbox automatically.',
      },
      {
        blockType: 'inquiryFormSection',
        theme: 'white',
        label: 'Send an inquiry',
        heading: 'Send a direct inquiry',
        subtext:
          'Tell us about your product, team, and the challenge you are working through.',
      },
      {
        blockType: 'privacyNoteSection',
        theme: 'white',
        label: 'By submitting this form, you agree to our',
        policyLinkLabel: 'Privacy Policy',
        policyLinkHref: '/privacy',
      },
    ],
  },
];

export async function seedSitePages(): Promise<SeedSitePagesResult> {
  const payload = await getPayload();

  const items: SeedResultItem[] = [];
  let created = 0;
  let existing = 0;

  for (const page of DEFAULT_SITE_PAGES) {
    const found = await payload.find({
      collection: 'site-pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const current = found.docs[0] as { id?: string; sections?: unknown } | undefined;
    if (current?.id) {
      const hasSections = Array.isArray(current.sections) && current.sections.length > 0;
      if (!hasSections) {
        await payload.update({
          collection: 'site-pages',
          id: String(current.id),
          data: {
            pageMode: 'builder',
            isActive: true,
            sections: page.sections,
          },
          overrideAccess: true,
        });
        existing += 1;
        items.push({
          slug: page.slug,
          title: page.title,
          action: 'hydrated',
          id: String(current.id),
        });
      } else {
        existing += 1;
        items.push({
          slug: page.slug,
          title: page.title,
          action: 'exists',
          id: String(current.id),
        });
      }
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'site-pages',
      data: {
        title: page.title,
        slug: page.slug,
        pageMode: 'builder',
        isActive: true,
        sections: page.sections,
      },
      overrideAccess: true,
    });

    created += 1;
    items.push({
      slug: page.slug,
      title: page.title,
      action: 'created',
      id: String((createdDoc as { id?: string })?.id ?? ''),
    });
  }

  return { created, existing, items };
}
