import type { CollectionBeforeChangeHook } from 'payload';
import { buildCorePresetSections } from '../presets/corePagePresets.ts';
import { STRUCTURAL_KEY_PATTERN, hasLegacySections } from './legacySectionMigration.ts';

type SitePagePreset = 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';
type GuardSeverity = 'ERROR_SAVE' | 'ERROR_PUBLISH' | 'WARN' | 'INFO';
type SectionRecord = Record<string, unknown>;
type GuardLifecycleEvent =
  | 'draft_save'
  | 'submit_for_review'
  | 'approve'
  | 'publish'
  | 'scheduled_publish_execution'
  | 'update_published_document';

type GuardRule = {
  preset: Exclude<SitePagePreset, 'custom'>;
  structuralKey: string;
  severity: GuardSeverity;
  message: string;
  validate: (section: SectionRecord) => boolean;
};
export type SitePageGuardRule = GuardRule;
type GuardFailuresBySeverity = Record<GuardSeverity, string[]>;
type PublishQualityLevel = 'excellent' | 'good' | 'needs_attention' | 'blocked';

const corePresets: Array<Exclude<SitePagePreset, 'custom'>> = [
  'home',
  'services',
  'about',
  'pricing',
  'contact',
];

const completenessRules: GuardRule[] = [
  // ── home ──────────────────────────────────────────────────────────────────
  {
    preset: 'home',
    structuralKey: 'home-hero',
    severity: 'ERROR_PUBLISH',
    message: 'home-hero.heading is required.',
    validate: (section) => typeof section.heading === 'string' && section.heading.trim().length > 0,
  },
  {
    preset: 'home',
    structuralKey: 'home-hero',
    severity: 'ERROR_PUBLISH',
    message: 'home-hero.primaryCtaHref is required when primaryCtaLabel is set.',
    validate: (section) => {
      const label = typeof section.primaryCtaLabel === 'string' ? section.primaryCtaLabel.trim() : '';
      if (!label) return true;
      return typeof section.primaryCtaHref === 'string' && section.primaryCtaHref.trim().length > 0;
    },
  },
  // ── services ──────────────────────────────────────────────────────────────
  {
    preset: 'services',
    structuralKey: 'services-hero',
    severity: 'ERROR_PUBLISH',
    message: 'services-hero.heading is required.',
    validate: (section) => typeof section.heading === 'string' && section.heading.trim().length > 0,
  },
  {
    preset: 'services',
    structuralKey: 'services-testing-coverage',
    severity: 'ERROR_PUBLISH',
    message: 'services-testing-coverage requires at least one row.',
    validate: (section) => Array.isArray(section.rows) && section.rows.length > 0,
  },
  {
    preset: 'services',
    structuralKey: 'services-launch-coverage',
    severity: 'ERROR_PUBLISH',
    message: 'services-launch-coverage requires at least one row.',
    validate: (section) => Array.isArray(section.rows) && section.rows.length > 0,
  },
  // ── about ─────────────────────────────────────────────────────────────────
  {
    preset: 'about',
    structuralKey: 'about-hero',
    severity: 'ERROR_PUBLISH',
    message: 'about-hero.heading is required.',
    validate: (section) => typeof section.heading === 'string' && section.heading.trim().length > 0,
  },
  {
    preset: 'about',
    structuralKey: 'about-cta',
    severity: 'WARN',
    message: 'about-cta.buttonHref is recommended.',
    validate: (section) => typeof section.buttonHref === 'string' && section.buttonHref.trim().length > 0,
  },
  // ── pricing ───────────────────────────────────────────────────────────────
  {
    preset: 'pricing',
    structuralKey: 'pricing-table-included',
    severity: 'ERROR_PUBLISH',
    message: 'pricing-table-included requires at least one row.',
    validate: (section) => Array.isArray(section.rows) && section.rows.length > 0,
  },
  // ── contact ───────────────────────────────────────────────────────────────
  {
    preset: 'contact',
    structuralKey: 'contact-privacy-note',
    severity: 'ERROR_PUBLISH',
    message: 'contact-privacy-note requires policyLinkLabel.',
    validate: (section) =>
      typeof section.policyLinkLabel === 'string' &&
      section.policyLinkLabel.trim().length > 0,
  },
  {
    preset: 'contact',
    structuralKey: 'contact-privacy-note',
    severity: 'ERROR_PUBLISH',
    message: 'contact-privacy-note requires policyLinkHref.',
    validate: (section) =>
      typeof section.policyLinkHref === 'string' &&
      section.policyLinkHref.trim().length > 0,
  },
];

function asObject(value: unknown): SectionRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as SectionRecord;
}

function asSectionArray(value: unknown): SectionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => ({ ...(entry as SectionRecord) }));
}

