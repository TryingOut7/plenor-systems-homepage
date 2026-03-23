import type { CSSProperties } from 'react';
import type { BlogPost, PageSection, ServiceItem, Testimonial } from '@/payload/cms';
import type {
  HeadingSize,
  HeadingTag,
  SectionRecord,
  SectionSize,
  SectionTheme,
} from './types';

const HEX_COLOR_PATTERN = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB_COLOR_PATTERN =
  /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
const HSL_COLOR_PATTERN =
  /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
const CSS_VAR_COLOR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/;
const NAMED_COLOR_PATTERN = /^[a-zA-Z][a-zA-Z-]*$/;

export const innerStyle: CSSProperties = {
  maxWidth: 'var(--ui-layout-container-max-width)',
  margin: '0 auto',
};

export const sectionPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-section-compact)',
  regular: 'var(--ui-spacing-section-regular)',
  spacious: 'var(--ui-spacing-section-spacious)',
};

export const heroPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-hero-compact)',
  regular: 'var(--ui-spacing-hero-regular)',
  spacious: 'var(--ui-spacing-hero-spacious)',
};

export function asSectionRecord(section: PageSection): SectionRecord {
  return section as SectionRecord;
}

export function getDarkBackgroundColor(theme?: string): string {
  if (theme === 'charcoal') return 'var(--ui-color-charcoal-bg)';
  if (theme === 'black') return 'var(--ui-color-black-bg)';
  return 'var(--ui-color-dark-bg)';
}

export function getLightBackgroundColor(theme?: string): string {
  if (theme === 'light') return 'var(--ui-color-section-alt)';
  return 'var(--ui-color-surface)';
}

export function isDarkTheme(theme: SectionTheme): boolean {
  return theme === 'navy' || theme === 'charcoal' || theme === 'black';
}

export function headingColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)';
}

export function bodyColor(theme: SectionTheme): string {
  return isDarkTheme(theme)
    ? 'var(--ui-color-dark-text-muted)'
    : 'var(--ui-color-text-muted)';
}

export function mutedColor(theme: SectionTheme): string {
  return isDarkTheme(theme)
    ? 'var(--ui-color-dark-text-muted)'
    : 'var(--ui-color-text-muted)';
}

export function normalizeTheme(theme: unknown): SectionTheme {
  if (
    theme === 'navy' ||
    theme === 'charcoal' ||
    theme === 'black' ||
    theme === 'white' ||
    theme === 'light'
  ) {
    return theme;
  }
  return 'white';
}

export function normalizeSize(size: unknown): SectionSize {
  if (size === 'compact' || size === 'regular' || size === 'spacious') return size;
  return 'regular';
}

function isValidCssColor(value: string): boolean {
  if (!value || value.length > 64) return false;
  return (
    HEX_COLOR_PATTERN.test(value) ||
    RGB_COLOR_PATTERN.test(value) ||
    HSL_COLOR_PATTERN.test(value) ||
    CSS_VAR_COLOR_PATTERN.test(value) ||
    NAMED_COLOR_PATTERN.test(value)
  );
}

export function normalizeCustomBackgroundColor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const color = value.trim();
  return isValidCssColor(color) ? color : undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseRgbChannel(token: string): number | null {
  const normalized = token.trim();
  if (!normalized) return null;
  if (normalized.endsWith('%')) {
    const parsed = Number.parseFloat(normalized.slice(0, -1));
    if (!Number.isFinite(parsed)) return null;
    return clamp((parsed / 100) * 255, 0, 255);
  }

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;
  return clamp(parsed, 0, 255);
}

function parseAlphaChannel(token: string | undefined): number {
  if (!token) return 1;
  const normalized = token.trim();
  if (!normalized) return 1;
  if (normalized.endsWith('%')) {
    const parsed = Number.parseFloat(normalized.slice(0, -1));
    if (!Number.isFinite(parsed)) return 1;
    return clamp(parsed / 100, 0, 1);
  }
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return 1;
  return clamp(parsed, 0, 1);
}

