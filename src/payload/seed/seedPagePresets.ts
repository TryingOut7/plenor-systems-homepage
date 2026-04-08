import type { RequiredDataFromCollectionSlug } from 'payload';
import { getPayload } from '@/payload/client';
import {
  getGuideFormId,
  getInquiryFormId,
} from '@/lib/payload-form-stubs';
import { buildCorePresetSections } from '../presets/corePagePresets.ts';

type CorePreset = 'home' | 'services' | 'about' | 'pricing' | 'contact';

type SeedPagePreset = {
  name: string;
  description: string;
  presetKey: CorePreset;
  tags: string[];
};

type SeedPagePresetItem = {
  presetKey: CorePreset;
  name: string;
  action: 'created' | 'hydrated' | 'exists';
  id: string;
};

export type SeedPagePresetsResult = {
  created: number;
  hydrated: number;
  existing: number;
  items: SeedPagePresetItem[];
};

const DEFAULT_PAGE_PRESETS: SeedPagePreset[] = [
  {
    presetKey: 'home',
    name: 'Home Template',
    description: 'Core section template for the Home page.',
    tags: ['core', 'home'],
  },
  {
    presetKey: 'about',
    name: 'About Template',
    description: 'Core section template for the About page.',
    tags: ['core', 'about'],
  },
  {
    presetKey: 'services',
    name: 'Services Template',
    description: 'Core section template for the Services page.',
    tags: ['core', 'services'],
  },
  {
    presetKey: 'pricing',
    name: 'Pricing Template',
    description: 'Core section template for the Pricing page.',
    tags: ['core', 'pricing'],
  },
  {
    presetKey: 'contact',
    name: 'Contact Template',
    description: 'Core section template for the Contact page.',
    tags: ['core', 'contact'],
  },
];

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

async function resolveFormAliases(
  sections: Array<Record<string, unknown>>,
): Promise<Array<Record<string, unknown>>> {
  const requiresGuide = sections.some(
    (section) => section.blockType === 'formSection' && section.form === 'guide',
  );
  const requiresInquiry = sections.some(
    (section) => section.blockType === 'formSection' && section.form === 'inquiry',
  );

  if (!requiresGuide && !requiresInquiry) {
    return sections;
  }

  const [guideFormId, inquiryFormId] = await Promise.all([
    requiresGuide ? getGuideFormId() : Promise.resolve(null),
    requiresInquiry ? getInquiryFormId() : Promise.resolve(null),
  ]);

  return sections.map((section) => {
    if (section.blockType !== 'formSection') return section;
    if (section.form === 'guide' && guideFormId) {
      return { ...section, form: guideFormId };
    }
    if (section.form === 'inquiry' && inquiryFormId) {
      return { ...section, form: inquiryFormId };
    }
    return section;
  });
}

function toTagRows(tags: string[]): Array<{ tag: string }> {
  return tags.map((tag) => ({ tag }));
}

export async function seedPagePresets(): Promise<SeedPagePresetsResult> {
  const payload = await getPayload();
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  });
  const globalPresetRoot = asObject(
    (siteSettings as unknown as Record<string, unknown>)?.corePresetContent,
  );

  const items: SeedPagePresetItem[] = [];
  let created = 0;
  let hydrated = 0;
  let existing = 0;

  for (const preset of DEFAULT_PAGE_PRESETS) {
    const presetContent = asObject(globalPresetRoot[preset.presetKey]);
    const baseSections = buildCorePresetSections(
      preset.presetKey,
      presetContent,
    );
    const generatedSections = await resolveFormAliases(
      baseSections.map((section) => ({ ...section })),
    );

    const found = await payload.find({
      collection: 'page-presets',
      where: { name: { equals: preset.name } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const current = found.docs[0] as unknown as
      | {
          id?: string | number;
          sections?: unknown;
        }
      | undefined;

    if (current?.id) {
      const hasSections =
        Array.isArray(current.sections) && current.sections.length > 0;
      if (!hasSections) {
        await payload.update({
          collection: 'page-presets',
          id: String(current.id),
          data: {
            category: 'core',
            description: preset.description,
            structureMode: 'locked',
            tags: toTagRows(preset.tags),
            sections: generatedSections,
          } as unknown as RequiredDataFromCollectionSlug<'page-presets'>,
          overrideAccess: true,
        });

        hydrated += 1;
        items.push({
          presetKey: preset.presetKey,
          name: preset.name,
          action: 'hydrated',
          id: String(current.id),
        });
      } else {
        existing += 1;
        items.push({
          presetKey: preset.presetKey,
          name: preset.name,
          action: 'exists',
          id: String(current.id),
        });
      }
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'page-presets',
      data: {
        name: preset.name,
        category: 'core',
        description: preset.description,
        tags: toTagRows(preset.tags),
        structureMode: 'locked',
        sections: generatedSections,
        sourceType: 'manual',
      } as unknown as RequiredDataFromCollectionSlug<'page-presets'>,
      overrideAccess: true,
    });

    created += 1;
    items.push({
      presetKey: preset.presetKey,
      name: preset.name,
      action: 'created',
      id: String((createdDoc as { id?: string | number }).id ?? ''),
    });
  }

  return {
    created,
    hydrated,
    existing,
    items,
  };
}
