import type { CollectionBeforeChangeHook } from 'payload';
import { buildCorePresetSections, type CorePresetKey } from '../presets/corePagePresets.ts';

const KNOWN_CORE_PRESETS = ['home', 'services', 'about', 'pricing', 'contact'] as const;

const STRING_MERGE_FIELDS_BY_BLOCK_TYPE: Record<string, readonly string[]> = {
  heroSection: [
    'sectionLabel',
    'eyebrow',
    'heading',
    'subheading',
    'primaryCtaLabel',
    'primaryCtaHref',
  ],
  ctaSection: ['sectionLabel', 'heading', 'body', 'buttonLabel', 'buttonHref'],
  formSection: ['sectionLabel', 'heading', 'subheading'],
  privacyNoteSection: ['sectionLabel', 'label', 'policyLinkLabel', 'policyLinkHref'],
  richTextSection: ['sectionLabel', 'heading'],
};

const OBJECT_MERGE_FIELDS_BY_BLOCK_TYPE: Record<string, readonly string[]> = {
  richTextSection: ['content'],
};

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (value && typeof value === 'object') {
    const cloned: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      cloned[key] = cloneValue(nestedValue);
    }
    return cloned as T;
  }

  return value;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asObjectArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asObject(entry))
    .filter((entry) => Object.keys(entry).length > 0);
}

async function readGlobalPresetContent(
  req: {
    payload?: {
      findGlobal?: (options: {
        slug: 'site-settings';
        depth: number;
        overrideAccess: boolean;
      }) => Promise<unknown>;
    };
  },
  presetKey: CorePresetKey,
): Promise<Record<string, unknown>> {
  if (presetKey === 'custom') return {};
  const findGlobal = req.payload?.findGlobal;
  if (!findGlobal) return {};

  try {
    const globalDoc = await findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    });
    const root = asObject((globalDoc as Record<string, unknown>)?.corePresetContent);
    return asObject(root[presetKey]);
  } catch {
    return {};
  }
}

function readSectionStructureSignature(
  sections: Array<Record<string, unknown>>,
): string[] {
  return sections.map((section) => {
    const blockType =
      typeof section.blockType === 'string' ? section.blockType : '';
    const structuralKey =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKey(section.structuralKey)
        : '';
    return `${blockType}::${structuralKey}`;
  });
}

function didPresetStructureChange(
  incomingSections: Array<Record<string, unknown>>,
  originalSections: Array<Record<string, unknown>>,
): boolean {
  const incomingSignature = readSectionStructureSignature(incomingSections);
  const originalSignature = readSectionStructureSignature(originalSections);
  if (incomingSignature.length !== originalSignature.length) return true;
  return incomingSignature.some((entry, index) => entry !== originalSignature[index]);
}

function hasOwnKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function normalizeStructuralKey(value: string): string {
  return value.replace(/\./g, '-');
}

function pickSectionByKey(
  sections: Array<Record<string, unknown>>,
  structuralKey: string,
  fallbackIndex: number,
  blockType: string,
): Record<string, unknown> {
  const normalizedTargetKey = normalizeStructuralKey(structuralKey);
  const byKey = sections.find(
    (s) =>
      typeof s.structuralKey === 'string' &&
      normalizeStructuralKey(s.structuralKey) === normalizedTargetKey,
  );
  if (byKey) return byKey;
  const candidate = asObject(sections[fallbackIndex]);
  if (candidate.blockType === blockType) return candidate;
  return {};
}

function setStringField(target: Record<string, unknown>, source: Record<string, unknown>, field: string): void {
  if (typeof source[field] === 'string') {
    target[field] = source[field];
  }
}

function setObjectField(target: Record<string, unknown>, source: Record<string, unknown>, field: string): void {
  if (source[field] && typeof source[field] === 'object' && !Array.isArray(source[field])) {
    target[field] = cloneValue(source[field]);
  }
}

function mergeFields(
  templateSection: Record<string, unknown>,
  sourceSection: Record<string, unknown>,
  stringFields: readonly string[],
  objectFields: readonly string[],
): Record<string, unknown> {
  const next = { ...templateSection };
  for (const field of stringFields) {
    setStringField(next, sourceSection, field);
  }
  for (const field of objectFields) {
    setObjectField(next, sourceSection, field);
  }
  return next;
}

function mergeSimpleTableSectionText(
  templateSection: Record<string, unknown>,
  sourceSection: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...templateSection };
  setStringField(next, sourceSection, 'sectionLabel');
  setStringField(next, sourceSection, 'heading');

  const templateColumns = asObjectArray(templateSection.columns);
  const sourceColumns = asObjectArray(sourceSection.columns);
  if (templateColumns.length > 0) {
    next.columns = templateColumns.map((column, columnIndex) => {
      const mergedColumn = { ...column };
      const sourceColumn = asObject(sourceColumns[columnIndex]);
      setStringField(mergedColumn, sourceColumn, 'label');
      return mergedColumn;
    });
  }

  const templateRows = asObjectArray(templateSection.rows);
  const sourceRows = asObjectArray(sourceSection.rows);
  if (templateRows.length > 0) {
    next.rows = templateRows.map((row, rowIndex) => {
      const mergedRow = { ...row };
      const templateCells = asObjectArray(row.cells);
      const sourceCells = asObjectArray(asObject(sourceRows[rowIndex]).cells);
      mergedRow.cells = templateCells.map((cell, cellIndex) => {
        const mergedCell = { ...cell };
        const sourceCell = asObject(sourceCells[cellIndex]);
        setStringField(mergedCell, sourceCell, 'value');
        return mergedCell;
      });
      return mergedRow;
    });
  }

  return next;
}