function parseHue(value: string): number | null {
  const normalized = value.trim().toLowerCase();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;

  if (normalized.endsWith('rad')) return (parsed * 180) / Math.PI;
  if (normalized.endsWith('grad')) return parsed * 0.9;
  if (normalized.endsWith('turn')) return parsed * 360;
  return parsed;
}

function parseHexColor(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!HEX_COLOR_PATTERN.test(color)) return null;
  const hex = color.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const expanded = hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
    return parseHexColor(`#${expanded}`);
  }

  if (hex.length === 6 || hex.length === 8) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  return null;
}

function parseRgbColor(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/^rgba?\((.+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => part.trim());
  if (parts.length !== 3 && parts.length !== 4) return null;

  const r = parseRgbChannel(parts[0]);
  const g = parseRgbChannel(parts[1]);
  const b = parseRgbChannel(parts[2]);
  if (r === null || g === null || b === null) return null;

  return { r, g, b, a: parseAlphaChannel(parts[3]) };
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
): { r: number; g: number; b: number } {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (normalizedHue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (normalizedHue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (normalizedHue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (normalizedHue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (normalizedHue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

function parseHslColor(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/^hsla?\((.+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => part.trim());
  if (parts.length !== 3 && parts.length !== 4) return null;

  const hue = parseHue(parts[0]);
  if (hue === null) return null;

  if (!parts[1].endsWith('%') || !parts[2].endsWith('%')) return null;
  const saturation = clamp(Number.parseFloat(parts[1]) / 100, 0, 1);
  const lightness = clamp(Number.parseFloat(parts[2]) / 100, 0, 1);

  if (!Number.isFinite(saturation) || !Number.isFinite(lightness)) return null;

  const rgb = hslToRgb(hue, saturation, lightness);
  return { ...rgb, a: parseAlphaChannel(parts[3]) };
}

export function resolveColorDarkness(color: string): boolean | undefined {
  const normalized = color.trim().toLowerCase();
  const parsed =
    parseHexColor(normalized) || parseRgbColor(normalized) || parseHslColor(normalized);
  if (!parsed) return undefined;

  const alpha = clamp(parsed.a, 0, 1);
  const compositeRed = parsed.r * alpha + 255 * (1 - alpha);
  const compositeGreen = parsed.g * alpha + 255 * (1 - alpha);
  const compositeBlue = parsed.b * alpha + 255 * (1 - alpha);

  const toLinear = (channel: number): number => {
    const normalizedChannel = channel / 255;
    return normalizedChannel <= 0.04045
      ? normalizedChannel / 12.92
      : Math.pow((normalizedChannel + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(compositeRed) +
    0.7152 * toLinear(compositeGreen) +
    0.0722 * toLinear(compositeBlue);

  return luminance < 0.45;
}

export const HEADING_FONT_SIZE: Record<HeadingSize, string> = {
  xs: 'clamp(16px, 2vw, 20px)',
  sm: 'clamp(20px, 3vw, 28px)',
  md: 'clamp(26px, 4vw, 40px)',
  lg: 'clamp(32px, 5vw, 52px)',
  xl: 'clamp(40px, 6vw, 64px)',
};

export function normalizeHeadingSize(value: unknown): HeadingSize {
  if (
    value === 'xs' ||
    value === 'sm' ||
    value === 'md' ||
    value === 'lg' ||
    value === 'xl'
  ) {
    return value;
  }
  return 'md';
}

export function normalizeHeadingTag(value: unknown): HeadingTag {
  if (value === 'h1' || value === 'h2' || value === 'h3' || value === 'h4') return value;
  return 'h2';
}

export function normalizeTextAlign(value: unknown): 'left' | 'center' | 'right' | undefined {
  if (value === 'left' || value === 'center' || value === 'right') return value;
  return undefined;
}

export function isSectionVisible(section: SectionRecord): boolean {
  if (section.isHidden === true) return false;
  const now = Date.now();
  if (typeof section.visibleFrom === 'string' && section.visibleFrom) {
    const from = new Date(section.visibleFrom).getTime();
    if (Number.isFinite(from) && now < from) return false;
  }
  if (typeof section.visibleUntil === 'string' && section.visibleUntil) {
    const until = new Date(section.visibleUntil).getTime();
    if (Number.isFinite(until) && now > until) return false;
  }
  return true;
}

export function normalizePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

export function getImageUrl(media: unknown): string | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return typeof m.url === 'string' ? m.url : undefined;
}

export function getImageAlt(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  return String((media as Record<string, unknown>).alt || '');
}

export function readArrayEntries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object'
  );
}

export function readParagraphArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.paragraph === 'string' ? entry.paragraph.trim() : ''))
    .filter(Boolean);
}

export function readItemArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.item === 'string' ? entry.item.trim() : ''))
    .filter(Boolean);
}

export function readAudienceArray(value: unknown): Array<{ label: string; copy: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const label = typeof entry.label === 'string' ? entry.label.trim() : '';
      const copy = typeof entry.copy === 'string' ? entry.copy.trim() : '';
      return { label, copy };
    })
    .filter((entry) => entry.label && entry.copy);
}

