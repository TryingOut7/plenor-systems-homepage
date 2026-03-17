const ABOUT_LEGACY_FIELDS = [
  'heroParagraph1',
  'heroParagraph2',
  'heroParagraph3',
  'focusParagraph1',
  'focusParagraph2',
  'focusParagraph3',
  'missionQuote',
  'founderName',
  'founderRole',
  'founderBio',
  'ctaHeading',
  'ctaBody',
];

const HOME_LEGACY_FIELDS = [
  'heroHeading',
  'heroSubtext',
  'problemHeading',
  'problemBody1',
  'problemBody2',
  'whatWeDoHeading',
  'testingCardTitle',
  'testingCardBody',
  'launchCardTitle',
  'launchCardBody',
  'whoForHeading',
  'audiences',
  'guideCTAHeading',
  'guideCTABody',
];

const SERVICES_LEGACY_FIELDS = [
  'heroHeading',
  'heroSubtext',
  'testingBody',
  'testingItems',
  'testingWhoFor',
  'launchBody',
  'launchItems',
  'launchWhoFor',
  'whyFrameworkHeading',
  'whyFrameworkBody1',
  'whyFrameworkBody2',
  'whyFrameworkBody3',
  'ctaHeading',
  'ctaBody',
];

const PRICING_LEGACY_FIELDS = [
  'heroHeading',
  'heroSubtext',
  'includedItems',
  'includedBody',
  'audiences',
  'ctaHeading',
  'ctaBody',
  'notReadyHeading',
  'notReadyBody',
];

const CONTACT_LEGACY_FIELDS = [
  'heroHeading',
  'heroSubtext',
  'inquiryHeading',
  'inquirySubtext',
  'privacyLabel',
];

const ABOUT_DEFAULTS = {
  heroParagraph1:
    'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market - and they are consistently the least structured.',
  heroParagraph2:
    'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages - not because the others do not matter, but because these two are where structure is most absent and most needed.',
  heroParagraph3:
    'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
  focusParagraph1:
    'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
  focusParagraph2:
    'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific - built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
  focusParagraph3:
    'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
  missionQuote:
    'A well-built product deserves a structured path to market - and consistent quality standards before it gets there.',
  founderName: '',
  founderRole: '',
  founderBio: '',
  ctaHeading: 'Want to work together?',
  ctaBody: 'Get in touch to discuss your product and team, or start with the free guide.',
};

const HOME_DEFAULTS = {
  heroHeading: 'Plenor Systems brings structure to the two most failure-prone stages of product development.',
  heroSubtext: 'Testing & QA and Launch & Go-to-Market, done right.',
  problemHeading: 'Most product failures happen at the end, not the beginning.',
  problemBody1:
    "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  problemBody2:
    "These aren't execution failures - they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
  whatWeDoHeading: 'Two stages. Both critical.',
  testingCardTitle: 'Testing & QA that catches what matters before release.',
  testingCardBody:
    'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  launchCardTitle: 'Launch & Go-to-Market with a plan that holds up on launch day.',
  launchCardBody:
    'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  whoForHeading: 'Built for teams at every stage.',
  audiences: [
    {
      label: 'Startups',
      copy: 'Moving fast but need a reliable process for the final stretch - before a launch defines your reputation.',
    },
    {
      label: 'SMEs',
      copy: 'Growing teams that have outpaced informal processes and need structure without slowing down delivery.',
    },
    {
      label: 'Enterprises',
      copy: 'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.',
    },
  ],
  guideCTAHeading: 'Get the free guide',
  guideCTABody:
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
};

const SERVICES_DEFAULTS = {
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate - not in design or development. Plenor Systems is built specifically for these stages.',
  testingBody:
    "Shipping without a structured quality process means issues surface after release - when they're most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.",
  testingItems: [
    'Defining quality criteria and acceptance standards before development completes',
    'Structured test planning: functional, regression, performance, and edge-case coverage',
    'Release readiness checklists and sign-off processes',
    'Defect triage and prioritisation so teams know what must be fixed before launch',
  ],
  testingWhoFor:
    'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  launchBody:
    'A product can pass QA and still underperform at launch. Go-to-market failures are often structural - unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  launchItems: [
    'Market positioning and messaging that reflects what the product actually does',
    'Channel selection grounded in where your target audience can be reached',
    'Launch sequencing and operational readiness - support, onboarding, and infrastructure',
    'Post-launch review process to capture what worked and what to adjust',
  ],
  launchWhoFor:
    'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  whyFrameworkHeading: 'Why a framework, not a one-off engagement',
  whyFrameworkBody1:
    "Ad-hoc approaches to testing and go-to-market work in isolation but don't build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.",
  whyFrameworkBody2:
    'A structured framework means your team builds consistent habits - clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  whyFrameworkBody3:
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  ctaHeading: 'Not sure yet?',
  ctaBody: 'Start with the guide - see the kinds of mistakes the framework is designed to prevent.',
};

