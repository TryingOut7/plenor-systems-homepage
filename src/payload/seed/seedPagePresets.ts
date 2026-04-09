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

type SectionRecord = Record<string, unknown>;

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

function asSectionArray(value: unknown): SectionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => ({ ...(entry as SectionRecord) }));
}

function normalizeStructuralKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\./g, '-');
}

function readRelationId(value: unknown): number | string | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const id = (value as Record<string, unknown>).id;
  if (typeof id === 'number') return id;
  if (typeof id === 'string' && id.trim()) return id.trim();
  return null;
}

function buildSectionLookupKey(section: SectionRecord, index: number): string {
  const structuralKey = normalizeStructuralKey(section.structuralKey);
  if (structuralKey) return structuralKey;

  const blockType = typeof section.blockType === 'string' ? section.blockType.trim() : 'section';
  return `${blockType}:${index}`;
}

function repairPresetFormSections(args: {
  currentSections: SectionRecord[];
  generatedSections: SectionRecord[];
}): { didRepair: boolean; sections: SectionRecord[] } {
  const templateSectionsByKey = new Map<string, SectionRecord>();
  for (const [index, section] of args.generatedSections.entries()) {
    templateSectionsByKey.set(buildSectionLookupKey(section, index), section);
  }

  let didRepair = false;
  const sections = args.currentSections.map((section, index) => {
    if (section.blockType !== 'formSection') return section;

    const templateSection = templateSectionsByKey.get(buildSectionLookupKey(section, index));
    if (!templateSection || templateSection.blockType !== 'formSection') return section;

    const currentForm = section.form;
    const templateForm = templateSection.form;
    const currentFormId = readRelationId(currentForm);
    const needsRepair =
      templateForm != null &&
      (currentForm == null ||
        currentForm === 'guide' ||
        currentForm === 'inquiry' ||
        currentFormId == null);

    if (!needsRepair) return section;

    didRepair = true;
    return {
      ...section,
      form: templateForm,
    };
  });

  return {
    didRepair,
    sections,
  };
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
      const currentSections = asSectionArray(current.sections);
      const hasSections = currentSections.length > 0;
      const repaired = repairPresetFormSections({
        currentSections,
        generatedSections,
      });

      if (!hasSections || repaired.didRepair) {
        await payload.update({
          collection: 'page-presets',
          id: String(current.id),
          data: {
            category: 'core',
            description: preset.description,
            structureMode: 'locked',
            tags: toTagRows(preset.tags),
            sections: hasSections ? repaired.sections : generatedSections,
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