export function readChecklistArray(
  value: unknown
): Array<{ title: string; description: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      const description =
        typeof entry.description === 'string' ? entry.description.trim() : '';
      return { title, description };
    })
    .filter((entry) => entry.title && entry.description);
}

export type NormalizedImage = { url: string; alt: string };

export function normalizeImageEntries(images: unknown): NormalizedImage[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((imageEntry: unknown) => {
      const img =
        typeof imageEntry === 'object' && imageEntry !== null
          ? (imageEntry as Record<string, unknown>).image
          : imageEntry;
      const url = getImageUrl(img);
      if (!url) return null;
      return { url, alt: getImageAlt(img) };
    })
    .filter((entry): entry is NormalizedImage => !!entry);
}

export function matchesFilter(
  item: Record<string, unknown>,
  filterField?: string,
  filterValue?: string
): boolean {
  if (!filterField || !filterValue) return true;
  const field = item[filterField];
  if (Array.isArray(field)) {
    return field.some((entry) => {
      const val =
        typeof entry === 'object' && entry !== null
          ? (entry as Record<string, unknown>).tag
          : entry;
      return String(val).toLowerCase() === filterValue.toLowerCase();
    });
  }
  if (typeof field === 'boolean') {
    return String(field) === filterValue.toLowerCase();
  }
  if (field === undefined || field === null) return false;
  return String(field).toLowerCase().includes(filterValue.toLowerCase());
}

export function sortItems<T extends Record<string, unknown>>(
  items: T[],
  sortField = 'publishedAt',
  sortDirection: 'asc' | 'desc' = 'desc'
): T[] {
  const sorted = [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === bValue) return 0;
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (typeof aValue === 'number' && typeof bValue === 'number') return aValue - bValue;
    return String(aValue).localeCompare(String(bValue));
  });
  return sortDirection === 'asc' ? sorted : sorted.reverse();
}

export function renderDynamicListItem(
  item: ServiceItem | BlogPost | Testimonial,
  source: string
): {
  title: string;
  description: string;
  href: string;
  meta: string;
} {
  if (source === 'blogPost') {
    const post = item as BlogPost;
    return {
      title: post.title || 'Untitled Post',
      description: post.excerpt || '',
      href: `/blog/${post.slug || ''}`,
      meta: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '',
    };
  }
  if (source === 'testimonial') {
    const testimonial = item as Testimonial;
    return {
      title: testimonial.personName || 'Anonymous',
      description: testimonial.quote || '',
      href: '#',
      meta: [testimonial.role, testimonial.company].filter(Boolean).join(', '),
    };
  }
  const service = item as ServiceItem;
  return {
    title: service.title || 'Untitled Service',
    description: service.summary || '',
    href: `/services/${service.slug || ''}`,
    meta: service.priceFrom ? `${service.currency || 'USD'} ${service.priceFrom}` : '',
  };
}
