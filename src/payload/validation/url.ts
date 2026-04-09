import { validateRedirectWildcardPairing } from '@/lib/redirects';

type ValidationContext = {
  siblingData?: Record<string, unknown>;
};

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function hasBlockedScheme(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  );
}

function containsWhitespace(value: string): boolean {
  return /\s/.test(value);
}

type InternalPathOptions = {
  fieldLabel: string;
  allowWildcard: boolean;
  allowQueryHash: boolean;
};

function validateInternalPath(
  value: unknown,
  options: InternalPathOptions,
): true | string {
  const trimmed = readTrimmedString(value);
  if (!trimmed) return true;

  if (hasBlockedScheme(trimmed)) {
    return `${options.fieldLabel} cannot use javascript:, data:, or vbscript: schemes.`;
  }

  if (trimmed.startsWith('//')) {
    return `${options.fieldLabel} must not use protocol-relative URLs (//...).`;
  }

  if (!trimmed.startsWith('/')) {
    return `${options.fieldLabel} must start with "/".`;
  }

  if (containsWhitespace(trimmed)) {
    return `${options.fieldLabel} cannot contain spaces.`;
  }

  if (!options.allowQueryHash && (trimmed.includes('?') || trimmed.includes('#'))) {
    return `${options.fieldLabel} must not include query strings or fragments.`;
  }

  const wildcardCount = (trimmed.match(/\*/g) || []).length;
  if (!options.allowWildcard && wildcardCount > 0) {
    return `${options.fieldLabel} cannot include wildcard (*).`;
  }

  if (options.allowWildcard && wildcardCount > 0) {
    if (!trimmed.endsWith('/*') || wildcardCount > 1) {
      return `${options.fieldLabel} wildcard is only supported as a trailing "/*".`;
    }
  }

  return true;
}

export function validatePathOrHttpUrl(value: unknown): true | string {
  const trimmed = readTrimmedString(value);
  if (!trimmed) return true;

  if (hasBlockedScheme(trimmed)) {
    return 'Link cannot use javascript:, data:, or vbscript: schemes.';
  }

  if (trimmed.startsWith('/')) {
    return validateInternalPath(trimmed, {
      fieldLabel: 'Path',
      allowWildcard: false,
      allowQueryHash: true,
    });
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Use an http(s) URL or a path that starts with "/".';
    }
    if (parsed.username || parsed.password) {
      return 'URL must not include embedded credentials.';
    }
    return true;
  } catch {
    return 'Enter a valid http(s) URL or a path that starts with "/".';
  }
}

export function validateHttpUrl(value: unknown): true | string {
  const trimmed = readTrimmedString(value);
  if (!trimmed) return true;

  if (hasBlockedScheme(trimmed)) {
    return 'URL cannot use javascript:, data:, or vbscript: schemes.';
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Use a valid http(s) URL.';
    }
    if (parsed.username || parsed.password) {
      return 'URL must not include embedded credentials.';
    }
    return true;
  } catch {
    return 'Enter a valid http(s) URL.';
  }
}

export function validateRedirectFromPath(value: unknown): true | string {
  return validateInternalPath(value, {
    fieldLabel: 'Source path',
    allowWildcard: true,
    allowQueryHash: false,
  });
}

export function validateRedirectToPath(
  value: unknown,
  context?: ValidationContext,
): true | string {
  const baseValidation = validateInternalPath(value, {
    fieldLabel: 'Destination path',
    allowWildcard: true,
    allowQueryHash: false,
  });
  if (baseValidation !== true) return baseValidation;

  const toPath = readTrimmedString(value);
  const fromPath = readTrimmedString(context?.siblingData?.fromPath);
  return validateRedirectWildcardPairing(fromPath, toPath);
}
