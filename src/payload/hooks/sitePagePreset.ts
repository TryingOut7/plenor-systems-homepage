import type { CollectionBeforeChangeHook } from 'payload';
import { buildCorePresetSections, type CorePresetKey } from '../presets/corePagePresets';

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

function pickSectionByIndex(
  sections: Array<Record<string, unknown>>,
  index: number,
  blockType: string,
): Record<string, unknown> {
  const candidate = asObject(sections[index]);
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
    target[field] = source[field];
  }
}

function mergeSimpleTableSectionText(
  templateSection: Record<string, unknown>,
  sourceSection: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...templateSection };
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

    const incomingSection = pickSectionByIndex(incomingSections, index, blockType);
    const originalSection = pickSectionByIndex(originalSections, index, blockType);
    const sourceSection = Object.keys(incomingSection).length > 0 ? incomingSection : originalSection;
    if (Object.keys(sourceSection).length === 0) return templateSection;

    if (blockType === 'heroSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'eyebrow');
      setStringField(next, sourceSection, 'heading');
      setStringField(next, sourceSection, 'subheading');
      setStringField(next, sourceSection, 'primaryCtaLabel');
      setStringField(next, sourceSection, 'primaryCtaHref');
      return next;
    }

    if (blockType === 'richTextSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'heading');
      setObjectField(next, sourceSection, 'content');
      return next;
    }

    if (blockType === 'ctaSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'heading');
      setStringField(next, sourceSection, 'body');
      setStringField(next, sourceSection, 'buttonLabel');
      setStringField(next, sourceSection, 'buttonHref');
      return next;
    }

    if (blockType === 'guideFormSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'label');
      setStringField(next, sourceSection, 'heading');
      setStringField(next, sourceSection, 'highlightText');
      setStringField(next, sourceSection, 'body');
      return next;
    }

    if (blockType === 'inquiryFormSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'label');
      setStringField(next, sourceSection, 'heading');
      setStringField(next, sourceSection, 'subtext');
      setStringField(next, sourceSection, 'nextStepsLabel');
      setStringField(next, sourceSection, 'nextStepsBody');
      setStringField(next, sourceSection, 'directEmailLabel');
      setStringField(next, sourceSection, 'emailAddress');
      setStringField(next, sourceSection, 'linkedinLabel');
      setStringField(next, sourceSection, 'linkedinHref');
      return next;
    }

    if (blockType === 'privacyNoteSection') {
      const next = { ...templateSection };
      setStringField(next, sourceSection, 'label');
      setStringField(next, sourceSection, 'policyLinkLabel');
      setStringField(next, sourceSection, 'policyLinkHref');
      return next;
    }

    if (blockType === 'simpleTableSection') {
      return mergeSimpleTableSectionText(templateSection, sourceSection);
    }

    return templateSection;
  });
}

function resolveKnownPreset(value: unknown): CorePresetKey | null {
  if (value === 'home' || value === 'services' || value === 'about' || value === 'pricing' || value === 'contact') {
    return value;
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

export const applyCorePresetSections: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = data as Record<string, unknown>;
  const original = asObject(originalDoc);
  const presetKey = resolvePresetKey(incoming, original, operation);
  if (presetKey === 'custom') return incoming;

  const incomingRoot = asObject(incoming.presetContent);
  const existingRoot = asObject(original.presetContent);
  const mergedRoot = { ...existingRoot, ...incomingRoot };

  const incomingPreset = asObject(incomingRoot[presetKey]);
  const existingPreset = asObject(existingRoot[presetKey]);
  const mergedPreset = { ...existingPreset, ...incomingPreset };

  mergedRoot[presetKey] = mergedPreset;

  const templateSections = buildCorePresetSections(presetKey, mergedPreset);
  const incomingSections = asObjectArray(incoming.sections);
  const originalSections = asObjectArray(original.sections);

  incoming.presetContent = mergedRoot;
  incoming.presetKey = presetKey;
  incoming.sections = mergePresetTextIntoTemplateSections(templateSections, incomingSections, originalSections);

  return incoming;
};
