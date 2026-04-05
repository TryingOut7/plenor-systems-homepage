import { getPayload } from '@/payload/client';
import { buildCorePresetSections } from '../presets/corePagePresets.ts';

type CorePreset = 'home' | 'services' | 'about' | 'pricing' | 'contact';

type SeedPage = {
  slug: string;
  title: string;
  presetKey: CorePreset;
  presetContent: Record<string, unknown>;
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
    presetKey: 'home',
    presetContent: {},
  },
  {
    slug: 'about',
    title: 'About',
    presetKey: 'about',
    presetContent: {},
  },
  {
    slug: 'services',
    title: 'Services',
    presetKey: 'services',
    presetContent: {},
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    presetKey: 'pricing',
    presetContent: {},
  },
  {
    slug: 'contact',
    title: 'Contact',
    presetKey: 'contact',
    presetContent: {},
  },
];

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function buildPresetRoot(
  existingRoot: unknown,
  presetKey: CorePreset,
  presetContent: Record<string, unknown>,
): Record<string, unknown> {
  const root = asObject(existingRoot);
  const existingPreset = asObject(root[presetKey]);

  return {
    ...root,
    [presetKey]: {
      ...existingPreset,
      ...presetContent,
    },
  };
}

export async function seedSitePages(): Promise<SeedSitePagesResult> {
  const payload = await getPayload();
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  });
  const globalPresetRoot = asObject((siteSettings as Record<string, unknown>)?.corePresetContent);

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

    const current = found.docs[0] as {
      id?: string;
      sections?: unknown;
      presetContent?: unknown;
    } | undefined;

    const globalPresetContent = asObject(globalPresetRoot[page.presetKey]);
    const presetRoot = buildPresetRoot(
      current?.presetContent,
      page.presetKey,
      { ...globalPresetContent, ...page.presetContent },
    );
    const generatedSections = buildCorePresetSections(page.presetKey, asObject(presetRoot[page.presetKey]));

    if (current?.id) {
      const hasSections = Array.isArray(current.sections) && current.sections.length > 0;
      if (!hasSections) {
        await payload.update({
          collection: 'site-pages',
          id: String(current.id),
          data: {
            presetKey: page.presetKey,
            presetContent: presetRoot,
            isActive: true,
            sections: generatedSections,
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
        presetKey: page.presetKey,
        presetContent: presetRoot,
        isActive: true,
        sections: generatedSections,
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
