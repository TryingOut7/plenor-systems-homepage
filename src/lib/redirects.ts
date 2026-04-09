export type RedirectRuleLike = {
  id?: number | string;
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
  enabled?: boolean;
};

export const MAX_REDIRECT_HOPS = 5;

export function normalizeRedirectPath(path: string): string {
  if (!path) return '/';
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.length > 1 && clean.endsWith('/') && !clean.endsWith('/*')) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function isValidRedirectPath(path: string, allowWildcard: boolean): boolean {
  const trimmed = path.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    trimmed.startsWith('//')
  ) {
    return false;
  }

  if (!trimmed.startsWith('/')) return false;
  if (/\s/.test(trimmed)) return false;
  if (trimmed.includes('?') || trimmed.includes('#')) return false;

  const wildcardCount = (trimmed.match(/\*/g) || []).length;
  if (!allowWildcard && wildcardCount > 0) return false;
  if (allowWildcard && wildcardCount > 0) {
    if (!trimmed.endsWith('/*') || wildcardCount > 1) return false;
  }

  return true;
}

export function validateRedirectWildcardPairing(
  fromPath: string,
  toPath: string,
): true | string {
  const normalizedFrom = fromPath.trim();
  const normalizedTo = toPath.trim();
  if (!normalizedFrom || !normalizedTo) return true;

  const sourceHasWildcard = normalizedFrom.endsWith('/*');
  const destinationHasWildcard = normalizedTo.endsWith('/*');

  if (sourceHasWildcard && !destinationHasWildcard) {
    return 'Destination path must end with "/*" when source path ends with "/*" so the matched suffix is preserved.';
  }

  if (!sourceHasWildcard && destinationHasWildcard) {
    return 'Destination wildcard is only allowed when source path ends with "/*".';
  }

  return true;
}

export function matchesRedirectFromPath(ruleFrom: string, requestPath: string): boolean {
  const normalizedFrom = normalizeRedirectPath(ruleFrom);
  if (normalizedFrom.endsWith('/*')) {
    const prefix = normalizedFrom.slice(0, -2);
    return requestPath === prefix || requestPath.startsWith(`${prefix}/`);
  }
  return normalizedFrom === requestPath;
}

export function findRedirectMatch(
  rules: RedirectRuleLike[],
  normalizedPath: string,
): RedirectRuleLike | undefined {
  return rules.find((rule) => {
    if (typeof rule.fromPath !== 'string' || typeof rule.toPath !== 'string') {
      return false;
    }

    if (!isValidRedirectPath(rule.fromPath, true) || !isValidRedirectPath(rule.toPath, true)) {
      return false;
    }

    if (validateRedirectWildcardPairing(rule.fromPath, rule.toPath) !== true) {
      return false;
    }

    return matchesRedirectFromPath(rule.fromPath, normalizedPath);
  });
}

export function resolveRedirectTargetPath(
  fromPath: string,
  toPath: string,
  requestPath: string,
): string {
  const normalizedFrom = normalizeRedirectPath(fromPath);
  if (normalizedFrom.endsWith('/*') && toPath.endsWith('/*')) {
    const prefix = normalizedFrom.slice(0, -2);
    const suffix = requestPath.slice(prefix.length);
    return toPath.slice(0, -2) + suffix;
  }
  return toPath;
}

export type RedirectChainResult =
  | {
      kind: 'none';
      visitedPaths: string[];
    }
  | {
      kind: 'redirect';
      visitedPaths: string[];
      targetPath: string;
      isPermanent: boolean;
    }
  | {
      kind: 'blocked';
      visitedPaths: string[];
      reason: 'loop' | 'max_hops' | 'invalid_target';
      targetPath?: string;
      matchedRule?: RedirectRuleLike;
    };

export function resolveRedirectChain(
  rules: RedirectRuleLike[],
  requestPath: string,
  maxHops = MAX_REDIRECT_HOPS,
): RedirectChainResult {
  const startPath = normalizeRedirectPath(requestPath);
  const visitedPaths = [startPath];
  let currentPath = startPath;
  let isPermanent = true;

  for (let hop = 0; hop < maxHops; hop += 1) {
    const match = findRedirectMatch(rules, currentPath);
    if (!match?.toPath) {
      if (currentPath === startPath) {
        return { kind: 'none', visitedPaths };
      }

      return {
        kind: 'redirect',
        visitedPaths,
        targetPath: currentPath,
        isPermanent,
      };
    }

    isPermanent = isPermanent && match.isPermanent === true;
    const resolvedTarget = resolveRedirectTargetPath(match.fromPath ?? '', match.toPath, currentPath);
    if (!isValidRedirectPath(resolvedTarget, false)) {
      return {
        kind: 'blocked',
        reason: 'invalid_target',
        visitedPaths,
        targetPath: resolvedTarget,
        matchedRule: match,
      };
    }

    const nextPath = normalizeRedirectPath(resolvedTarget);
    if (visitedPaths.includes(nextPath)) {
      return {
        kind: 'blocked',
        reason: 'loop',
        visitedPaths: [...visitedPaths, nextPath],
        targetPath: nextPath,
        matchedRule: match,
      };
    }

    visitedPaths.push(nextPath);
    currentPath = nextPath;
  }

  const overflowMatch = findRedirectMatch(rules, currentPath);
  if (overflowMatch) {
    return {
      kind: 'blocked',
      reason: 'max_hops',
      visitedPaths,
      targetPath: currentPath,
      matchedRule: overflowMatch,
    };
  }

  if (currentPath === startPath) {
    return { kind: 'none', visitedPaths };
  }

  return {
    kind: 'redirect',
    visitedPaths,
    targetPath: currentPath,
    isPermanent,
  };
}

export function getRedirectCycleProbePaths(rule: RedirectRuleLike): string[] {
  if (typeof rule.fromPath !== 'string' || !isValidRedirectPath(rule.fromPath, true)) {
    return [];
  }

  const normalizedFrom = normalizeRedirectPath(rule.fromPath);
  if (!normalizedFrom.endsWith('/*')) {
    return [normalizedFrom];
  }

  const prefix = normalizedFrom.slice(0, -2);
  const probePaths = [prefix || '/', `${prefix}/__redirect_probe__`];
  return [...new Set(probePaths.map((path) => normalizeRedirectPath(path)))];
}