function normalizeStructuralKeyValue(value: string): string {
  return value
    .trim()
    .replace(/\./g, '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function normalizeSectionStructuralKeys(sections: SectionRecord[]): SectionRecord[] {
  return sections.map((section) => {
    const key = typeof section.structuralKey === 'string' ? section.structuralKey : '';
    if (!key) return section;
    const normalized = normalizeStructuralKeyValue(key);
    if (!normalized || normalized === key) return section;
    return {
      ...section,
      structuralKey: normalized,
    };
  });
}

function applyTemplateStructuralKeys(
  preset: SitePagePreset,
  sections: SectionRecord[],
  precomputedTemplateSections?: unknown[],
): SectionRecord[] {
  if (!corePresets.includes(preset as Exclude<SitePagePreset, 'custom'>)) return sections;

  const templateSections =
    precomputedTemplateSections ??
    buildCorePresetSections(preset as Exclude<SitePagePreset, 'custom'>, {});

  return sections.map((section, index) => {
    const currentKey =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKeyValue(section.structuralKey)
        : '';
    if (currentKey) {
      if (currentKey === section.structuralKey) return section;
      return {
        ...section,
        structuralKey: currentKey,
      };
    }

    const templateSection = templateSections[index] as SectionRecord | undefined;
    if (!templateSection) return section;

    const sectionBlockType =
      typeof section.blockType === 'string' ? section.blockType : '';
    const templateBlockType =
      typeof templateSection.blockType === 'string' ? templateSection.blockType : '';
    if (!sectionBlockType || !templateBlockType || sectionBlockType !== templateBlockType) {
      return section;
    }

    const templateKey =
      typeof templateSection.structuralKey === 'string'
        ? normalizeStructuralKeyValue(templateSection.structuralKey)
        : '';
    if (!templateKey) return section;

    return {
      ...section,
      structuralKey: templateKey,
    };
  });
}

function resolvePresetKey(incoming: SectionRecord, original: SectionRecord): SitePagePreset {
  const incomingValue = incoming.presetKey;
  if (
    incomingValue === 'custom' ||
    incomingValue === 'home' ||
    incomingValue === 'services' ||
    incomingValue === 'about' ||
    incomingValue === 'pricing' ||
    incomingValue === 'contact'
  ) {
    return incomingValue;
  }

  const originalValue = original.presetKey;
  if (
    originalValue === 'custom' ||
    originalValue === 'home' ||
    originalValue === 'services' ||
    originalValue === 'about' ||
    originalValue === 'pricing' ||
    originalValue === 'contact'
  ) {
    return originalValue;
  }

  return 'custom';
}

function resolveGuardLifecycleEvent(args: {
  oldStatus: string;
  newStatus: string;
  req: unknown;
  context: unknown;
}): GuardLifecycleEvent {
  const { oldStatus, newStatus, req, context } = args;
  if (oldStatus === 'published') return 'update_published_document';
  if (newStatus === 'in_review' && oldStatus !== 'in_review') return 'submit_for_review';
  if (newStatus === 'approved' && oldStatus !== 'approved') return 'approve';
  if (newStatus === 'published' && oldStatus !== 'published') {
    const contextRecord = context && typeof context === 'object'
      ? (context as Record<string, unknown>)
      : {};
    const requestRecord = req && typeof req === 'object' ? (req as Record<string, unknown>) : {};
    const hasUser = !!requestRecord.user;
    const scheduledFlag =
      contextRecord.scheduledPublish === true ||
      contextRecord.isScheduledExecution === true ||
      contextRecord.scheduler === true;
    if (!hasUser || scheduledFlag) {
      return 'scheduled_publish_execution';
    }
    return 'publish';
  }
  return 'draft_save';
}

function isPublishLifecycleEvent(event: GuardLifecycleEvent): boolean {
  return (
    event === 'submit_for_review' ||
    event === 'approve' ||
    event === 'publish' ||
    event === 'scheduled_publish_execution' ||
    event === 'update_published_document'
  );
}

function getSectionByStructuralKey(sections: SectionRecord[]): Map<string, SectionRecord> {
  const map = new Map<string, SectionRecord>();
  for (const section of sections) {
    const key = typeof section.structuralKey === 'string'
      ? normalizeStructuralKeyValue(section.structuralKey)
      : '';
    if (!key) continue;
    map.set(key, section);
  }
  return map;
}

function validateStructuralKeys(
  sections: SectionRecord[],
  originalSections: SectionRecord[],
  preset: SitePagePreset,
  precomputedTemplateSections?: unknown[],
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const section of sections) {
    const structuralKey =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKeyValue(section.structuralKey)
        : '';
    if (!structuralKey) continue;
    if (!STRUCTURAL_KEY_PATTERN.test(structuralKey)) {
      errors.push(`Invalid structuralKey format: "${structuralKey}".`);
      continue;
    }
    if (seen.has(structuralKey)) {
      errors.push(`Duplicate structuralKey detected: "${structuralKey}".`);
      continue;
    }
    seen.add(structuralKey);
  }

  const originalById = new Map<string, SectionRecord>();
  for (const section of originalSections) {
    const id = section.id;
    if (typeof id === 'string' && id.trim()) originalById.set(id, section);
  }

  for (const section of sections) {
    const id = section.id;
    if (typeof id !== 'string' || !id.trim()) continue;
    const previous = originalById.get(id);
    if (!previous) continue;

    const previousKey =
      typeof previous.structuralKey === 'string'
        ? normalizeStructuralKeyValue(previous.structuralKey)
        : '';
    const nextKey =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKeyValue(section.structuralKey)
        : '';
    if (!previousKey || !nextKey) continue;

    const isLegacyOwned = previousKey.startsWith('legacy-');
    if (isLegacyOwned && previousKey !== nextKey) {
      errors.push(`Migrated structuralKey is immutable: "${previousKey}".`);
    }
  }

  if (!corePresets.includes(preset as Exclude<SitePagePreset, 'custom'>)) return errors;

  const templateSections =
    precomputedTemplateSections ??
    buildCorePresetSections(preset as Exclude<SitePagePreset, 'custom'>, {});
  const expectedKeys = new Set(
    templateSections
      .map((section) =>
        typeof (section as SectionRecord).structuralKey === 'string'
          ? ((section as SectionRecord).structuralKey as string).trim()
          : '',
      )
      .filter(Boolean),
  );

  for (const section of sections) {
    const structuralKey =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKeyValue(section.structuralKey)
        : '';
    if (!structuralKey) {
      errors.push('Core preset sections must include structuralKey.');
      continue;
    }
    if (!expectedKeys.has(structuralKey)) {
      errors.push(`Unexpected structuralKey for ${preset} preset: "${structuralKey}".`);
    }
  }

  for (const key of expectedKeys) {
    if (!seen.has(key)) {
      errors.push(`Missing required structuralKey for ${preset} preset: "${key}".`);
    }
  }

  return errors;
}