function mergePresetTextIntoTemplateSections(
  templateSections: Array<Record<string, unknown>>,
  incomingSections: Array<Record<string, unknown>>,
  originalSections: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  return templateSections.map((templateSection, index) => {
    const blockType = typeof templateSection.blockType === 'string' ? templateSection.blockType : '';
    if (!blockType) return templateSection;

    const structuralKey = typeof templateSection.structuralKey === 'string' ? templateSection.structuralKey : '';
    const incomingSection = pickSectionByKey(incomingSections, structuralKey, index, blockType);
    const originalSection = pickSectionByKey(originalSections, structuralKey, index, blockType);
    const sourceSection = hasOwnKeys(incomingSection) ? incomingSection : originalSection;
    if (!hasOwnKeys(sourceSection)) return templateSection;

    if (blockType === 'simpleTableSection') {
      return mergeSimpleTableSectionText(templateSection, sourceSection);
    }

    const stringFields = STRING_MERGE_FIELDS_BY_BLOCK_TYPE[blockType] ?? [];
    const objectFields = OBJECT_MERGE_FIELDS_BY_BLOCK_TYPE[blockType] ?? [];
    if (stringFields.length > 0 || objectFields.length > 0) {
      return mergeFields(templateSection, sourceSection, stringFields, objectFields);
    }

    return templateSection;
  });
}

async function resolveDefaultFormIds(): Promise<{
  guideFormId: number | string;
  inquiryFormId: number | string;
}> {
  const [{ getGuideFormId, getInquiryFormId }] = await Promise.all([
    import('../../lib/payload-form-stubs.ts'),
  ]);

  const [guideFormId, inquiryFormId] = await Promise.all([
    getGuideFormId(),
    getInquiryFormId(),
  ]);

  return { guideFormId, inquiryFormId };
}

async function resolvePresetFormAliases(
  sections: Array<Record<string, unknown>>,
  req: unknown,
): Promise<Array<Record<string, unknown>>> {
  if (!req || typeof req !== 'object' || !('payload' in (req as Record<string, unknown>))) {
    return sections;
  }

  const requiresGuide = sections.some((section) => section.blockType === 'formSection' && section.form === 'guide');
  const requiresInquiry = sections.some(
    (section) => section.blockType === 'formSection' && section.form === 'inquiry',
  );

  if (!requiresGuide && !requiresInquiry) return sections;

  let guideFormId: number | string;
  let inquiryFormId: number | string;
  try {
    const resolved = await resolveDefaultFormIds();
    guideFormId = resolved.guideFormId;
    inquiryFormId = resolved.inquiryFormId;
  } catch {
    // In test and offline contexts we keep aliases as-is. Runtime saves with
    // a healthy DB will resolve these IDs normally.
    return sections;
  }

  return sections.map((section) => {
    if (section.blockType !== 'formSection') return section;
    if (section.form === 'guide') {
      return { ...section, form: guideFormId };
    }
    if (section.form === 'inquiry') {
      return { ...section, form: inquiryFormId };
    }
    return section;
  });
}

function resolveKnownPreset(value: unknown): CorePresetKey | null {
  if (typeof value === 'string' && (KNOWN_CORE_PRESETS as readonly string[]).includes(value)) {
    return value as CorePresetKey;
  }
  return null;
}

function readSlug(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^\/+|\/+$/g, '');
}

function resolvePresetKey(
  incoming: Record<string, unknown>,
  originalDoc: Record<string, unknown>,
  operation: 'create' | 'update',
): CorePresetKey {
  const explicit = resolveKnownPreset(incoming.presetKey);
  if (explicit) return explicit;
  if (incoming.presetKey === 'custom') return 'custom';

  const original = resolveKnownPreset(originalDoc.presetKey);
  if (original) return original;
  if (originalDoc.presetKey === 'custom') return 'custom';

  if (operation === 'create') {
    const slug = readSlug(incoming.slug);
    const bySlug = resolveKnownPreset(slug);
    if (bySlug) return bySlug;
  }

  return 'custom';
}

export const applyCorePresetSections: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = cloneValue(data as Record<string, unknown>);
  const original = asObject(originalDoc);
  const presetKey = resolvePresetKey(incoming, original, operation);
  if (presetKey === 'custom') {
    return incoming;
  }

  const incomingRoot = asObject(incoming.presetContent);
  const existingRoot = asObject(original.presetContent);
  const mergedRoot = { ...existingRoot, ...incomingRoot };

  const globalPreset = await readGlobalPresetContent(req, presetKey);
  const incomingPreset = asObject(incomingRoot[presetKey]);
  const existingPreset = asObject(existingRoot[presetKey]);
  const mergedPreset = { ...globalPreset, ...existingPreset, ...incomingPreset };

  mergedRoot[presetKey] = mergedPreset;

  const templateSectionsWithAliases = buildCorePresetSections(presetKey, mergedPreset);
  const templateSections = await resolvePresetFormAliases(templateSectionsWithAliases, req);
  const incomingSections = asObjectArray(incoming.sections);
  const originalSections = asObjectArray(original.sections);

  if (
    operation === 'update' &&
    Array.isArray((data as Record<string, unknown>).sections) &&
    didPresetStructureChange(incomingSections, originalSections)
  ) {
    throw new Error(
      'Preset page structure is locked. You can edit text and media inside sections, but cannot add, remove, reorder, or swap section types.',
    );
  }

  return {
    ...incoming,
    presetContent: mergedRoot,
    presetKey,
    sections: mergePresetTextIntoTemplateSections(templateSections, incomingSections, originalSections),
  };
};
