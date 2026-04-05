import crypto from 'node:crypto';
import type { CollectionBeforeChangeHook } from 'payload';

export const STRUCTURAL_KEY_PATTERN =
  /^[a-z][a-z0-9-]{2,63}$/;

const LEGACY_BASE_BY_BLOCK_TYPE: Record<string, string> = {
  legacyHeroSection: 'legacy-hero',
  legacyNarrativeSection: 'legacy-narrative',
  legacyNumberedStageSection: 'legacy-stage',
  legacyAudienceGridSection: 'legacy-audience-grid',
  legacyChecklistSection: 'legacy-checklist',
  legacyQuoteSection: 'legacy-quote',
  legacyCenteredCtaSection: 'legacy-centered-cta',
};

const LEGACY_BLOCK_TYPES = new Set(Object.keys(LEGACY_BASE_BY_BLOCK_TYPE));
export const INTERPRETIVE_LEGACY_BLOCK_TYPES = new Set([
  'legacyNumberedStageSection',
  'legacyAudienceGridSection',
  'legacyChecklistSection',
]);
const COMMON_SECTION_FIELDS = [
  'id',
  'theme',
  'sectionLabel',
  'backgroundColor',
  'size',
  'anchorId',
  'customClassName',
  'isHidden',
  'visibleFrom',
  'visibleUntil',
  'headingSize',
  'textAlign',
  'headingTag',
] as const;

type SectionRecord = Record<string, unknown>;

export type LegacyParityFailure = {
  index: number;
  blockType: string;
  structuralKey: string;
  reason: string;
};

export type LegacyMigrationResult = {
  sections: SectionRecord[];
  convertedCount: number;
  parityFailures: LegacyParityFailure[];
};

function asSectionArray(value: unknown): SectionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => ({ ...(entry as SectionRecord) }));
}

function normalizeToken(value: unknown, fallback: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;
  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return normalized || fallback;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(input).sort()) {
    output[key] = canonicalize(input[key]);
  }
  return output;
}

function fingerprint(section: SectionRecord): string {
  const semanticPayload = canonicalize({
    blockType: readString(section.blockType),
    heading: readString(section.heading),
    subheading: readString(section.subheading),
    body: readString(section.body),
    quote: readString(section.quote),
    stageLabel: readString(section.stageLabel),
    stageNumber: readString(section.stageNumber),
    whoForHeading: readString(section.whoForHeading),
    whoForBody: readString(section.whoForBody),
    items: readArray(section.items).map((entry) => ({
      item: readString(entry.item),
      title: readString(entry.title),
      description: readString(entry.description),
    })),
    paragraphs: readArray(section.paragraphs).map((entry) => ({
      paragraph: readString(entry.paragraph),
    })),
    audiences: readArray(section.audiences).map((entry) => ({
      label: readString(entry.label),
      copy: readString(entry.copy),
    })),
  });

  const encoded = JSON.stringify(semanticPayload);
  if (!encoded) return '';
  return crypto.createHash('sha256').update(encoded).digest('hex').slice(0, 6);
}

function lexicalRichTextFromParagraphs(paragraphs: string[]): Record<string, unknown> {
  const children = paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
      children: [
        {
          type: 'text',
          version: 1,
          text: paragraph,
          detail: 0,
          mode: 'normal',
          style: '',
          format: 0,
        },
      ],
    }));

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  };
}

function lexicalLinkParagraph(label: string, href: string): Record<string, unknown> {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [
      {
        type: 'link',
        version: 1,
        rel: 'noreferrer',
        target: null,
        title: null,
        url: href,
        fields: { url: href, linkType: 'custom' },
        children: [
          {
            type: 'text',
            version: 1,
            text: label,
            detail: 0,
            mode: 'normal',
            style: '',
            format: 0,
          },
        ],
      },
    ],
  };
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readArray(value: unknown): SectionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => entry as SectionRecord);
}

function copyCommonFields(section: SectionRecord): SectionRecord {
  const copied: SectionRecord = {};
  for (const key of COMMON_SECTION_FIELDS) {
    if (section[key] !== undefined) copied[key] = section[key];
  }
  return copied;
}

function extractSemanticTextForLegacy(section: SectionRecord): string {
  const text = [
    readString(section.heading),
    readString(section.subheading),
    readString(section.body),
    readString(section.quote),
    readString(section.stageLabel),
    readString(section.whoForBody),
  ];

  for (const entry of readArray(section.items)) {
    text.push(readString(entry.item));
    text.push(readString(entry.title));
    text.push(readString(entry.description));
  }

  for (const entry of readArray(section.paragraphs)) {
    text.push(readString(entry.paragraph));
  }

  for (const entry of readArray(section.audiences)) {
    text.push(readString(entry.label));
    text.push(readString(entry.copy));
  }

  return text.filter(Boolean).join('\n').trim();
}

