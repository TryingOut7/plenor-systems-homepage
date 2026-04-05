import type { CollectionBeforeChangeHook } from 'payload';

type RecordValue = Record<string, unknown>;

const VERSION_TRACKED_FIELDS = [
  'title',
  'slug',
  'sections',
  'libraryCategory',
  'isDeprecated',
  'locale',
] as const;

function asObject(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as RecordValue;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }

  if (!value || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  const input = value as RecordValue;
  const keys = Object.keys(input).sort((a, b) => a.localeCompare(b));
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(input[key])}`);
  return `{${pairs.join(',')}}`;
}

function fieldChanged(incoming: RecordValue, original: RecordValue, field: string): boolean {
  return stableStringify(incoming[field]) !== stableStringify(original[field]);
}

function deriveChangeSummary(existingSummary: string, nextVersion: number): string {
  const trimmed = existingSummary.trim();
  if (trimmed.length > 0) return trimmed;

  return `Version ${nextVersion} update`;
}

export const reusableSectionVersioningInternals = {
  stableStringify,
  fieldChanged,
  deriveChangeSummary,
};

export const reusableSectionVersioningBeforeChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = { ...(data as RecordValue) };
  const original = asObject(originalDoc);

  const currentVersion =
    typeof original.libraryVersion === 'number' && Number.isFinite(original.libraryVersion)
      ? original.libraryVersion
      : 1;

  if (operation === 'create') {
    incoming.libraryVersion = 1;
    const summary = typeof incoming.libraryChangeSummary === 'string' ? incoming.libraryChangeSummary : '';
    incoming.libraryChangeSummary = deriveChangeSummary(summary, 1);
    return incoming;
  }

  const shouldBumpVersion = VERSION_TRACKED_FIELDS.some((field) =>
    fieldChanged(incoming, original, field),
  );

  if (!shouldBumpVersion) {
    incoming.libraryVersion = currentVersion;
    if (typeof incoming.libraryChangeSummary !== 'string') {
      incoming.libraryChangeSummary =
        typeof original.libraryChangeSummary === 'string' ? original.libraryChangeSummary : '';
    }
    return incoming;
  }

  const nextVersion = currentVersion + 1;
  incoming.libraryVersion = nextVersion;
  const summary = typeof incoming.libraryChangeSummary === 'string' ? incoming.libraryChangeSummary : '';
  incoming.libraryChangeSummary = deriveChangeSummary(summary, nextVersion);

  return incoming;
};
