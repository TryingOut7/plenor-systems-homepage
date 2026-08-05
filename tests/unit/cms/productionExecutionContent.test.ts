import { describe, expect, it } from 'vitest';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';
import { DEFAULT_BRAND_TAGLINE, DEFAULT_HEADER_BUTTONS } from '@/lib/site-defaults';

describe('production execution content contract', () => {
  it('uses the approved Home structure and exact primary messaging', () => {
    const sections = buildCorePresetSections('home', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'home-hero',
      'home-roles',
      'home-platform-capabilities',
      'home-use-definition',
    ]);
    expect(sections[0]).toMatchObject({
      heading: 'Turn Your Business Idea into Ready-to-Build Product and System Specifications',
      bullets: [
        'Articulate the business need',
        'Design the product experience',
        'Create the system specifications',
      ],
      supportingStatement: 'System-driven. Human-validated. Ready for implementation.',
    });
  });

  it('uses the approved Services structure and capability headings', () => {
    const sections = buildCorePresetSections('services', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'services-hero',
      'services-platform-capabilities',
      'services-professional-support',
    ]);
    expect(sections[1]).toMatchObject({
      heading: 'One Platform for Defining What Will Be Built',
      features: [
        expect.objectContaining({ title: 'Product Definition' }),
        expect.objectContaining({ title: 'User Experience and Workflow Definition' }),
        expect.objectContaining({ title: 'System Specifications' }),
      ],
    });
  });

  it('removes the promotional header CTA and uses the approved footer description', () => {
    expect(DEFAULT_HEADER_BUTTONS).toEqual([]);
    expect(DEFAULT_BRAND_TAGLINE).toBe(
      'A Governed Definition Platform for creating ready-to-build product and system specifications.',
    );
  });
});
