import type { PageSection } from '@/payload/cms';

export function asTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function findSection(
  sections: PageSection[],
  blockType: string,
  heading?: string,
): PageSection | undefined {
  return sections.find((section) => {
    if (section.blockType !== blockType) return false;
    if (!heading) return true;
    return String(section.heading || '').trim() === heading;
  });
}

export function findSectionsByType(sections: PageSection[], blockType: string): PageSection[] {
  return sections.filter((section) => section.blockType === blockType);
}

export function getRows(section: PageSection | undefined): unknown[] {
  if (!section || !Array.isArray(section.rows)) return [];
  return section.rows;
}

export function getCellValue(row: unknown, index: number): string {
  if (!row || typeof row !== 'object') return '';
  const cells = Array.isArray((row as Record<string, unknown>).cells)
    ? ((row as Record<string, unknown>).cells as unknown[])
    : [];
  const cell = cells[index];
  if (!cell || typeof cell !== 'object') return '';
  const value = (cell as Record<string, unknown>).value;
  return typeof value === 'string' ? value : '';
}

export function getRichTextParagraphs(section: PageSection | undefined): string[] {
  if (!section || !section.content || typeof section.content !== 'object') return [];
  const root = (section.content as Record<string, unknown>).root;
  if (!root || typeof root !== 'object') return [];
  const children = Array.isArray((root as Record<string, unknown>).children)
    ? ((root as Record<string, unknown>).children as unknown[])
    : [];

  const readText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return '';
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (!Array.isArray(record.children)) return '';
    return record.children.map(readText).join('');
  };

  return children
    .map(readText)
    .map((text) => text.trim())
    .filter(Boolean);
}
