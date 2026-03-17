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

function pickString(value, fallback) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function buildAboutSectionsFromLegacy(doc) {
  return [
    {
      _key: 'hero',
      _type: 'aboutHeroSection',
      label: 'About',
      heading: 'Who we are',
      paragraphs: [
        pickString(doc.heroParagraph1, ABOUT_DEFAULTS.heroParagraph1),
        pickString(doc.heroParagraph2, ABOUT_DEFAULTS.heroParagraph2),
        pickString(doc.heroParagraph3, ABOUT_DEFAULTS.heroParagraph3),
      ],
    },
    {
      _key: 'focus',
      _type: 'aboutFocusSection',
      label: 'Our Focus',
      heading: 'Narrow by design. Deep by necessity.',
      paragraphs: [
        pickString(doc.focusParagraph1, ABOUT_DEFAULTS.focusParagraph1),
        pickString(doc.focusParagraph2, ABOUT_DEFAULTS.focusParagraph2),
        pickString(doc.focusParagraph3, ABOUT_DEFAULTS.focusParagraph3),
      ],
      linkLabel: 'See how the two stages work ->',
      linkHref: '/services',
    },
    {
      _key: 'mission',
      _type: 'aboutMissionSection',
      label: 'What we believe',
      quote: pickString(doc.missionQuote, ABOUT_DEFAULTS.missionQuote),
    },
    {
      _key: 'founder',
      _type: 'aboutFounderSection',
      label: 'The Team',
      heading: 'The people behind the framework.',
      founderName: pickString(doc.founderName, ABOUT_DEFAULTS.founderName),
      founderRole: pickString(doc.founderRole, ABOUT_DEFAULTS.founderRole),
      founderBio: pickString(doc.founderBio, ABOUT_DEFAULTS.founderBio),
    },
    {
      _key: 'cta',
      _type: 'aboutCtaSection',
      heading: pickString(doc.ctaHeading, ABOUT_DEFAULTS.ctaHeading),
      body: pickString(doc.ctaBody, ABOUT_DEFAULTS.ctaBody),
      primaryButtonLabel: 'Get in touch',
      primaryButtonHref: '/contact',
      secondaryButtonLabel: 'Get the free guide',
      secondaryButtonHref: '/contact#guide',
    },
  ];
}

function hasSections(doc) {
  return Array.isArray(doc.sections) && doc.sections.length > 0;
}

const aboutLegacyToSectionsMigration = {
  id: 'about-legacy-to-sections-v1',
  description:
    'Migrates aboutPage flat legacy fields into the new sections[] schema and unsets legacy fields.',
  targetTypes: ['aboutPage'],
  appliesTo(document) {
    return document._type === 'aboutPage' && !hasSections(document);
  },
  migrate(document) {
    return {
      set: {
        sections: buildAboutSectionsFromLegacy(document),
      },
      unset: [...ABOUT_LEGACY_FIELDS],
    };
  },
};

/**
 * Add future page migrations here.
 * Each migration can target any page type and reuse the same runner.
 */
export const pageMigrations = [aboutLegacyToSectionsMigration];

export function resolveMigrationsById(migrationIds) {
  if (!migrationIds || migrationIds.length === 0) return pageMigrations;
  const idSet = new Set(migrationIds);
  return pageMigrations.filter((migration) => idSet.has(migration.id));
}

export function getAvailablePageTypes(migrations = pageMigrations) {
  return [...new Set(migrations.flatMap((migration) => migration.targetTypes))];
}
