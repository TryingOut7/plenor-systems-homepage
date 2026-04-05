import { describe, expect, it } from 'vitest';
import { applyCorePresetSections } from '@/payload/hooks/sitePagePreset';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHookArgs(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> = {},
  operation: 'create' | 'update' = 'create',
) {
  return {
    data,
    originalDoc,
    operation,
    // Payload hook args not exercised by the hook
    req: {} as never,
    collection: {} as never,
  };
}

// ---------------------------------------------------------------------------
// Hook does not mutate the incoming data object
// ---------------------------------------------------------------------------

describe('applyCorePresetSections — immutability', () => {
  it('returns a new object and does not mutate the incoming data', async () => {
    const data: Record<string, unknown> = {
      slug: 'home',
      presetKey: 'home',
      sections: [],
      presetContent: {},
    };
    const original = data;
    const result = await applyCorePresetSections(makeHookArgs(data) as never);
    expect(result).not.toBe(original);
    // sections on the input object must remain the original empty array
    expect(data.sections).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Custom preset passthrough
// ---------------------------------------------------------------------------

describe('applyCorePresetSections — custom preset', () => {
  it('returns an equivalent new object for presetKey=custom', async () => {
    const data: Record<string, unknown> = {
      presetKey: 'custom',
      pageMode: 'builder',
      sections: [{ blockType: 'heroSection', heading: 'My custom page' }],
    };
    const result = await applyCorePresetSections(makeHookArgs(data) as never);
    expect(result).not.toBe(data);
    expect(result).toEqual(data);
  });

  it('falls back to custom and defaults pageMode to builder when no preset key is resolvable', async () => {
    const data: Record<string, unknown> = { presetKey: 'unknown', sections: [] };
    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    expect(result).not.toBe(data);
    expect(result.presetKey).toBe('unknown');
    expect(result.pageMode).toBe('builder');
  });
});

describe('applyCorePresetSections — preset-safe page mode', () => {
  it('forces core preset pages into template mode', async () => {
    const result = await applyCorePresetSections(
      makeHookArgs({
        slug: 'home',
        presetKey: 'home',
        pageMode: 'builder',
        sections: [],
      }) as never,
    ) as Record<string, unknown>;

    expect(result.pageMode).toBe('template');
  });
});

describe('applyCorePresetSections — fixed layout guardrails', () => {
  it('blocks structural edits on preset pages during update', async () => {
    const originalDoc: Record<string, unknown> = {
      presetKey: 'home',
      sections: [
        { blockType: 'heroSection', structuralKey: 'home-hero' },
        { blockType: 'richTextSection', structuralKey: 'home-why' },
      ],
    };

    const data: Record<string, unknown> = {
      presetKey: 'home',
      // Editor attempts to remove one section and reorder.
      sections: [{ blockType: 'richTextSection', structuralKey: 'home-why' }],
    };

    await expect(
      applyCorePresetSections(makeHookArgs(data, originalDoc, 'update') as never),
    ).rejects.toThrow('Preset page structure is locked');
  });
});

// ---------------------------------------------------------------------------
// structuralKey — key-based section lookup
// ---------------------------------------------------------------------------

describe('applyCorePresetSections — structuralKey lookup', () => {
  it('merges text from incoming section matched by structuralKey, not index', async () => {
    // Home preset has two simpleTableSection blocks (home-table-stages at index 3,
    // home-table-audiences at index 4). This test proves that sending them in
    // reverse order still routes each section's text to the correct template slot.
    const audiencesSectionFirst: Record<string, unknown> = {
      blockType: 'simpleTableSection',
      structuralKey: 'home-table-audiences',
      sectionLabel: 'Who this is for',
      heading: 'Audience heading from CMS',
      columns: [],
      rows: [
        { cells: [{ value: 'Startups' }, { value: 'Fast teams' }] },
      ],
    };
    const stagesSectionSecond: Record<string, unknown> = {
      blockType: 'simpleTableSection',
      structuralKey: 'home-table-stages',
      sectionLabel: '',
      heading: 'Stage heading from CMS',
      columns: [],
      rows: [
        { cells: [{ value: 'Testing' }, { value: '' }, { value: '' }] },
        { cells: [{ value: 'Launch' }, { value: '' }, { value: '' }] },
      ],
    };

    // Deliberately send audiences first (index 0) and stages second (index 1),
    // the inverse of their position in the home preset template.
    const data: Record<string, unknown> = {
      slug: 'home',
      presetKey: 'home',
      presetContent: {},
      sections: [audiencesSectionFirst, stagesSectionSecond],
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    const sections = result.sections as Array<Record<string, unknown>>;

    const stagesSection = sections.find((s) => s.structuralKey === 'home-table-stages');
    const audiencesSection = sections.find((s) => s.structuralKey === 'home-table-audiences');

    expect(stagesSection).toBeDefined();
    expect(audiencesSection).toBeDefined();

    // heading from CMS must flow into the correct template slot via structuralKey
    expect((stagesSection as Record<string, unknown>).heading).toBe('Stage heading from CMS');
    expect((audiencesSection as Record<string, unknown>).sectionLabel).toBe('Who this is for');
    expect((audiencesSection as Record<string, unknown>).heading).toBe('Audience heading from CMS');
  });

  it('falls back to index matching when no structuralKey is present on incoming section', async () => {
    // Legacy DB row — no structuralKey field
    const heroSection: Record<string, unknown> = {
      blockType: 'heroSection',
      heading: 'Legacy hero heading',
    };
    const data: Record<string, unknown> = {
      slug: 'about',
      presetKey: 'about',
      presetContent: {},
      sections: [heroSection],
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    const sections = result.sections as Array<Record<string, unknown>>;
    const hero = sections.find((s) => s.structuralKey === 'about-hero');
    expect(hero).toBeDefined();
    expect((hero as Record<string, unknown>).heading).toBe('Legacy hero heading');
  });
});

// ---------------------------------------------------------------------------
// Text merge per blockType
// ---------------------------------------------------------------------------

describe('applyCorePresetSections — text merging', () => {
  it('merges heroSection string fields from incoming sections', async () => {
    const data: Record<string, unknown> = {
      slug: 'about',
      presetKey: 'about',
      presetContent: {},
      sections: [
        {
          blockType: 'heroSection',
          structuralKey: 'about-hero',
          eyebrow: 'Custom eyebrow',
          heading: 'Custom about heading',
          subheading: 'Custom subheading',
          primaryCtaLabel: 'CTA label',
          primaryCtaHref: '/cta',
        },
      ],
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    const sections = result.sections as Array<Record<string, unknown>>;
    const hero = sections.find((s) => s.structuralKey === 'about-hero') as Record<string, unknown>;

    expect(hero.eyebrow).toBe('Custom eyebrow');
    expect(hero.heading).toBe('Custom about heading');
    expect(hero.subheading).toBe('Custom subheading');
    expect(hero.primaryCtaLabel).toBe('CTA label');
    expect(hero.primaryCtaHref).toBe('/cta');
  });

  it('merges ctaSection string fields from incoming sections', async () => {
    const data: Record<string, unknown> = {
      slug: 'about',
      presetKey: 'about',
      presetContent: {},
      sections: [
        {
          blockType: 'ctaSection',
          structuralKey: 'about-cta',
          heading: 'Custom CTA heading',
          body: 'Custom CTA body',
          buttonLabel: 'Go',
          buttonHref: '/go',
        },
      ],
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    const sections = result.sections as Array<Record<string, unknown>>;
    const cta = sections.find((s) => s.structuralKey === 'about-cta') as Record<string, unknown>;

    expect(cta.heading).toBe('Custom CTA heading');
    expect(cta.body).toBe('Custom CTA body');
    expect(cta.buttonLabel).toBe('Go');
    expect(cta.buttonHref).toBe('/go');
  });

  it('template structural config is preserved when incoming section has no matching text', async () => {
    // Sending an empty section list — template values should be the fallback defaults
    const data: Record<string, unknown> = {
      slug: 'contact',
      presetKey: 'contact',
      presetContent: {},
      sections: [],
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    const sections = result.sections as Array<Record<string, unknown>>;

    // All 4 contact sections must exist with their structural keys
    expect(sections.map((s) => s.structuralKey)).toEqual([
      'contact-hero',
      'contact-guide-form',
      'contact-inquiry-form',
      'contact-privacy-note',
    ]);
  });

  it('preserves presetContent from previous save and merges with incoming', async () => {
    const originalDoc: Record<string, unknown> = {
      presetKey: 'about',
      presetContent: {
        about: {
          heroHeading: 'Saved hero heading',
        },
      },
      sections: [],
    };

    const data: Record<string, unknown> = {
      presetKey: 'about',
      presetContent: {
        about: {
          heroSubtext: 'New subtext only',
        },
      },
      sections: [],
    };

    const result = await applyCorePresetSections(
      makeHookArgs(data, originalDoc, 'update') as never,
    ) as Record<string, unknown>;
    const content = result.presetContent as Record<string, Record<string, unknown>>;

    // Both the saved and new fields should be present
    expect(content.about.heroHeading).toBe('Saved hero heading');
    expect(content.about.heroSubtext).toBe('New subtext only');
  });
});

// ---------------------------------------------------------------------------
// Slug-based preset resolution on create
// ---------------------------------------------------------------------------

describe('applyCorePresetSections — slug-based preset resolution', () => {
  it('resolves preset from slug when presetKey is not explicitly set on create', async () => {
    const data: Record<string, unknown> = {
      slug: 'services',
      sections: [],
      presetContent: {},
    };

    const result = await applyCorePresetSections(makeHookArgs(data) as never) as Record<string, unknown>;
    expect(result.presetKey).toBe('services');
    const sections = result.sections as Array<Record<string, unknown>>;
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].structuralKey).toBe('services-hero');
  });

  it('does not resolve preset from slug on update (only on create)', async () => {
    const data: Record<string, unknown> = {
      slug: 'services',
      sections: [],
      presetContent: {},
    };

    // update operation — should fall back to custom because no presetKey in data or originalDoc
    const result = await applyCorePresetSections(
      makeHookArgs(data, {}, 'update') as never,
    ) as Record<string, unknown>;
    // falls back to custom and returns equivalent data without in-place mutation
    expect(result).not.toBe(data);
    expect(result.slug).toBe('services');
    expect(result.presetContent).toEqual({});
    expect(result.sections).toEqual([]);
    expect(result.pageMode).toBe('builder');
  });
});
