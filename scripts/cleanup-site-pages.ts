import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

type AnyDoc = {
  id?: number | string;
  title?: string;
  slug?: string;
  presetContent?: Record<string, unknown>;
};

type CorePage = {
  slug: 'home' | 'services' | 'about' | 'pricing' | 'contact';
  title: string;
};

const CORE_PAGES: CorePage[] = [
  { slug: 'home', title: 'Home' },
  { slug: 'services', title: 'Services' },
  { slug: 'about', title: 'About' },
  { slug: 'pricing', title: 'Pricing' },
  { slug: 'contact', title: 'Contact' },
];

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalize(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

async function run() {
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: 'site-pages',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });

  const docs = (found.docs || []) as AnyDoc[];
  const deleted: Array<{ id: string; slug: string }> = [];
  const created: Array<{ id: string; slug: string }> = [];
  const updated: Array<{ id: string; slug: string }> = [];

  for (const core of CORE_PAGES) {
    const duplicatePattern = new RegExp(`^${core.slug}-\\d+$`);

    for (const doc of docs) {
      const slug = String(doc.slug || '');
      const title = normalize(doc.title);
      if (!duplicatePattern.test(slug)) continue;
      if (title !== normalize(core.title)) continue;

      const id = String(doc.id || '');
      if (!id) continue;

      await payload.delete({
        collection: 'site-pages',
        id,
        overrideAccess: true,
      });

      deleted.push({ id, slug });
    }
  }

  const refreshed = await payload.find({
    collection: 'site-pages',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });
  const rows = (refreshed.docs || []) as AnyDoc[];

  for (const core of CORE_PAGES) {
    const existing = rows.find((doc) => String(doc.slug || '') === core.slug);

    if (!existing?.id) {
      const createdDoc = await payload.create({
        collection: 'site-pages',
        data: {
          title: core.title,
          slug: core.slug,
          pageMode: 'builder',
          presetKey: core.slug,
          presetContent: { [core.slug]: {} },
          isActive: true,
          workflowStatus: 'published',
        },
        overrideAccess: true,
      });

      created.push({ id: String((createdDoc as { id?: string | number }).id || ''), slug: core.slug });
      continue;
    }

    const id = String(existing.id);
    const root = asObject(existing.presetContent);
    const coreContent = asObject(root[core.slug]);

    await payload.update({
      collection: 'site-pages',
      id,
      data: {
        title: core.title,
        slug: core.slug,
        pageMode: 'builder',
        presetKey: core.slug,
        presetContent: {
          ...root,
          [core.slug]: coreContent,
        },
        isActive: true,
      },
      overrideAccess: true,
    });

    updated.push({ id, slug: core.slug });
  }

  const finalRows = await payload.find({
    collection: 'site-pages',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });

  const summary = (finalRows.docs || [])
    .map((doc) => {
      const d = doc as Record<string, unknown>;
      return {
        id: String(d.id || ''),
        slug: String(d.slug || ''),
        title: String(d.title || ''),
        presetKey: String(d.presetKey || ''),
        isActive: Boolean(d.isActive),
        workflowStatus: String(d.workflowStatus || ''),
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(
    JSON.stringify(
      {
        deleted,
        created,
        updated,
        final: summary,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