function runCompletenessRules(
  preset: SitePagePreset,
  sections: SectionRecord[],
  rules: GuardRule[] = completenessRules,
) {
  const failuresBySeverity: GuardFailuresBySeverity = {
    ERROR_SAVE: [],
    ERROR_PUBLISH: [],
    WARN: [],
    INFO: [],
  };
  const byKey = getSectionByStructuralKey(sections);

  for (const rule of rules) {
    if (rule.preset !== preset) continue;
    const section = byKey.get(rule.structuralKey);
    if (!section) {
      failuresBySeverity[rule.severity].push(
        `${rule.structuralKey}: section missing for rule check.`,
      );
      continue;
    }
    if (!rule.validate(section)) {
      failuresBySeverity[rule.severity].push(`${rule.structuralKey}: ${rule.message}`);
    }
  }

  return failuresBySeverity;
}

function buildPreviewDiffSummary(
  preset: SitePagePreset,
  sections: SectionRecord[],
  precomputedTemplateSections?: unknown[],
): Record<string, unknown> {
  if (!corePresets.includes(preset as Exclude<SitePagePreset, 'custom'>)) {
    return {
      mode: 'custom',
      status: 'not_applicable',
      missingStructuralKeys: [],
      unexpectedStructuralKeys: [],
      blockTypeMismatches: [],
    };
  }

  const templateSections =
    precomputedTemplateSections ??
    buildCorePresetSections(preset as Exclude<SitePagePreset, 'custom'>, {});
  const expectedByKey = new Map<string, string>();
  for (const section of templateSections) {
    const record = section as SectionRecord;
    const key =
      typeof record.structuralKey === 'string'
        ? normalizeStructuralKeyValue(record.structuralKey)
        : '';
    const blockType = typeof record.blockType === 'string' ? record.blockType : '';
    if (!key || !blockType) continue;
    expectedByKey.set(key, blockType);
  }

  const actualByKey = new Map<string, string>();
  for (const section of sections) {
    const key =
      typeof section.structuralKey === 'string'
        ? normalizeStructuralKeyValue(section.structuralKey)
        : '';
    const blockType = typeof section.blockType === 'string' ? section.blockType : '';
    if (!key || !blockType) continue;
    actualByKey.set(key, blockType);
  }

  const missingStructuralKeys = [...expectedByKey.keys()].filter((key) => !actualByKey.has(key));
  const unexpectedStructuralKeys = [...actualByKey.keys()].filter((key) => !expectedByKey.has(key));
  const blockTypeMismatches = [...expectedByKey.entries()]
    .filter(([key, expectedBlockType]) => {
      const actual = actualByKey.get(key);
      return !!actual && actual !== expectedBlockType;
    })
    .map(([key, expectedBlockType]) => ({
      structuralKey: key,
      expectedBlockType,
      actualBlockType: actualByKey.get(key),
    }));

  return {
    mode: 'preset',
    preset,
    status:
      missingStructuralKeys.length === 0 &&
      unexpectedStructuralKeys.length === 0 &&
      blockTypeMismatches.length === 0
        ? 'clean'
        : 'drift_detected',
    missingStructuralKeys,
    unexpectedStructuralKeys,
    blockTypeMismatches,
  };
}

