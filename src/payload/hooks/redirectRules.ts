import { ValidationError, type CollectionBeforeChangeHook } from 'payload';
import {
  MAX_REDIRECT_HOPS,
  getRedirectCycleProbePaths,
  resolveRedirectChain,
  validateRedirectWildcardPairing,
  type RedirectRuleLike,
} from '@/lib/redirects';

type RecordValue = Record<string, unknown>;

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function buildRedirectRuleCandidate(
  data: RecordValue,
  originalDoc?: RecordValue,
): RedirectRuleLike {
  const source = originalDoc ?? {};
  const id = data.id ?? source.id;
  const fromPath = readTrimmedString(data.fromPath) || readTrimmedString(source.fromPath);
  const toPath = readTrimmedString(data.toPath) || readTrimmedString(source.toPath);
  const enabled = readBoolean(data.enabled, readBoolean(source.enabled, true));
  const isPermanent = readBoolean(data.isPermanent, readBoolean(source.isPermanent, false));

  return {
    id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
    fromPath,
    toPath,
    enabled,
    isPermanent,
  };
}

function formatRedirectChain(paths: string[]): string {
  return paths.join(' -> ');
}

function throwRedirectValidationError(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  collectionSlug: string,
  message: string,
): never {
  throw new ValidationError({
    collection: collectionSlug,
    req,
    errors: [{ path: 'toPath', label: message, message }],
  });
}

async function loadOtherRedirectRules(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  currentRuleId?: number | string,
): Promise<RedirectRuleLike[]> {
  const result = await req.payload.find({
    collection: 'redirect-rules',
    overrideAccess: true,
    limit: 500,
  });

  return result.docs
    .map((doc) => {
      const record = doc as unknown as RecordValue;
      const id = record.id;
      return {
        id: typeof id === 'string' || typeof id === 'number' ? id : undefined,
        fromPath: readTrimmedString(record.fromPath),
        toPath: readTrimmedString(record.toPath),
        enabled: readBoolean(record.enabled, true),
        isPermanent: readBoolean(record.isPermanent, false),
      } satisfies RedirectRuleLike;
    })
    .filter((rule) => String(rule.id ?? '') !== String(currentRuleId ?? ''));
}

export const redirectRulesBeforeChange: CollectionBeforeChangeHook = async ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = data as RecordValue;
  const existing = originalDoc && typeof originalDoc === 'object'
    ? (originalDoc as RecordValue)
    : undefined;
  const candidateRule = buildRedirectRuleCandidate(incoming, existing);

  const wildcardPairing = validateRedirectWildcardPairing(
    candidateRule.fromPath ?? '',
    candidateRule.toPath ?? '',
  );
  if (wildcardPairing !== true) {
    throwRedirectValidationError(req, collection.slug, wildcardPairing);
  }

  if (!candidateRule.enabled || !candidateRule.fromPath || !candidateRule.toPath) {
    return data;
  }

  const otherRules = await loadOtherRedirectRules(req, candidateRule.id);
  const activeRules = [...otherRules.filter((rule) => rule.enabled !== false), candidateRule];

  for (const probePath of getRedirectCycleProbePaths(candidateRule)) {
    const resolution = resolveRedirectChain(activeRules, probePath);
    if (resolution.kind === 'blocked' && resolution.reason === 'loop') {
      throwRedirectValidationError(
        req,
        collection.slug,
        `Redirect rule creates a circular redirect chain: ${formatRedirectChain(resolution.visitedPaths)}.`,
      );
    }

    if (resolution.kind === 'blocked' && resolution.reason === 'max_hops') {
      throwRedirectValidationError(
        req,
        collection.slug,
        `Redirect rule exceeds the maximum redirect depth of ${MAX_REDIRECT_HOPS} hops: ${formatRedirectChain(resolution.visitedPaths)}.`,
      );
    }
  }

  return data;
};

export const redirectRulesInternals = {
  buildRedirectRuleCandidate,
  formatRedirectChain,
  loadOtherRedirectRules,
};
