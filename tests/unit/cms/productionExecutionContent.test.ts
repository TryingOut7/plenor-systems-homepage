import { describe, expect, it } from 'vitest';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';
import {
  DEFAULT_FOOTER_LEGAL_HREF,
  DEFAULT_HEADER_BUTTONS,
  DEFAULT_NAVIGATION_LINKS,
} from '@/lib/site-defaults';

describe('production execution content contract', () => {
  it('uses the approved Home structure and exact primary messaging', () => {
    const sections = buildCorePresetSections('home', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'home-hero',
      'home-divider-1',
      'home-problem',
      'home-divider-2',
      'home-solution',
      'home-divider-3',
      'home-capabilities',
    ]);
    expect(sections[0]).toMatchObject({
      eyebrow: 'From business idea to clear product definitions and specifications',
      heading: 'AI can build fast. Plenor helps build the right thing, the right way.',
      subheading: 'Plenor helps develop your business idea into clear product definitions, workflows, and functional specifications before building begins.',
      primaryCtaLabel: 'Explore Services',
      primaryCtaHref: '/services',
      secondaryCtaLabel: 'Contact Plenor',
      secondaryCtaHref: '/contact',
    });
    expect(JSON.stringify(sections[2])).toContain(
      'When definitions or requirements are unclear, Gen AI tools fill the gaps with assumptions. The result may look polished but still miss the business need.',
    );
    expect(JSON.stringify(sections[2])).toContain(
      'Strong product definitions and functional specifications require focused thinking and product management and business analysis expertise that many founders and startup teams may not have in-house.',
    );
    expect(sections[4]).toMatchObject({
      heading: 'You bring the product vision. Plenor helps turn it into a defined foundation.',
      subheading: 'You know your business, audience, and problem. The Plenor platform helps turn that knowledge into a defined product foundation.',
      features: [
        {
          title: 'You provide the product intent and direction',
          description: 'You define the product intent — the problem, audience, outcomes, priorities, and constraints.',
        },
        {
          title: 'Plenor helps you define the product foundations',
          description: 'The Plenor platform applies industry standards and best practices to help develop product definitions, workflows, and functional specifications.',
        },
      ],
    });
    expect(sections[6]).toMatchObject({
      subheading: 'Plenor helps create clearer, more consistent definitions and requirements for AI-assisted or traditional implementation.',
      actionLabel: 'Explore Services',
      actionHref: '/services',
      features: [
        expect.objectContaining({ title: 'Business and Product Definition' }),
        expect.objectContaining({ title: 'Product Experience and Workflow Definition' }),
        expect.objectContaining({ title: 'Functional Specifications' }),
      ],
    });
  });

  it('uses the approved Services structure and capability headings', () => {
    const sections = buildCorePresetSections('services', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'services-hero',
      'services-divider-1',
      'services-definition-levels',
      'services-divider-2',
      'services-work-development',
    ]);
    expect(sections[0]).toMatchObject({
      eyebrow: 'PLENOR SERVICES',
      heading: 'Plenor accelerates the development of product definitions and functional specifications.',
      subheading: 'You bring the product intent. Plenor helps turn it into clear product definitions, workflows, and functional specifications for Gen AI tools and implementation teams.',
      primaryCtaLabel: 'Discuss Your Product',
      primaryCtaHref: '/contact',
    });
    expect(sections[2]).toMatchObject({
      heading: 'From Product Intent to Functional Specifications',
      features: [
        expect.objectContaining({ title: 'Business and Product Definition', resultLabel: 'RESULT' }),
        expect.objectContaining({ title: 'Product Experience and Workflow Definition', resultLabel: 'RESULT' }),
        expect.objectContaining({ title: 'Functional Specifications', resultLabel: 'RESULT' }),
      ],
    });
    expect(sections[4]).toMatchObject({
      heading: 'How You Work with Plenor',
      subheading: 'You provide the product direction. The Plenor platform helps develop the foundation.',
      features: [
        {
          title: 'Your team',
          description: 'You provide the product direction, business and domain knowledge, priorities, constraints, and key decisions.',
        },
        {
          title: 'Plenor',
          description: 'The Plenor platform structures the information, identifies gaps, and applies industry standards and best practices to help develop the definitions and specifications.',
        },
      ],
      supportingNote: {
        heading: 'Review and Use',
        copy: 'You, your team, Plenor, or a combination can review the work. The resulting definitions and specifications can guide Gen AI tools and implementation teams.',
      },
    });
    expect(sections[4]).not.toHaveProperty('introParagraphs');
    expect(sections[4]).not.toHaveProperty('closingHeading');
    expect(sections[4]).not.toHaveProperty('closingCopy');
    expect(sections[4]).not.toHaveProperty('actionLabel');
    expect(sections[4]).not.toHaveProperty('actionHref');
  });

  it('uses the approved About copy without the removed bridge sentence', () => {
    const sections = buildCorePresetSections('about', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'about-hero',
      'about-divider-1',
      'about-why-built',
    ]);
    expect(sections[0]).toMatchObject({
      eyebrow: 'About Plenor Systems',
      heading: 'We help founders and startup teams lay a strong foundation for their products.',
      subheading: 'We created the Plenor platform to turn product ideas into clear definitions and functional specifications.',
    });
    expect(JSON.stringify(sections[2])).toContain(
      'Generative AI has made software faster to build, but unclear direction can produce the wrong result just as quickly.',
    );
    expect(JSON.stringify(sections[2])).toContain(
      'Strong products start with clarity about the problem, users, value, priorities, and constraints.',
    );
    expect(JSON.stringify(sections[2])).toContain(
      'We built Plenor to help founders and startup teams develop that foundation before implementation begins.',
    );
    expect(sections[2]).toMatchObject({
      subsections: [
        {
          heading: 'Gen AI applied purposefully',
          copy: 'Gen AI helps develop and organize product definitions, workflows, and functional requirements.',
        },
        {
          heading: 'Human judgment remains essential',
          copy: 'Business authority, professional judgment, key decisions, and final acceptance remain human responsibilities.',
        },
      ],
    });
    expect(JSON.stringify(sections[2])).not.toContain(
      'Plenor supports that work through purposeful use of generative AI and continued human judgment and responsibility.',
    );
  });

  it('places the Contact form directly after the hero boundary', () => {
    const sections = buildCorePresetSections('contact', {});

    expect(sections.map((section) => section.structuralKey)).toEqual([
      'contact-hero',
      'contact-divider-1',
      'contact-inquiry-form',
      'contact-divider-2',
      'contact-direct',
    ]);
    expect(JSON.stringify(sections)).not.toContain('A short description is enough to begin');
    expect(JSON.stringify(sections)).not.toContain('contact-guidance');
  });

  it('uses the approved navigation and privacy destination without a promotional header CTA', () => {
    expect(DEFAULT_HEADER_BUTTONS).toEqual([]);
    expect(DEFAULT_NAVIGATION_LINKS).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ]);
    expect(DEFAULT_FOOTER_LEGAL_HREF).toBe('/privacy-policy');
  });
});