const PRICING_DEFAULTS = {
  heroHeading: "Let's find the right fit for your team.",
  heroSubtext:
    "Pricing is tailored based on your team size and scope. Get in touch and we'll come back with a proposal.",
  includedItems: [
    {
      title: 'Testing & QA Module',
      desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.',
    },
    {
      title: 'Launch & Go-to-Market Module',
      desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.',
    },
    { title: 'Onboarding support', desc: 'Get your team up and running with the framework from day one.' },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size - no minimum headcount or project scale required.',
  audiences: [
    {
      label: 'Startups',
      copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.',
    },
    {
      label: 'SMEs',
      copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.',
    },
    {
      label: 'Enterprises',
      copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.',
    },
  ],
  ctaHeading: 'Ready to talk?',
  ctaBody: "Tell us about your product and team - we'll come back with a proposal.",
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
};

const CONTACT_DEFAULTS = {
  heroHeading: "Let's talk.",
  heroSubtext: "Tell us about your product and team and we'll get back to you within 2 business days.",
  inquiryHeading: 'Send a direct inquiry',
  inquirySubtext:
    "Tell us about your product, your team, and the challenge you're working through. We'll respond within 2 business days.",
  privacyLabel: 'By submitting this form, you agree to our',
};

const PRICING_INCLUDED_HEADING = 'Everything you need to ship with confidence.';
const PRICING_AUDIENCE_HEADING = 'No minimum team size. Any stage.';
const CONTACT_GUIDE_HEADING = 'Get the free guide';
const CONTACT_GUIDE_BODY =
  'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.';

function pickString(value, fallback) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function hasSections(document) {
  return Array.isArray(document.sections) && document.sections.length > 0;
}

function normalizeStringArray(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeAudienceArray(value, fallback) {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const label = typeof item.label === 'string' ? item.label.trim() : '';
      const copy = typeof item.copy === 'string' ? item.copy.trim() : '';
      if (!label && !copy) return null;
      const candidate = { label, copy };
      if (typeof item._key === 'string' && item._key.trim()) {
        candidate._key = item._key.trim();
      }
      return candidate;
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeIncludedItems(value, fallback) {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .map((item) => {
      if (typeof item === 'string') {
        const text = item.trim();
        return text ? text : null;
      }
      if (!item || typeof item !== 'object') return null;

      const title = typeof item.title === 'string' ? item.title.trim() : '';
      const desc = typeof item.desc === 'string' ? item.desc.trim() : '';
      if (!title && !desc) return null;

      const candidate = { title, desc };
      if (typeof item._key === 'string' && item._key.trim()) {
        candidate._key = item._key.trim();
      }
      return candidate;
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function buildAboutSectionsFromLegacy(document) {
  return [
    {
      _key: 'hero',
      _type: 'aboutHeroSection',
      label: 'About',
      heading: 'Who we are',
      paragraphs: [
        pickString(document.heroParagraph1, ABOUT_DEFAULTS.heroParagraph1),
        pickString(document.heroParagraph2, ABOUT_DEFAULTS.heroParagraph2),
        pickString(document.heroParagraph3, ABOUT_DEFAULTS.heroParagraph3),
      ],
    },
    {
      _key: 'focus',
      _type: 'aboutFocusSection',
      label: 'Our Focus',
      heading: 'Narrow by design. Deep by necessity.',
      paragraphs: [
        pickString(document.focusParagraph1, ABOUT_DEFAULTS.focusParagraph1),
        pickString(document.focusParagraph2, ABOUT_DEFAULTS.focusParagraph2),
        pickString(document.focusParagraph3, ABOUT_DEFAULTS.focusParagraph3),
      ],
      linkLabel: 'See how the two stages work ->',
      linkHref: '/services',
    },
    {
      _key: 'mission',
      _type: 'aboutMissionSection',
      label: 'What we believe',
      quote: pickString(document.missionQuote, ABOUT_DEFAULTS.missionQuote),
    },
    {
      _key: 'founder',
      _type: 'aboutFounderSection',
      label: 'The Team',
      heading: 'The people behind the framework.',
      founderName: pickString(document.founderName, ABOUT_DEFAULTS.founderName),
      founderRole: pickString(document.founderRole, ABOUT_DEFAULTS.founderRole),
      founderBio: pickString(document.founderBio, ABOUT_DEFAULTS.founderBio),
    },
    {
      _key: 'cta',
      _type: 'aboutCtaSection',
      heading: pickString(document.ctaHeading, ABOUT_DEFAULTS.ctaHeading),
      body: pickString(document.ctaBody, ABOUT_DEFAULTS.ctaBody),
      primaryButtonLabel: 'Get in touch',
      primaryButtonHref: '/contact',
      secondaryButtonLabel: 'Get the free guide',
      secondaryButtonHref: '/contact#guide',
    },
  ];
}

function buildHomeSectionsFromLegacy(document) {
  return [
    {
      _key: 'hero',
      _type: 'homeHeroSection',
      heading: pickString(document.heroHeading, HOME_DEFAULTS.heroHeading),
      subtext: pickString(document.heroSubtext, HOME_DEFAULTS.heroSubtext),
    },
    {
      _key: 'problem',
      _type: 'homeProblemSection',
      heading: pickString(document.problemHeading, HOME_DEFAULTS.problemHeading),
      body1: pickString(document.problemBody1, HOME_DEFAULTS.problemBody1),
      body2: pickString(document.problemBody2, HOME_DEFAULTS.problemBody2),
    },
    {
      _key: 'what-we-do',
      _type: 'homeWhatWeDoSection',
      heading: pickString(document.whatWeDoHeading, HOME_DEFAULTS.whatWeDoHeading),
      testingCardTitle: pickString(document.testingCardTitle, HOME_DEFAULTS.testingCardTitle),
      testingCardBody: pickString(document.testingCardBody, HOME_DEFAULTS.testingCardBody),
      launchCardTitle: pickString(document.launchCardTitle, HOME_DEFAULTS.launchCardTitle),
      launchCardBody: pickString(document.launchCardBody, HOME_DEFAULTS.launchCardBody),
    },
    {
      _key: 'audience',
      _type: 'homeAudienceSection',
      heading: pickString(document.whoForHeading, HOME_DEFAULTS.whoForHeading),
      audiences: normalizeAudienceArray(document.audiences, HOME_DEFAULTS.audiences),
    },
    {
      _key: 'guide',
      _type: 'homeGuideSection',
      heading: pickString(document.guideCTAHeading, HOME_DEFAULTS.guideCTAHeading),
      body: pickString(document.guideCTABody, HOME_DEFAULTS.guideCTABody),
    },
  ];
}

function buildServicesSectionsFromLegacy(document) {
  return [
    {
      _key: 'hero',
      _type: 'servicesHeroSection',
      heading: pickString(document.heroHeading, SERVICES_DEFAULTS.heroHeading),
      subtext: pickString(document.heroSubtext, SERVICES_DEFAULTS.heroSubtext),
    },
    {
      _key: 'testing',
      _type: 'servicesTestingSection',
      body: pickString(document.testingBody, SERVICES_DEFAULTS.testingBody),
      items: normalizeStringArray(document.testingItems, SERVICES_DEFAULTS.testingItems),
      whoFor: pickString(document.testingWhoFor, SERVICES_DEFAULTS.testingWhoFor),
    },
    {
      _key: 'launch',
      _type: 'servicesLaunchSection',
      body: pickString(document.launchBody, SERVICES_DEFAULTS.launchBody),
      items: normalizeStringArray(document.launchItems, SERVICES_DEFAULTS.launchItems),
      whoFor: pickString(document.launchWhoFor, SERVICES_DEFAULTS.launchWhoFor),
    },
    {
      _key: 'why',
      _type: 'servicesWhySection',
      heading: pickString(document.whyFrameworkHeading, SERVICES_DEFAULTS.whyFrameworkHeading),
      body1: pickString(document.whyFrameworkBody1, SERVICES_DEFAULTS.whyFrameworkBody1),
      body2: pickString(document.whyFrameworkBody2, SERVICES_DEFAULTS.whyFrameworkBody2),
      body3: pickString(document.whyFrameworkBody3, SERVICES_DEFAULTS.whyFrameworkBody3),
    },
    {
      _key: 'links',
      _type: 'servicesLinksSection',
    },
    {
      _key: 'cta',
      _type: 'servicesCtaSection',
      heading: pickString(document.ctaHeading, SERVICES_DEFAULTS.ctaHeading),
      body: pickString(document.ctaBody, SERVICES_DEFAULTS.ctaBody),
    },
  ];
}

function buildPricingSectionsFromLegacy(document) {
  return [
    {
      _key: 'hero',
      _type: 'pricingHeroSection',
      heading: pickString(document.heroHeading, PRICING_DEFAULTS.heroHeading),
      subtext: pickString(document.heroSubtext, PRICING_DEFAULTS.heroSubtext),
    },
    {
      _key: 'included',
      _type: 'pricingIncludedSection',
      heading: PRICING_INCLUDED_HEADING,
      items: normalizeIncludedItems(document.includedItems, PRICING_DEFAULTS.includedItems),
      body: pickString(document.includedBody, PRICING_DEFAULTS.includedBody),
    },
    {
      _key: 'audience',
      _type: 'pricingAudienceSection',
      heading: PRICING_AUDIENCE_HEADING,
      audiences: normalizeAudienceArray(document.audiences, PRICING_DEFAULTS.audiences),
    },
    {
      _key: 'cta',
      _type: 'pricingCtaSection',
      heading: pickString(document.ctaHeading, PRICING_DEFAULTS.ctaHeading),
      body: pickString(document.ctaBody, PRICING_DEFAULTS.ctaBody),
    },
    {
      _key: 'guide',
      _type: 'pricingGuideSection',
      heading: pickString(document.notReadyHeading, PRICING_DEFAULTS.notReadyHeading),
      body: pickString(document.notReadyBody, PRICING_DEFAULTS.notReadyBody),
    },
  ];
}

function buildContactSectionsFromLegacy(document) {
  return [
    {
      _key: 'hero',
      _type: 'contactHeroSection',
      heading: pickString(document.heroHeading, CONTACT_DEFAULTS.heroHeading),
      subtext: pickString(document.heroSubtext, CONTACT_DEFAULTS.heroSubtext),
    },
    {
      _key: 'guide',
      _type: 'contactGuideSection',
      heading: CONTACT_GUIDE_HEADING,
      body: CONTACT_GUIDE_BODY,
    },
    {
      _key: 'inquiry',
      _type: 'contactInquirySection',
      heading: pickString(document.inquiryHeading, CONTACT_DEFAULTS.inquiryHeading),
      subtext: pickString(document.inquirySubtext, CONTACT_DEFAULTS.inquirySubtext),
    },
    {
      _key: 'privacy',
      _type: 'contactPrivacySection',
      label: pickString(document.privacyLabel, CONTACT_DEFAULTS.privacyLabel),
    },
  ];
}

function createLegacyToSectionsMigration({
  id,
  description,
  targetType,
  legacyFields,
  buildSections,
}) {
  return {
    id,
    description,
    targetTypes: [targetType],
    appliesTo(document) {
      return document._type === targetType && !hasSections(document);
    },
    migrate(document) {
      return {
        set: {
          sections: buildSections(document),
        },
        unset: [...legacyFields],
      };
    },
  };
}

const aboutLegacyToSectionsMigration = createLegacyToSectionsMigration({
  id: 'about-legacy-to-sections-v1',
  description:
    'Migrates aboutPage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetType: 'aboutPage',
  legacyFields: ABOUT_LEGACY_FIELDS,
  buildSections: buildAboutSectionsFromLegacy,
});

const homeLegacyToSectionsMigration = createLegacyToSectionsMigration({
  id: 'home-legacy-to-sections-v1',
  description:
    'Migrates homePage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetType: 'homePage',
  legacyFields: HOME_LEGACY_FIELDS,
  buildSections: buildHomeSectionsFromLegacy,
});

const servicesLegacyToSectionsMigration = createLegacyToSectionsMigration({
  id: 'services-legacy-to-sections-v1',
  description:
    'Migrates servicesPage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetType: 'servicesPage',
  legacyFields: SERVICES_LEGACY_FIELDS,
  buildSections: buildServicesSectionsFromLegacy,
});

const pricingLegacyToSectionsMigration = createLegacyToSectionsMigration({
  id: 'pricing-legacy-to-sections-v1',
  description:
    'Migrates pricingPage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetType: 'pricingPage',
  legacyFields: PRICING_LEGACY_FIELDS,
  buildSections: buildPricingSectionsFromLegacy,
});

const contactLegacyToSectionsMigration = createLegacyToSectionsMigration({
  id: 'contact-legacy-to-sections-v1',
  description:
    'Migrates contactPage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetType: 'contactPage',
  legacyFields: CONTACT_LEGACY_FIELDS,
  buildSections: buildContactSectionsFromLegacy,
});

export const pageMigrations = [
  aboutLegacyToSectionsMigration,
  homeLegacyToSectionsMigration,
  servicesLegacyToSectionsMigration,
  pricingLegacyToSectionsMigration,
  contactLegacyToSectionsMigration,
];

export function resolveMigrationsById(migrationIds) {
  if (!migrationIds || migrationIds.length === 0) return pageMigrations;
  const idSet = new Set(migrationIds);
  return pageMigrations.filter((migration) => idSet.has(migration.id));
}

export function getAvailablePageTypes(migrations = pageMigrations) {
  return [...new Set(migrations.flatMap((migration) => migration.targetTypes))];
}