function extractSemanticTextForModern(section: SectionRecord): string {
  const text = [
    readString(section.heading),
    readString(section.subheading),
    readString(section.body),
    readString(section.quote),
  ];

  if (section.content && typeof section.content === 'object') {
    const root = (section.content as SectionRecord).root;
    if (root && typeof root === 'object') {
      const children = Array.isArray((root as SectionRecord).children)
        ? ((root as SectionRecord).children as unknown[])
        : [];
      for (const child of children) {
        if (!child || typeof child !== 'object') continue;
        const nodes = Array.isArray((child as SectionRecord).children)
          ? ((child as SectionRecord).children as unknown[])
          : [];
        for (const node of nodes) {
          if (!node || typeof node !== 'object') continue;
          const value = (node as SectionRecord).text;
          if (typeof value === 'string') text.push(value);
        }
      }
    }
  }

  for (const entry of readArray(section.rows)) {
    for (const cell of readArray(entry.cells)) {
      text.push(readString(cell.value));
    }
  }

  for (const feature of readArray(section.features)) {
    text.push(readString(feature.title));
    text.push(readString(feature.description));
  }

  return text.filter(Boolean).join('\n').trim();
}

function normalizeSnapshotText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function buildLegacyBase(source: SectionRecord): string {
  return LEGACY_BASE_BY_BLOCK_TYPE[String(source.blockType)] || 'legacy-section';
}

function normalizeStructuralKey(value: string, fallback: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  const candidate = normalized || fallback;
  if (STRUCTURAL_KEY_PATTERN.test(candidate)) return candidate;
  const cleanedFallback = fallback
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return STRUCTURAL_KEY_PATTERN.test(cleanedFallback) ? cleanedFallback : 'legacy-section-01';
}

function appendDeterministicSuffix(key: string, suffixIndex: number): string {
  if (suffixIndex <= 1) return key;
  const suffix = `-${suffixIndex}`;
  const maxBaseLength = Math.max(3, 64 - suffix.length);
  const base = key.slice(0, maxBaseLength).replace(/-+$/g, '');
  return `${base}${suffix}`;
}

type LegacyKeyCandidate = {
  index: number;
  base: string;
  token: string;
  rawKey: string;
};

function buildLegacyKeyCandidate(source: SectionRecord, index: number): LegacyKeyCandidate {
  const existing = readString(source.structuralKey);
  if (existing && STRUCTURAL_KEY_PATTERN.test(existing) && existing.startsWith('legacy-')) {
    const parts = existing.split('-').filter(Boolean);
    const token = parts.length > 0 ? parts[parts.length - 1] : String(index + 1).padStart(2, '0');
    const base = parts.length > 1 ? parts.slice(0, -1).join('-') : 'legacy-section';
    return {
      index,
      base,
      token,
      rawKey: existing,
    };
  }

  const base = buildLegacyBase(source);
  const tokenFromId = normalizeToken(source.id, '');
  const tokenFromFingerprint = normalizeToken(fingerprint(source), '');
  const tokenFromOrdinal = String(index + 1).padStart(2, '0');
  const token = tokenFromId || tokenFromFingerprint || tokenFromOrdinal;

  const fallback = `${base}-${tokenFromOrdinal}`;
  const rawKey = normalizeStructuralKey(`${base}-${token}`, fallback);
  return {
    index,
    base,
    token,
    rawKey,
  };
}

function assignDeterministicLegacyKeys(
  candidates: LegacyKeyCandidate[],
  takenKeys: Set<string>,
): Map<number, string> {
  const assigned = new Map<number, string>();
  const sorted = [...candidates].sort(
    (a, b) =>
      a.base.localeCompare(b.base) ||
      a.token.localeCompare(b.token) ||
      a.index - b.index,
  );
  const suffixByRawKey = new Map<string, number>();

  for (const candidate of sorted) {
    const currentSuffix = suffixByRawKey.get(candidate.rawKey) || 1;
    let suffixIndex = currentSuffix;
    let candidateKey = appendDeterministicSuffix(candidate.rawKey, suffixIndex);

    while (!STRUCTURAL_KEY_PATTERN.test(candidateKey) || takenKeys.has(candidateKey)) {
      suffixIndex += 1;
      candidateKey = appendDeterministicSuffix(candidate.rawKey, suffixIndex);
    }

    assigned.set(candidate.index, candidateKey);
    takenKeys.add(candidateKey);
    suffixByRawKey.set(candidate.rawKey, suffixIndex + 1);
  }

  return assigned;
}