function buildPublishQualityScore(args: {
  structuralErrors: string[];
  completeness: GuardFailuresBySeverity;
}): { score: number; level: PublishQualityLevel } {
  const { structuralErrors, completeness } = args;
  const penalty =
    structuralErrors.length * 30 +
    completeness.ERROR_SAVE.length * 30 +
    completeness.ERROR_PUBLISH.length * 16 +
    completeness.WARN.length * 6;
  const score = Math.max(0, 100 - penalty);

  if (structuralErrors.length > 0 || completeness.ERROR_SAVE.length > 0) {
    return { score, level: 'blocked' };
  }
  if (score >= 90) return { score, level: 'excellent' };
  if (score >= 70) return { score, level: 'good' };
  if (score >= 45) return { score, level: 'needs_attention' };
  return { score, level: 'blocked' };
}

export const sitePagePublishGuardsBeforeChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
  req,
  context,
}) => {
  if (!data || typeof data !== 'object') return data;
  if (operation !== 'create' && operation !== 'update') return data;

  const incoming = { ...(data as SectionRecord) };
  const original = asObject(originalDoc);
  const preset = resolvePresetKey(incoming, original);

  const templateSections = corePresets.includes(preset as Exclude<SitePagePreset, 'custom'>)
    ? buildCorePresetSections(preset as Exclude<SitePagePreset, 'custom'>, {})
    : undefined;

  const sections = applyTemplateStructuralKeys(
    preset,
    normalizeSectionStructuralKeys(asSectionArray(incoming.sections)),
    templateSections,
  );
  const originalSections = normalizeSectionStructuralKeys(asSectionArray(original.sections));
  incoming.sections = sections;

  if (hasLegacySections(sections)) {
    throw new Error('Legacy sections cannot be saved. Convert the document before persisting changes.');
  }

  const structuralErrors = validateStructuralKeys(sections, originalSections, preset, templateSections);
  const completeness = runCompletenessRules(preset, sections);
  const quality = buildPublishQualityScore({
    structuralErrors,
    completeness,
  });

  incoming.publishQualityScore = quality.score;
  incoming.publishQualityLevel = quality.level;
  incoming.previewDiffSummary = buildPreviewDiffSummary(preset, sections, templateSections);

  if (structuralErrors.length > 0) {
    throw new Error(`[ERROR_SAVE] ${structuralErrors.join(' | ')}`);
  }

  const oldStatus =
    typeof original.workflowStatus === 'string' ? original.workflowStatus : 'draft';
  const newStatus =
    typeof incoming.workflowStatus === 'string' ? incoming.workflowStatus : oldStatus;
  const lifecycleEvent = resolveGuardLifecycleEvent({
    oldStatus,
    newStatus,
    req,
    context,
  });
  const publishPath = isPublishLifecycleEvent(lifecycleEvent);

  if (completeness.ERROR_SAVE.length > 0) {
    throw new Error(`[ERROR_SAVE] ${completeness.ERROR_SAVE.join(' | ')}`);
  }

  if (publishPath && completeness.ERROR_PUBLISH.length > 0) {
    throw new Error(
      `[ERROR_PUBLISH] A few things need attention before this page can go live. ${completeness.ERROR_PUBLISH.join(' | ')}`,
    );
  }

  if (completeness.WARN.length > 0) {
    req.payload.logger.warn({
      msg: 'Site page publish guard warnings',
      preset,
      lifecycleEvent,
      warnings: completeness.WARN,
    });
  }

  if (completeness.INFO.length > 0) {
    req.payload.logger.info({
      msg: 'Site page publish guard info',
      preset,
      lifecycleEvent,
      info: completeness.INFO,
    });
  }

  return incoming;
};

export const sitePageGuardInternals = {
  normalizeStructuralKeyValue,
  normalizeSectionStructuralKeys,
  applyTemplateStructuralKeys,
  buildPreviewDiffSummary,
  buildPublishQualityScore,
  resolveGuardLifecycleEvent,
  isPublishLifecycleEvent,
  runCompletenessRules,
};
