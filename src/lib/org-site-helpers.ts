export type MediaAsset = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export function buildCommunityHref(basePath: string, suffix = ''): string {
  const normalizedBase = basePath.replace(/\/+$/, '') || '/';
  const normalizedSuffix = suffix.trim().replace(/^\/+/, '');
  if (!normalizedSuffix) return normalizedBase;
  return `${normalizedBase}/${normalizedSuffix}`;
}

export function stripQueryAndHash(value: string): string {
  const [pathOnly] = value.split(/[?#]/, 1);
  return pathOnly || '/';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function extractMediaAsset(value: unknown): MediaAsset | null {
  if (!isRecord(value)) return null;
  const mediaUrl = typeof value.url === 'string' ? value.url : null;
  if (!mediaUrl) return null;
  return {
    url: mediaUrl,
    alt: typeof value.alt === 'string' ? value.alt : '',
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  };
}

type ResolvedTimezone = {
  timeZone: string;
  fallbackToUtc: boolean;
};

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function resolveTimezone(timezone?: string | null): ResolvedTimezone {
  if (typeof timezone === 'string' && timezone.trim()) {
    const trimmed = timezone.trim();
    if (isValidTimeZone(trimmed)) {
      return { timeZone: trimmed, fallbackToUtc: false };
    }
  }
  return { timeZone: 'UTC', fallbackToUtc: true };
}

function formatDatePart(dateValue: string, timezone?: string | null): string {
  const date = new Date(dateValue);
  const { timeZone } = resolveTimezone(timezone);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(date);
}

function formatTimePart(dateValue: string, timezone?: string | null): string {
  const date = new Date(dateValue);
  const { timeZone, fallbackToUtc } = resolveTimezone(timezone);
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
    ...(fallbackToUtc ? {} : { timeZoneName: 'short' }),
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === 'hour')?.value || '';
  const minute = parts.find((part) => part.type === 'minute')?.value || '';
  const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value || '';
  const tz = parts.find((part) => part.type === 'timeZoneName')?.value;

  if (!tz) return `${hour}:${minute} ${dayPeriod}`.trim();
  return `${hour}:${minute} ${dayPeriod} ${tz}`.trim();
}

export function formatEventDateLabel(dateValue: string, timezone?: string | null): string {
  const formattedDate = formatDatePart(dateValue, timezone);
  const { fallbackToUtc } = resolveTimezone(timezone);
  return fallbackToUtc ? `${formattedDate} (UTC)` : formattedDate;
}

export function formatEventTimeLabel(dateValue: string, timezone?: string | null): string {
  const formattedTime = formatTimePart(dateValue, timezone);
  const { fallbackToUtc } = resolveTimezone(timezone);
  return fallbackToUtc ? `${formattedTime} (UTC)` : formattedTime;
}

export function formatEventDateRange(
  startDate: string,
  endDate?: string | null,
  timezone?: string | null,
): string {
  if (!endDate) return formatEventDateLabel(startDate, timezone);
  const start = formatDatePart(startDate, timezone);
  const end = formatDatePart(endDate, timezone);
  const { fallbackToUtc } = resolveTimezone(timezone);
  const range = start === end ? start : `${start} - ${end}`;
  return fallbackToUtc ? `${range} (UTC)` : range;
}
