import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { buildCorePresetSections } from '../src/payload/presets/corePagePresets.ts';

type CoreSlug = 'home' | 'services' | 'about' | 'pricing' | 'contact';

type CorePage = {
  slug: CoreSlug;
  title: string;
};

const CORE_PAGES: CorePage[] = [
  { slug: 'home', title: 'Home' },
  { slug: 'services', title: 'Services' },
  { slug: 'about', title: 'About' },
  { slug: 'pricing', title: 'Pricing' },
  { slug: 'contact', title: 'Contact' },
];

const TOP_BLOCK_TABLES = [
  'hero',
  'richtext',
  'cta',
  'guide_form',
  'inquiry_form',
  'privacy_note',
  'simple_table',
  'cmp_table',
  'dyn_list',
  'reuse_sec_ref',
  'spacer',
  'divider',
  'legacy_hero',
  'legacy_narrative',
  'legacy_stage',
  'legacy_audience',
  'legacy_checklist',
  'legacy_quote',
  'legacy_cta',
  'img_sec',
  'vid_sec',
] as const;

function objectId() {
  return randomBytes(12).toString('hex');
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

async function clearBlocksForParent(client: pg.Client, parentId: number): Promise<void> {
  for (const table of TOP_BLOCK_TABLES) {
    await client.query(`delete from ${table} where _parent_id = $1`, [parentId]);
  }
}

async function insertSimpleTableSection(
  client: pg.Client,
  parentId: number,
  order: number,
  section: Record<string, unknown>,
): Promise<void> {
  const tableId = objectId();
  await client.query(
    `insert into simple_table (
      _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name, heading, block_name
    ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9)`,
    [
      order,
      parentId,
      tableId,
      text(section.theme) || 'white',
      text(section.size) || 'regular',
      text(section.anchorId),
      text(section.customClassName),
      text(section.heading),
      text(section.blockName),
    ],
  );

  const columns = asArray(section.columns);
  for (let i = 0; i < columns.length; i += 1) {
    const col = asObject(columns[i]);
    await client.query(
      `insert into stbl_cols (_order, _parent_id, id, label) values ($1,$2,$3,$4)`,
      [i + 1, tableId, objectId(), text(col.label) || ''],
    );
  }

  const rows = asArray(section.rows);
  for (let i = 0; i < rows.length; i += 1) {
    const row = asObject(rows[i]);
    const rowId = objectId();

    await client.query(
      `insert into stbl_rows (_order, _parent_id, id) values ($1,$2,$3)`,
      [i + 1, tableId, rowId],
    );

    const cells = asArray(row.cells);
    for (let j = 0; j < cells.length; j += 1) {
      const cell = asObject(cells[j]);
      await client.query(
        `insert into stbl_cells (_order, _parent_id, id, value) values ($1,$2,$3,$4)`,
        [j + 1, rowId, objectId(), text(cell.value)],
      );
    }
  }
}

async function insertSections(client: pg.Client, parentId: number, sections: Record<string, unknown>[]) {
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const order = i + 1;
    const blockType = text(section.blockType);

    if (blockType === 'heroSection') {
      await client.query(
        `insert into hero (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          eyebrow, heading, subheading, primary_cta_label, primary_cta_href, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.eyebrow),
          text(section.heading) || '',
          text(section.subheading),
          text(section.primaryCtaLabel),
          text(section.primaryCtaHref),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'richTextSection') {
      await client.query(
        `insert into richtext (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          heading, content, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9::jsonb,$10)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.heading),
          JSON.stringify(section.content ?? null),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'ctaSection') {
      await client.query(
        `insert into cta (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          heading, body, button_label, button_href, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.heading),
          text(section.body),
          text(section.buttonLabel),
          text(section.buttonHref),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'guideFormSection') {
      await client.query(
        `insert into guide_form (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          label, heading, highlight_text, body, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.label),
          text(section.heading),
          text(section.highlightText),
          text(section.body),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'inquiryFormSection') {
      await client.query(
        `insert into inquiry_form (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          label, heading, subtext, next_steps_label, next_steps_body,
          direct_email_label, email_address, linkedin_label, linkedin_href, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.label),
          text(section.heading),
          text(section.subtext),
          text(section.nextStepsLabel),
          text(section.nextStepsBody),
          text(section.directEmailLabel),
          text(section.emailAddress),
          text(section.linkedinLabel),
          text(section.linkedinHref),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'privacyNoteSection') {
      await client.query(
        `insert into privacy_note (
          _order, _parent_id, _path, id, theme, size, anchor_id, custom_class_name,
          label, policy_link_label, policy_link_href, block_name
        ) values ($1,$2,'sections',$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          order,
          parentId,
          objectId(),
          text(section.theme) || 'white',
          text(section.size) || 'regular',
          text(section.anchorId),
          text(section.customClassName),
          text(section.label),
          text(section.policyLinkLabel),
          text(section.policyLinkHref),
          text(section.blockName),
        ],
      );
      continue;
    }

    if (blockType === 'simpleTableSection') {
      await insertSimpleTableSection(client, parentId, order, section);
      continue;
    }
  }
}

async function run() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const deletedDuplicates: Array<{ id: number; slug: string }> = [];
  const upserted: Array<{ id: number; slug: string; action: 'created' | 'updated' }> = [];

  try {
    await client.query('begin');

    for (const core of CORE_PAGES) {
      const dup = await client.query(
        `delete from site_pages
         where slug ~ $1 and lower(title) = $2
         returning id, slug`,
        [`^${core.slug}-\\d+$`, core.title.toLowerCase()],
      );

      deletedDuplicates.push(...(dup.rows as Array<{ id: number; slug: string }>));
    }

    for (const core of CORE_PAGES) {
      const found = await client.query(
        `select id
         from site_pages
         where slug = $1
         order by
           case when deleted_at is null then 0 else 1 end,
           id asc
         limit 1`,
        [core.slug],
      );

      let pageId: number;
      let action: 'created' | 'updated';

      if (found.rows.length === 0) {
        const inserted = await client.query(
          `insert into site_pages (
             title, slug, page_mode, preset_key, preset_content,
             is_active, workflow_status, created_at, updated_at
           ) values (
             $1, $2, 'builder'::enum_site_pages_page_mode,
             $3::enum_site_pages_preset_key,
             jsonb_build_object($3, '{}'::jsonb),
             true, 'published', now(), now()
           )
           returning id`,
          [core.title, core.slug, core.slug],
        );

        pageId = inserted.rows[0].id as number;
        action = 'created';
      } else {
        pageId = found.rows[0].id as number;
        await client.query(
          `update site_pages
           set
             title = $1,
             slug = $2,
             page_mode = 'builder'::enum_site_pages_page_mode,
             preset_key = $3::enum_site_pages_preset_key,
             preset_content = jsonb_build_object($3, '{}'::jsonb),
             is_active = true,
             workflow_status = 'published',
             deleted_at = null,
             updated_at = now()
           where id = $4`,
          [core.title, core.slug, core.slug, pageId],
        );
        action = 'updated';
      }

      await clearBlocksForParent(client, pageId);

      const sections = buildCorePresetSections(core.slug, {});
      await insertSections(client, pageId, sections as Record<string, unknown>[]);

      upserted.push({ id: pageId, slug: core.slug, action });
    }

    await client.query('commit');

    const finalRows = await client.query(
      `select id, title, slug, preset_key::text as preset_key, workflow_status, is_active
       from site_pages
       where slug in ('home', 'services', 'about', 'pricing', 'contact')
       order by slug`,
    );

    console.log(
      JSON.stringify(
        {
          deletedDuplicates,
          upserted,
          finalCorePages: finalRows.rows,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
