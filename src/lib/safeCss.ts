const MAX_CSS_VALUE_LENGTH = 200;
const SAFE_CSS_VALUE_PATTERN = /^[a-zA-Z0-9\s#%(),.'"_+\-/*]+$/;
const BLOCKED_CSS_VALUE_PATTERN =
  /(?:<\/style|\/\*|@import|expression\s*\(|url\s*\(|javascript:|vbscript:|data:|[{};<>`\\])/i;

const HEX_COLOR_PATTERN = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB_COLOR_PATTERN =
  /^rgba?\(\s*(?:\d{1,3}%?(?:\s*,\s*|\s+)){2}\d{1,3}%?(?:(?:\s*,\s*|\s+\/\s+)(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const HSL_COLOR_PATTERN =
  /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?(?:\s*,\s*|\s+)\d{1,3}%(?:\s*,\s*|\s+)\d{1,3}%(?:(?:\s*,\s*|\s+\/\s+)(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const CSS_VAR_COLOR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/;
const NAMED_COLOR_PATTERN = /^[a-zA-Z][a-zA-Z-]*$/;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function hasBalancedQuotes(value: string): boolean {
  let singleQuotes = 0;
  let doubleQuotes = 0;

  for (const char of value) {
    if (char === "'") singleQuotes += 1;
    if (char === '"') doubleQuotes += 1;
  }

  return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
}

function hasBalancedParentheses(value: string): boolean {
  let depth = 0;

  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth < 0) return false;
    }
  }

  return depth === 0;
}

export function normalizeSafeCssValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = normalizeWhitespace(value);
  if (!normalized) return undefined;
  if (normalized.length > MAX_CSS_VALUE_LENGTH) return undefined;
  if (BLOCKED_CSS_VALUE_PATTERN.test(normalized)) return undefined;
  if (!SAFE_CSS_VALUE_PATTERN.test(normalized)) return undefined;
  if (!hasBalancedQuotes(normalized)) return undefined;
  if (!hasBalancedParentheses(normalized)) return undefined;

  return normalized;
}

export function normalizeSafeCssColorValue(value: unknown): string | undefined {
  const normalized = normalizeSafeCssValue(value);
  if (!normalized) return undefined;

  return HEX_COLOR_PATTERN.test(normalized) ||
    RGB_COLOR_PATTERN.test(normalized) ||
    HSL_COLOR_PATTERN.test(normalized) ||
    CSS_VAR_COLOR_PATTERN.test(normalized) ||
    NAMED_COLOR_PATTERN.test(normalized)
    ? normalized
    : undefined;
}

export function validateSafeCssValue(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) return true;

  return normalizeSafeCssValue(value)
    ? true
    : 'Enter a single safe CSS value without semicolons, braces, url(), or @import.';
}

export function validateSafeCssColorValue(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) return true;

  return normalizeSafeCssColorValue(value)
    ? true
    : 'Enter a safe CSS color value such as #1B2D4F, rgb(...), hsl(...), transparent, or var(--token).';
}