function convertLegacySection(section: SectionRecord): SectionRecord {
  const common = copyCommonFields(section);
  const blockType = String(section.blockType);

  if (blockType === 'legacyHeroSection') {
    return {
      ...common,
      blockType: 'heroSection',
      eyebrow: section.eyebrow,
      heading: section.heading,
      subheading: section.subheading,
      primaryCtaLabel: section.primaryCtaLabel,
      primaryCtaHref: section.primaryCtaHref,
      secondaryCtaLabel: section.secondaryCtaLabel,
      secondaryCtaHref: section.secondaryCtaHref,
    };
  }

  if (blockType === 'legacyNarrativeSection') {
    const paragraphs = readArray(section.paragraphs)
      .map((entry) => readString(entry.paragraph))
      .filter(Boolean);
    const linkLabel = readString(section.linkLabel);
    const linkHref = readString(section.linkHref);
    const base = lexicalRichTextFromParagraphs(paragraphs);
    const content =
      linkLabel && linkHref
        ? {
            root: {
              ...(base.root as Record<string, unknown>),
              children: [
                ...((base.root as Record<string, unknown>).children as unknown[]),
                lexicalLinkParagraph(linkLabel, linkHref),
              ],
            },
          }
        : base;
    return {
      ...common,
      blockType: 'richTextSection',
      heading: section.heading,
      content,
    };
  }

  if (blockType === 'legacyNumberedStageSection') {
    const stageLabel = readString(section.stageLabel) || 'Stage';
    const stageNumber = readString(section.stageNumber) || '01';
    const body = readString(section.body);
    const items = readArray(section.items)
      .map((entry) => readString(entry.item))
      .filter(Boolean)
      .map((entry) => `- ${entry}`);
    const whoForHeading = readString(section.whoForHeading);
    const whoForBody = readString(section.whoForBody);

    const paragraphs = [
      `${stageLabel} ${stageNumber}`.trim(),
      body,
      items.length > 0 ? 'What it covers:' : '',
      ...items,
      whoForHeading && whoForBody ? `${whoForHeading}: ${whoForBody}` : '',
    ].filter(Boolean);

    return {
      ...common,
      blockType: 'richTextSection',
      heading: section.heading,
      content: lexicalRichTextFromParagraphs(paragraphs),
    };
  }

  if (blockType === 'legacyAudienceGridSection') {
    const audiences = readArray(section.audiences);
    return {
      ...common,
      blockType: 'simpleTableSection',
      heading: section.heading,
      columns: [{ label: 'Audience' }, { label: 'Details' }],
      rows: audiences.map((entry) => ({
        cells: [{ value: readString(entry.label) }, { value: readString(entry.copy) }],
      })),
    };
  }

  if (blockType === 'legacyChecklistSection') {
    const items = readArray(section.items);
    return {
      ...common,
      blockType: 'featureGridSection',
      heading: section.heading,
      subheading: section.footerBody,
      columns: '2',
      features: items.map((entry) => ({
        title: readString(entry.title) || 'Item',
        description: readString(entry.description),
      })),
    };
  }

  if (blockType === 'legacyQuoteSection') {
    return {
      ...common,
      blockType: 'quoteSection',
      quote: section.quote,
      style: 'pull',
    };
  }

  if (blockType === 'legacyCenteredCtaSection') {
    const secondaryLabel = readString(section.secondaryLinkLabel);
    const secondaryHref = readString(section.secondaryLinkHref);
    const body = readString(section.body);
    const bodyWithSecondary =
      secondaryLabel && secondaryHref
        ? [body, `${secondaryLabel}: ${secondaryHref}`].filter(Boolean).join('\n')
        : body;
    return {
      ...common,
      blockType: 'ctaSection',
      heading: section.heading,
      body: bodyWithSecondary,
      buttonLabel: section.buttonLabel,
      buttonHref: section.buttonHref,
    };
  }

  return section;
}

function isLegacySection(section: SectionRecord): boolean {
  return LEGACY_BLOCK_TYPES.has(String(section.blockType));
}

export function migrateLegacySections(
  sectionsInput: unknown,
): LegacyMigrationResult {
  const sections = asSectionArray(sectionsInput);
  const takenKeys = new Set<string>();
  for (const section of sections) {
    const key = readString(section.structuralKey);
    if (key && STRUCTURAL_KEY_PATTERN.test(key)) {
      takenKeys.add(key);
    }
  }

  const candidates: LegacyKeyCandidate[] = [];
  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    if (!isLegacySection(section)) continue;
    candidates.push(buildLegacyKeyCandidate(section, index));
  }
  const assignedKeys = assignDeterministicLegacyKeys(candidates, takenKeys);

  let convertedCount = 0;
  const parityFailures: LegacyParityFailure[] = [];
  const nextSections = sections.map((section, index) => {
    if (!isLegacySection(section)) return section;

    const converted = convertLegacySection(section);
    const assignedKey = assignedKeys.get(index);
    const withKey = {
      ...converted,
      structuralKey: assignedKey || `legacy-section-${String(index + 1).padStart(2, '0')}`,
    };
    convertedCount += 1;

    const beforeText = extractSemanticTextForLegacy(section);
    const afterText = extractSemanticTextForModern(withKey);
    if (beforeText && !afterText) {
      parityFailures.push({
        index,
        blockType: String(section.blockType),
        structuralKey: readString(withKey.structuralKey) || `index-${index}`,
        reason: 'Converted section lost semantic text content.',
      });
      return withKey;
    }

    const normalizedBefore = normalizeSnapshotText(beforeText);
    const normalizedAfter = normalizeSnapshotText(afterText);
    if (normalizedBefore && normalizedAfter && normalizedBefore !== normalizedAfter) {
      parityFailures.push({
        index,
        blockType: String(section.blockType),
        structuralKey: readString(withKey.structuralKey) || `index-${index}`,
        reason: 'DOM snapshot parity mismatch between legacy and converted section.',
      });
    }

    return withKey;
  });

  return {
    sections: nextSections,
    convertedCount,
    parityFailures,
  };
}

export function hasLegacySections(sectionsInput: unknown): boolean {
  return asSectionArray(sectionsInput).some((section) => isLegacySection(section));
}

function legacySectionSignature(section: SectionRecord, index: number): string {
  const blockType = String(section.blockType || 'legacy-section');
  const id = readString(section.id);
  if (id) return `${blockType}:id:${id}`;
  return `${blockType}:index:${index}`;
}

function assertNoNewLegacySectionCreation(args: {
  operation: 'create' | 'update';
  incomingSections: SectionRecord[];
  originalSections: SectionRecord[];
}): void {
  const { operation, incomingSections, originalSections } = args;
  const incomingLegacy = incomingSections
    .map((section, index) => ({ section, index }))
    .filter((entry) => isLegacySection(entry.section));
  if (incomingLegacy.length === 0) return;

  if (operation === 'create') {
    throw new Error(
      'Legacy block creation is disabled during deprecation. Use modern section blocks only.',
    );
  }

  const originalLegacySignatures = new Set(
    originalSections
      .map((section, index) => ({ section, index }))
      .filter((entry) => isLegacySection(entry.section))
      .map((entry) => legacySectionSignature(entry.section, entry.index)),
  );

  for (const entry of incomingLegacy) {
    const signature = legacySectionSignature(entry.section, entry.index);
    if (!originalLegacySignatures.has(signature)) {
      throw new Error(
        'Legacy block creation is disabled during deprecation. Existing legacy blocks may only be converted.',
      );
    }
  }
}

export const migrateLegacySectionsBeforeChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (!data || typeof data !== 'object') return data;
  if (operation !== 'create' && operation !== 'update') return data;

  const incoming = { ...(data as SectionRecord) };
  const incomingSections = asSectionArray(incoming.sections);
  const originalSections = asSectionArray(
    originalDoc && typeof originalDoc === 'object'
      ? (originalDoc as SectionRecord).sections
      : [],
  );
  assertNoNewLegacySectionCreation({
    operation,
    incomingSections,
    originalSections,
  });

  const migration = migrateLegacySections(incoming.sections);
  if (migration.convertedCount === 0) return incoming;

  if (migration.parityFailures.length > 0) {
    const preview = migration.parityFailures
      .slice(0, 3)
      .map((failure) => `${failure.structuralKey}: ${failure.reason}`)
      .join(' | ');
    throw new Error(
      `Legacy section migration requires manual review before save. ${preview}`,
    );
  }

  return {
    ...incoming,
    sections: migration.sections,
  };
};
