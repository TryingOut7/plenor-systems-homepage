'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RichText from './RichText';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';
import FormRenderer from './FormRenderer';
import type {
  BlogPost,
  CollectionData,
  PageSection,
  ServiceItem,
  Testimonial,
} from '@/payload/cms';

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

const HEX_COLOR_PATTERN = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB_COLOR_PATTERN =
  /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
const HSL_COLOR_PATTERN =
  /^hsla?\(\s*[-+]?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)$/i;
const CSS_VAR_COLOR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/;
const NAMED_COLOR_PATTERN = /^[a-zA-Z][a-zA-Z-]*$/;

interface UniversalSectionsProps {
  documentId: string;
  documentType: string;
  sections: PageSection[];
  collections: CollectionData;
  guideFormLabels?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    footerText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
  };
  inquiryFormLabels?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    consentText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
    companyPlaceholder?: string;
    challengePlaceholder?: string;
  };
}

const inner: CSSProperties = { maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' };

const sectionPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-section-compact)',
  regular: 'var(--ui-spacing-section-regular)',
  spacious: 'var(--ui-spacing-section-spacious)',
};

const heroPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-hero-compact)',
  regular: 'var(--ui-spacing-hero-regular)',
  spacious: 'var(--ui-spacing-hero-spacious)',
};

function getDarkBackgroundColor(theme?: string): string {
  if (theme === 'charcoal') return 'var(--ui-color-charcoal-bg)';
  if (theme === 'black') return 'var(--ui-color-black-bg)';
  return 'var(--ui-color-dark-bg)';
}

function getLightBackgroundColor(theme?: string): string {
  if (theme === 'light') return 'var(--ui-color-section-alt)';
  return 'var(--ui-color-surface)';
}

function isDarkTheme(theme: SectionTheme): boolean {
  return theme === 'navy' || theme === 'charcoal' || theme === 'black';
}

function headingColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)';
}

function bodyColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)';
}

function mutedColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)';
}

function normalizeTheme(theme: unknown): SectionTheme {
  if (theme === 'navy' || theme === 'charcoal' || theme === 'black' || theme === 'white' || theme === 'light') {
    return theme;
  }
  return 'white';
}

function normalizeSize(size: unknown): SectionSize {
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

function normalizeCustomBackgroundColor(value: unknown): string | undefined {
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
    const expanded = hex.split('').map((char) => `${char}${char}`).join('');
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

function hslToRgb(hue: number, saturation: number, lightness: number): { r: number; g: number; b: number } {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const c = (1 - Math.abs((2 * lightness) - 1)) * saturation;
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

function resolveColorDarkness(color: string): boolean | undefined {
  const normalized = color.trim().toLowerCase();
  const parsed = parseHexColor(normalized) || parseRgbColor(normalized) || parseHslColor(normalized);
  if (!parsed) return undefined;

  const alpha = clamp(parsed.a, 0, 1);
  const compositeRed = (parsed.r * alpha) + (255 * (1 - alpha));
  const compositeGreen = (parsed.g * alpha) + (255 * (1 - alpha));
  const compositeBlue = (parsed.b * alpha) + (255 * (1 - alpha));

  const toLinear = (channel: number): number => {
    const normalizedChannel = channel / 255;
    return normalizedChannel <= 0.04045
      ? normalizedChannel / 12.92
      : Math.pow((normalizedChannel + 0.055) / 1.055, 2.4);
  };

  const luminance =
    (0.2126 * toLinear(compositeRed)) +
    (0.7152 * toLinear(compositeGreen)) +
    (0.0722 * toLinear(compositeBlue));

  return luminance < 0.45;
}

type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4';

const HEADING_FONT_SIZE: Record<HeadingSize, string> = {
  xs: 'clamp(16px, 2vw, 20px)',
  sm: 'clamp(20px, 3vw, 28px)',
  md: 'clamp(26px, 4vw, 40px)',
  lg: 'clamp(32px, 5vw, 52px)',
  xl: 'clamp(40px, 6vw, 64px)',
};

function normalizeHeadingSize(value: unknown): HeadingSize {
  if (value === 'xs' || value === 'sm' || value === 'md' || value === 'lg' || value === 'xl') return value;
  return 'md';
}

function normalizeHeadingTag(value: unknown): HeadingTag {
  if (value === 'h1' || value === 'h2' || value === 'h3' || value === 'h4') return value;
  return 'h2';
}

function normalizeTextAlign(value: unknown): 'left' | 'center' | 'right' | undefined {
  if (value === 'left' || value === 'center' || value === 'right') return value;
  return undefined;
}

function isSectionVisible(section: Record<string, unknown>): boolean {
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

function normalizePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function getImageUrl(media: unknown): string | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return typeof m.url === 'string' ? m.url : undefined;
}

function getImageAlt(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  return String((media as Record<string, unknown>).alt || '');
}

function readArrayEntries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object');
}

function readParagraphArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.paragraph === 'string' ? entry.paragraph.trim() : ''))
    .filter(Boolean);
}

function readItemArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.item === 'string' ? entry.item.trim() : ''))
    .filter(Boolean);
}

function readAudienceArray(value: unknown): Array<{ label: string; copy: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const label = typeof entry.label === 'string' ? entry.label.trim() : '';
      const copy = typeof entry.copy === 'string' ? entry.copy.trim() : '';
      return { label, copy };
    })
    .filter((entry) => entry.label && entry.copy);
}

function readChecklistArray(value: unknown): Array<{ title: string; description: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      const description = typeof entry.description === 'string' ? entry.description.trim() : '';
      return { title, description };
    })
    .filter((entry) => entry.title && entry.description);
}

type NormalizedImage = { url: string; alt: string };

function normalizeImageEntries(images: unknown): NormalizedImage[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((imageEntry: unknown) => {
      const img = typeof imageEntry === 'object' && imageEntry !== null
        ? (imageEntry as Record<string, unknown>).image
        : imageEntry;
      const url = getImageUrl(img);
      if (!url) return null;
      return { url, alt: getImageAlt(img) };
    })
    .filter((entry): entry is NormalizedImage => !!entry);
}

function ImageSlideshow({ images }: { images: NormalizedImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, isPaused]);

  if (images.length === 0) return null;
  const boundedIndex = ((currentIndex % images.length) + images.length) % images.length;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div style={{ marginBottom: '12px', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--ui-color-border)' }}>
        <Image
          src={images[boundedIndex].url}
          alt={images[boundedIndex].alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {images.length > 1 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {images.map((_, dotIndex) => (
              <button
                key={`dot-${dotIndex}`}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                onClick={() => setCurrentIndex(dotIndex)}
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: dotIndex === boundedIndex ? 'var(--ui-color-primary)' : 'var(--ui-color-border)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SectionHeading({
  tag = 'h2',
  fontSize,
  style,
  children,
}: {
  tag?: HeadingTag;
  fontSize?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const Tag = tag;
  const mergedStyle: CSSProperties = {
    ...style,
    ...(fontSize ? { fontSize } : {}),
  };
  return <Tag style={mergedStyle}>{children}</Tag>;
}

function FaqAccordion({ items, theme }: { items: Array<{ question: string; answer: string }>; theme: SectionTheme }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dark = isDarkTheme(theme);
  return (
    <div>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'var(--ui-color-border)'}` }}
        >
          <button
            type="button"
            aria-expanded={openIndex === idx}
            aria-controls={`faq-answer-${idx}`}
            onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '20px 0',
              background: 'none',
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--ui-font-body)',
              fontWeight: 600,
              fontSize: '16px',
              color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
            }}
          >
            {item.question}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                flexShrink: 0,
                marginLeft: '16px',
                transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </button>
          <div id={`faq-answer-${idx}`} style={{ display: openIndex === idx ? 'block' : 'none', paddingBottom: '20px' }}>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)', margin: 0 }}>
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabsSectionRenderer({
  sectionKey, section, tabs, sectionStyle, inner, theme, headingColor, mutedColor, bodyColor, hTag = 'h2', hFontSize,
}: {
  sectionKey: string;
  section: Record<string, unknown>;
  tabs: unknown[];
  sectionStyle: React.CSSProperties;
  inner: React.CSSProperties;
  theme: SectionTheme;
  headingColor: string;
  mutedColor: string;
  bodyColor: string;
  hTag?: HeadingTag;
  hFontSize?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const dark = isDarkTheme(theme);
  const tabItems = tabs.map((t: unknown) => {
    const tab = t && typeof t === 'object' ? (t as Record<string, unknown>) : {};
    const imgObj = tab.image && typeof tab.image === 'object' ? (tab.image as Record<string, unknown>) : null;
    const imageUrl = imgObj ? (typeof imgObj.url === 'string' ? imgObj.url : '') : '';
    return {
      label: typeof tab.label === 'string' ? tab.label : '',
      heading: typeof tab.heading === 'string' ? tab.heading : '',
      body: typeof tab.body === 'string' ? tab.body : '',
      imageUrl,
      linkLabel: typeof tab.linkLabel === 'string' ? tab.linkLabel : '',
      linkHref: typeof tab.linkHref === 'string' ? tab.linkHref : '',
    };
  });
  const safeActive = Math.min(activeTab, Math.max(tabItems.length - 1, 0));
  const current = tabItems[safeActive];
  return (
    <section
      id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
      style={sectionStyle}
      className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
    >
      <div style={inner}>
        {section.heading ? (
          <SectionHeading tag={hTag} style={{ textAlign: 'center', marginBottom: section.subheading ? '8px' : '32px', color: headingColor, fontSize: hFontSize }}>{String(section.heading)}</SectionHeading>
        ) : null}
        {section.subheading ? (
          <p style={{ textAlign: 'center', marginBottom: '32px', color: mutedColor }}>{String(section.subheading)}</p>
        ) : null}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: '4px',
            borderBottom: `2px solid ${dark ? 'rgba(255,255,255,0.15)' : 'var(--ui-color-border)'}`,
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {tabItems.map((tab, idx) => (
            <button
              key={`${sectionKey}-tab-${idx}`}
              role="tab"
              aria-selected={idx === safeActive}
              aria-controls={`${sectionKey}-tabpanel-${idx}`}
              type="button"
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 0,
                borderBottom: idx === safeActive ? '2px solid var(--ui-color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                fontWeight: idx === safeActive ? 600 : 400,
                color: idx === safeActive ? (dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)') : mutedColor,
                fontFamily: 'var(--ui-font-body)',
                fontSize: '15px',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {current ? (
          <div
            id={`${sectionKey}-tabpanel-${safeActive}`}
            role="tabpanel"
            style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: '240px' }}>
              {current.heading ? <h3 style={{ marginBottom: '16px', color: headingColor }}>{current.heading}</h3> : null}
              {current.body ? <p style={{ lineHeight: 1.7, color: bodyColor }}>{current.body}</p> : null}
              {current.linkHref && current.linkLabel ? (
                <a
                  href={current.linkHref}
                  style={{
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: 'var(--ui-btn-primary-bg)',
                    color: 'var(--ui-btn-primary-text)',
                    borderRadius: 'var(--ui-btn-radius)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {current.linkLabel}
                </a>
              ) : null}
            </div>
            {current.imageUrl ? (
              <div style={{ flex: 1, minWidth: '240px' }}>
                <Image src={current.imageUrl} alt={current.heading || ''} width={0} height={0} sizes="600px" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function matchesFilter(item: Record<string, unknown>, filterField?: string, filterValue?: string): boolean {
  if (!filterField || !filterValue) return true;
  const field = item[filterField];
  if (Array.isArray(field)) {
    return field.some((entry) => {
      const val = typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>).tag : entry;
      return String(val).toLowerCase() === filterValue.toLowerCase();
    });
  }
  if (typeof field === 'boolean') {
    return String(field) === filterValue.toLowerCase();
  }
  if (field === undefined || field === null) return false;
  return String(field).toLowerCase().includes(filterValue.toLowerCase());
}

function sortItems<T extends Record<string, unknown>>(
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

function renderDynamicListItem(item: ServiceItem | BlogPost | Testimonial, source: string) {
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

export default function UniversalSections({
  sections,
  collections,
  guideFormLabels,
  inquiryFormLabels,
}: UniversalSectionsProps) {
  const [listPages, setListPages] = useState<Record<string, number>>({});

  const renderSection = (
    section: PageSection,
    index: number,
    keyPrefix = '',
  ): React.ReactNode => {
    const key = `${keyPrefix}${section.id || index}`;

    if (!isSectionVisible(section)) return null;

    const size = normalizeSize(section.size);
    const baseTheme = normalizeTheme(section.theme);
    const padding = sectionPadding[size];
    const customBackgroundColor = normalizeCustomBackgroundColor(section.backgroundColor);
    const customBackgroundIsDark =
      customBackgroundColor ? resolveColorDarkness(customBackgroundColor) : undefined;
    const theme: SectionTheme =
      customBackgroundColor && customBackgroundIsDark !== undefined
        ? customBackgroundIsDark
          ? 'navy'
          : 'white'
        : baseTheme;
    const resolvedBackgroundColor =
      customBackgroundColor ??
      (baseTheme === 'white' || baseTheme === 'light'
        ? getLightBackgroundColor(baseTheme)
        : getDarkBackgroundColor(baseTheme));
    const hSize = normalizeHeadingSize(section.headingSize);
    const hTag = normalizeHeadingTag(section.headingTag);
    const hFontSize = HEADING_FONT_SIZE[hSize];
    const sectionTextAlign = normalizeTextAlign(section.textAlign);
    const sectionStyle: CSSProperties = {
      padding,
      backgroundColor: resolvedBackgroundColor,
      ...(sectionTextAlign ? { textAlign: sectionTextAlign } : {}),
    };

    if (section.blockType === 'heroSection') {
      const bgImageUrl = getImageUrl(section.backgroundImage);
      const bgVideoUrl = typeof section.backgroundVideo === 'string' ? section.backgroundVideo.trim() : '';
      const textAlign = (section.textAlignment as string | undefined) || 'center';
      const minHeight = typeof section.minHeight === 'number' && section.minHeight > 0 ? `${section.minHeight}px` : undefined;
      const alignItems = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
      const hasBgMedia = !!(bgImageUrl || bgVideoUrl);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            padding: heroPadding[size],
            color: headingColor(theme),
            position: 'relative',
            overflow: 'hidden',
            ...(minHeight ? { minHeight } : {}),
            display: 'flex',
            flexDirection: 'column',
            alignItems,
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          {bgVideoUrl ? (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              >
                <source src={bgVideoUrl} type="video/mp4" />
              </video>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
            </>
          ) : bgImageUrl ? (
            <>
              <Image src={bgImageUrl} alt="" fill style={{ objectFit: 'cover', zIndex: 0 }} aria-hidden="true" />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
            </>
          ) : null}
          <div style={{ ...inner, maxWidth: 'min(760px, var(--ui-layout-container-max-width))', position: 'relative', zIndex: 2, textAlign: textAlign as CSSProperties['textAlign'], width: '100%' }}>
            {typeof section.eyebrow === 'string' ? (
              <p className="section-label" style={{ color: hasBgMedia ? 'rgba(255,255,255,0.75)' : mutedColor(theme), marginBottom: '20px' }}>
                {section.eyebrow}
              </p>
            ) : null}
            <SectionHeading
              tag={hTag === 'h2' ? 'h1' : hTag}
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: hSize === 'md' ? 'clamp(36px, 5vw, 60px)' : hFontSize,
                lineHeight: 1.1,
                marginBottom: '20px',
                color: hasBgMedia ? '#ffffff' : headingColor(theme),
              }}
            >
              {String(section.heading || '')}
            </SectionHeading>
            {section.subheading ? (
              <p style={{ color: hasBgMedia ? 'rgba(255,255,255,0.85)' : bodyColor(theme), fontSize: '18px', marginBottom: section.primaryCtaLabel ? '28px' : 0 }}>
                {String(section.subheading)}
              </p>
            ) : null}
            {section.primaryCtaLabel ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}>
                <Link className={isDarkTheme(theme) || hasBgMedia ? 'btn-ghost' : 'btn-primary'} href={normalizePath(String(section.primaryCtaHref || '#'))}>
                  {String(section.primaryCtaLabel)}
                </Link>
                {typeof section.secondaryCtaLabel === 'string' && section.secondaryCtaLabel.trim() ? (
                  <Link className="btn-secondary" href={normalizePath(String(section.secondaryCtaHref || '#'))}>
                    {section.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'richTextSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '800px' }}>
            {section.heading ? (
              <SectionHeading
                tag={hTag}
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: hSize === 'md' ? 'clamp(28px, 4vw, 42px)' : hFontSize,
                  marginBottom: '24px',
                  color: headingColor(theme),
                }}
              >
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            <RichText data={section.content as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState | null | undefined} style={{ color: bodyColor(theme) }} />
          </div>
        </section>
      );
    }

    if (section.blockType === 'ctaSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '700px', textAlign: 'center' }}>
            {section.heading ? (
              <SectionHeading
                tag={hTag}
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: hSize === 'md' ? 'clamp(26px, 4vw, 40px)' : hFontSize,
                  color: theme === 'white' || theme === 'light' ? 'var(--ui-color-primary)' : 'var(--ui-color-dark-text)',
                  marginBottom: '16px',
                }}
              >
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            {section.body ? (
              <p style={{ color: theme === 'white' || theme === 'light' ? 'var(--ui-color-text-muted)' : 'var(--ui-color-dark-text-muted)', marginBottom: section.buttonLabel ? '24px' : 0 }}>
                {String(section.body)}
              </p>
            ) : null}
            {section.buttonLabel ? (
              <Link
                className={theme === 'white' || theme === 'light' ? 'btn-primary' : 'btn-ghost'}
                href={normalizePath(String(section.buttonHref || '#'))}
              >
                {String(section.buttonLabel)}
              </Link>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyHeroSection') {
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            padding: heroPadding[size],
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          {dark ? (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
              }}
            />
          ) : null}

          <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
            {typeof section.eyebrow === 'string' && section.eyebrow.trim() ? (
              <p
                className="section-label"
                style={{
                  color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
                  marginBottom: '24px',
                }}
              >
                {section.eyebrow}
              </p>
            ) : null}
            <SectionHeading
              tag={hTag === 'h2' ? 'h1' : hTag}
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: hSize === 'md' ? 'clamp(40px, 6vw, 72px)' : hFontSize,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: section.subheading ? '20px' : '0',
                color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
              }}
            >
              {String(section.heading || '')}
            </SectionHeading>
            {section.subheading ? (
              <p
                style={{
                  fontSize: '18px',
                  lineHeight: 1.6,
                  color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
                  marginBottom:
                    typeof section.primaryCtaLabel === 'string' && section.primaryCtaLabel.trim()
                      ? '36px'
                      : 0,
                }}
              >
                {String(section.subheading)}
              </p>
            ) : null}

            {typeof section.primaryCtaLabel === 'string' && section.primaryCtaLabel.trim() ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Link
                  href={normalizePath(String(section.primaryCtaHref || '#'))}
                  className={dark ? 'btn-ghost' : 'btn-primary'}
                >
                  {section.primaryCtaLabel}
                </Link>
                {typeof section.secondaryCtaLabel === 'string' && section.secondaryCtaLabel.trim() ? (
                  <Link
                    href={normalizePath(String(section.secondaryCtaHref || '#'))}
                    className="btn-secondary"
                  >
                    {section.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyNarrativeSection') {
      const paragraphs = readParagraphArray(section.paragraphs);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '760px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <SectionHeading
                tag={hTag}
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: hSize === 'md' ? 'clamp(28px, 4vw, 44px)' : hFontSize,
                  fontWeight: 700,
                  color: headingColor(theme),
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '20px',
                }}
              >
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: paragraphs.length > 0 ? '28px' : '0',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            {paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${key}-paragraph-${paragraphIndex}`}
                style={{
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: bodyColor(theme),
                  marginBottom: paragraphIndex < paragraphs.length - 1 ? '20px' : '0',
                }}
              >
                {paragraph}
              </p>
            ))}

            {typeof section.linkLabel === 'string' && section.linkLabel.trim() ? (
              <div style={{ marginTop: '28px' }}>
                <Link
                  href={normalizePath(String(section.linkHref || '#'))}
                  style={{
                    color: headingColor(theme),
                    fontWeight: 600,
                    fontSize: '15px',
                    textDecoration: 'none',
                  }}
                  className="text-link"
                >
                  {section.linkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyNumberedStageSection') {
      const items = readItemArray(section.items);
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px' }}>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(80px, 12vw, 140px)',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginLeft: '-4px',
                  userSelect: 'none',
                  color: dark ? 'rgba(255,255,255,0.12)' : 'rgba(27,45,79,0.07)',
                }}
              >
                {String(section.stageNumber || '01')}
              </span>
            </div>

            <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
              {String(section.stageLabel || 'Stage')}
            </p>
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 700,
                color: headingColor(theme),
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              {String(section.heading || '')}
            </h2>
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: '28px',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            {section.body ? (
              <p style={{ fontSize: '17px', color: bodyColor(theme), lineHeight: 1.7, marginBottom: '36px' }}>
                {String(section.body)}
              </p>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: headingColor(theme),
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  What it covers
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item) => (
                    <li
                      key={`${key}-${item}`}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        fontSize: '16px',
                        color: bodyColor(theme),
                        lineHeight: 1.65,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          marginTop: '8px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
                          display: 'inline-block',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {section.whoForBody ? (
                <div
                  style={{
                    backgroundColor:
                      theme === 'white' || theme === 'light'
                        ? 'var(--ui-color-section-alt)'
                        : 'rgba(255,255,255,0.08)',
                    borderLeft: `3px solid ${dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)'}`,
                    borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                    padding: '20px 24px',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '14px', color: headingColor(theme), marginBottom: '6px' }}>
                    {String(section.whoForHeading || 'Who it is for')}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.6 }}>
                    {String(section.whoForBody)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyAudienceGridSection') {
      const audiences = readAudienceArray(section.audiences);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '900px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 700,
                  color: headingColor(theme),
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '40px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2px',
                backgroundColor:
                  theme === 'white' || theme === 'light'
                    ? 'var(--ui-color-border)'
                    : 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {audiences.map((audience, audienceIndex) => (
                <div
                  key={`${key}-audience-${audienceIndex}`}
                  style={{
                    backgroundColor:
                      theme === 'white' || theme === 'light'
                        ? 'var(--ui-color-surface)'
                        : 'rgba(0,0,0,0.1)',
                    padding: '32px 28px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--ui-font-display)',
                      fontWeight: 700,
                      fontSize: '20px',
                      color: headingColor(theme),
                      marginBottom: '10px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {audience.label}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.65 }}>
                    {audience.copy}
                  </p>
                </div>
              ))}
            </div>

            {typeof section.footerText === 'string' && section.footerText.trim() ? (
              <p style={{ fontSize: '14px', color: bodyColor(theme), marginTop: '20px' }}>
                {section.footerText}
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyChecklistSection') {
      const checklistItems = readChecklistArray(section.items);
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 700,
                  color: headingColor(theme),
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '20px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: '40px',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {checklistItems.map((item, itemIndex) => (
                <div
                  key={`${key}-check-${itemIndex}`}
                  style={{
                    display: 'flex',
                    gap: '28px',
                    alignItems: 'flex-start',
                    padding: '28px 0',
                    borderBottom:
                      itemIndex < checklistItems.length - 1
                        ? `1px solid ${theme === 'white' || theme === 'light' ? 'var(--ui-color-border)' : 'rgba(255,255,255,0.2)'}`
                        : 'none',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke={dark ? 'var(--ui-color-black-bg)' : 'var(--ui-color-dark-text)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="12 3 5.5 9.5 2.5 6.5" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '16px', color: headingColor(theme), marginBottom: '4px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {typeof section.footerBody === 'string' && section.footerBody.trim() ? (
              <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65, marginTop: '32px' }}>
                {section.footerBody}
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyQuoteSection') {
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '20px',
              fontFamily: 'var(--ui-font-display)',
              fontSize: 'clamp(160px, 24vw, 320px)',
              fontWeight: 700,
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
              color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(27,45,79,0.05)',
            }}
          >
            &ldquo;
          </div>
          <div style={{ ...inner, maxWidth: '760px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '32px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                color: headingColor(theme),
                lineHeight: 1.35,
                letterSpacing: '-0.02em',
                fontStyle: 'italic',
                maxWidth: '640px',
                margin: '0 auto',
              }}
            >
              {String(section.quote || '')}
            </h2>
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyCenteredCtaSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '620px', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(26px, 4vw, 38px)',
                fontWeight: 700,
                color: headingColor(theme),
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: section.body ? '16px' : '0',
              }}
            >
              {String(section.heading || '')}
            </h2>
            {section.body ? (
              <p style={{ fontSize: '17px', color: bodyColor(theme), lineHeight: 1.65, marginBottom: section.buttonLabel ? '32px' : 0 }}>
                {String(section.body)}
              </p>
            ) : null}
            {typeof section.buttonLabel === 'string' && section.buttonLabel.trim() ? (
              <Link
                href={normalizePath(String(section.buttonHref || '#'))}
                className={isDarkTheme(theme) ? 'btn-ghost' : 'btn-secondary'}
              >
                {section.buttonLabel}
              </Link>
            ) : null}

            {typeof section.secondaryLinkLabel === 'string' && section.secondaryLinkLabel.trim() ? (
              <div style={{ marginTop: '18px' }}>
                <Link
                  href={normalizePath(String(section.secondaryLinkHref || '#'))}
                  style={{ color: bodyColor(theme), fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                  className="text-link"
                >
                  {section.secondaryLinkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'guideFormSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '64px',
                alignItems: 'start',
              }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                  {String(section.label || 'Free resource')}
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    fontWeight: 700,
                    color: headingColor(theme),
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '20px',
                  }}
                >
                  {String(section.heading || 'Get the free guide')}
                </h2>
                <div style={{ width: '32px', height: '3px', backgroundColor: headingColor(theme), marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                {section.highlightText ? (
                  <p style={{ fontSize: '16px', color: bodyColor(theme), lineHeight: 1.7, marginBottom: '16px' }}>
                    <strong style={{ color: headingColor(theme), fontWeight: 600 }}>
                      {String(section.highlightText)}
                    </strong>
                  </p>
                ) : null}
                {section.body ? (
                  <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65 }}>
                    {String(section.body)}
                  </p>
                ) : null}
              </div>

              <div
                style={{
                  backgroundColor: 'var(--ui-color-surface)',
                  border: '1px solid var(--ui-color-border)',
                  borderTop: '3px solid var(--ui-color-primary)',
                  borderRadius: 'var(--ui-button-radius)',
                  padding: '36px',
                }}
              >
                <GuideForm
                  {...guideFormLabels}
                  templateId={
                    section.emailTemplate != null
                      ? (typeof section.emailTemplate === 'object' && section.emailTemplate !== null
                          ? (section.emailTemplate as { id?: string | number }).id
                          : (section.emailTemplate as string | number))
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'inquiryFormSection') {
      const emailAddress = typeof section.emailAddress === 'string' && section.emailAddress.trim()
        ? section.emailAddress.trim()
        : 'hello@plenor.ai';
      const linkedinHref = typeof section.linkedinHref === 'string' && section.linkedinHref.trim()
        ? section.linkedinHref.trim()
        : 'https://www.linkedin.com/company/plenor-ai';
      const linkedinLabel = typeof section.linkedinLabel === 'string' && section.linkedinLabel.trim()
        ? section.linkedinLabel.trim()
        : 'Connect on LinkedIn';

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '64px',
                alignItems: 'start',
              }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                  {String(section.label || 'Send an inquiry')}
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    fontWeight: 700,
                    color: headingColor(theme),
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '20px',
                  }}
                >
                  {String(section.heading || 'Send a direct inquiry')}
                </h2>
                {section.subtext ? (
                  <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65, marginBottom: '32px' }}>
                    {String(section.subtext)}
                  </p>
                ) : null}

                <div
                  style={{
                    padding: '20px 24px',
                    backgroundColor: theme === 'white' || theme === 'light' ? 'var(--ui-color-section-alt)' : 'rgba(255,255,255,0.08)',
                    borderLeft: '3px solid var(--ui-color-primary)',
                    borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                    marginBottom: '28px',
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: headingColor(theme),
                      marginBottom: '6px',
                    }}
                  >
                    {String(section.nextStepsLabel || 'What happens next')}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.6 }}>
                    {String(
                      section.nextStepsBody ||
                        'We review every inquiry and respond within 2 business days.',
                    )}
                  </p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: headingColor(theme), marginBottom: '8px' }}>
                    {String(section.directEmailLabel || 'Prefer email directly?')}
                  </p>
                  <a
                    href={`mailto:${emailAddress}`}
                    style={{ color: headingColor(theme), fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                    className="text-link"
                  >
                    {emailAddress}
                  </a>
                  <span style={{ color: mutedColor(theme), margin: '0 10px' }}>|</span>
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: headingColor(theme), fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                    className="text-link"
                  >
                    {linkedinLabel}
                  </a>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--ui-color-surface)',
                  border: '1px solid var(--ui-color-border)',
                  borderTop: '3px solid var(--ui-color-primary)',
                  borderRadius: 'var(--ui-button-radius)',
                  padding: '36px',
                }}
              >
                <InquiryForm {...inquiryFormLabels} />
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'privacyNoteSection') {
      const policyHref = typeof section.policyLinkHref === 'string' && section.policyLinkHref.trim()
        ? normalizePath(section.policyLinkHref.trim())
        : '/privacy';

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <p style={{ color: mutedColor(theme), fontSize: '13px', margin: 0, textAlign: 'center' }}>
              {String(section.label || 'By submitting this form, you agree to our')}{' '}
              <Link
                href={policyHref}
                style={{ color: mutedColor(theme), textDecoration: 'underline' }}
              >
                {String(section.policyLinkLabel || 'Privacy Policy')}
              </Link>
              .
            </p>
          </div>
        </section>
      );
    }

    if (section.blockType === 'imageSection') {
      const images = Array.isArray(section.images) ? section.images : [];
      const displayMode = section.displayMode === 'slideshow' ? 'slideshow' : 'grid';
      const gridColsNum = typeof section.gridColumns === 'number' && section.gridColumns > 0 ? section.gridColumns : 0;
      const gridTemplateColumns = gridColsNum
        ? `repeat(${gridColsNum}, 1fr)`
        : 'repeat(auto-fit, minmax(240px, 1fr))';
      const aspectRatioMap: Record<string, string> = { square: '1 / 1', landscape: '16 / 9', portrait: '3 / 4' };
      const aspectRatioCss = typeof section.aspectRatio === 'string' ? (aspectRatioMap[section.aspectRatio] ?? undefined) : undefined;

      const imageEntries = images.map((img: unknown) => {
        const entry = img && typeof img === 'object' ? (img as Record<string, unknown>) : {};
        const imageObj = entry.image && typeof entry.image === 'object' ? (entry.image as Record<string, unknown>) : null;
        const url = imageObj ? (typeof imageObj.url === 'string' ? imageObj.url : '') : (typeof entry.url === 'string' ? entry.url : '');
        const defaultAlt = imageObj ? (typeof imageObj.alt === 'string' ? imageObj.alt : '') : (typeof entry.alt === 'string' ? entry.alt : '');
        const alt = typeof entry.altOverride === 'string' && entry.altOverride ? entry.altOverride : defaultAlt;
        const caption = typeof entry.caption === 'string' ? entry.caption : '';
        const linkHref = typeof entry.linkHref === 'string' ? entry.linkHref : '';
        return { url, alt, caption, linkHref };
      }).filter(e => !!e.url);

      const normalizedImages = imageEntries.length > 0 ? imageEntries : normalizeImageEntries(images);

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ marginBottom: '24px', color: headingColor(theme), fontSize: hFontSize }}>{String(section.heading)}</SectionHeading>
            ) : null}
            {displayMode === 'slideshow' ? (
              <ImageSlideshow images={normalizedImages.map(e => ({ url: e.url, alt: e.alt }))} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns, gap: '16px' }}>
                {normalizedImages.map((img, imageIndex: number) => {
                  const imgEl = (
                    <div key={`${key}-img-${imageIndex}`} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ aspectRatio: aspectRatioCss, overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--ui-color-border)' }}>
                        <Image
                          src={img.url}
                          alt={img.alt}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: '100%', height: aspectRatioCss ? '100%' : 'auto', objectFit: aspectRatioCss ? 'cover' : 'initial' }}
                        />
                      </div>
                      {'caption' in img && (img as Record<string, unknown>).caption ? (
                        <p style={{ marginTop: '6px', fontSize: '13px', color: mutedColor(theme) }}>{String((img as Record<string, unknown>).caption)}</p>
                      ) : null}
                    </div>
                  );
                  const href = 'linkHref' in img ? String((img as Record<string, unknown>).linkHref || '') : '';
                  return href ? (
                    <a key={`${key}-img-link-${imageIndex}`} href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {imgEl}
                    </a>
                  ) : imgEl;
                })}
              </div>
            )}
            {section.caption ? (
              <p style={{ marginTop: '12px', color: mutedColor(theme) }}>{String(section.caption)}</p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'videoSection') {
      const embedUrl = typeof section.embedUrl === 'string' ? section.embedUrl : '';
      const posterUrl = getImageUrl(section.posterImage);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '900px' }}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ marginBottom: '18px', color: headingColor(theme), fontSize: hFontSize }}>{String(section.heading)}</SectionHeading>
            ) : null}
            <div style={{ aspectRatio: '16 / 9', backgroundColor: 'var(--ui-color-black-bg)', borderRadius: '8px', overflow: 'hidden' }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={typeof section.heading === 'string' ? section.heading : 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              ) : posterUrl ? (
                <Image src={posterUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: mutedColor(theme) }}>
                  Add an embed URL or poster image
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'simpleTableSection') {
      const columns = Array.isArray(section.columns) ? section.columns : [];
      const rows = Array.isArray(section.rows) ? section.rows : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <SectionHeading tag={hTag} style={{ marginBottom: '20px', color: headingColor(theme), fontSize: hFontSize }}>{String(section.heading)}</SectionHeading> : null}
            <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {columns.map((column: unknown, colIndex: number) => {
                      const label = typeof column === 'object' && column !== null ? (column as Record<string, unknown>).label : column;
                      return (
                        <th
                          key={`${key}-col-${colIndex}`}
                          style={{
                            textAlign: 'left',
                            padding: '12px',
                            borderBottom: '1px solid var(--ui-color-border)',
                            backgroundColor: 'var(--ui-color-section-alt)',
                            color: headingColor(theme),
                          }}
                        >
                          {String(label || '')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: unknown, rowIndex: number) => {
                    const cells = row && typeof row === 'object' && Array.isArray((row as Record<string, unknown>).cells)
                      ? (row as { cells: unknown[] }).cells
                      : [];
                    return (
                      <tr key={`${key}-row-${rowIndex}`}>
                        {cells.map((cell: unknown, cellIndex: number) => {
                          const value = typeof cell === 'object' && cell !== null ? (cell as Record<string, unknown>).value : cell;
                          return (
                            <td
                              key={`${key}-row-${rowIndex}-cell-${cellIndex}`}
                              style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', color: bodyColor(theme) }}
                            >
                              {String(value || '')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'comparisonTableSection') {
      const columns = Array.isArray(section.planColumns) ? section.planColumns : [];
      const features = Array.isArray(section.features) ? section.features : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <SectionHeading tag={hTag} style={{ marginBottom: '20px', color: headingColor(theme), fontSize: hFontSize }}>{String(section.heading)}</SectionHeading> : null}
            <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)', color: headingColor(theme) }}>Feature</th>
                    {columns.map((column: unknown, idx: number) => {
                      const label = typeof column === 'object' && column !== null ? (column as Record<string, unknown>).label : column;
                      return (
                        <th key={`${key}-plan-col-${idx}`} style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)', color: headingColor(theme) }}>
                          {String(label || '')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature: unknown, rowIndex: number) => {
                    const label = feature && typeof feature === 'object' ? String((feature as { label?: string }).label || '') : '';
                    const values =
                      feature && typeof feature === 'object' && Array.isArray((feature as { values?: unknown[] }).values)
                        ? (feature as { values: unknown[] }).values
                        : [];
                    return (
                      <tr key={`${key}-feature-${rowIndex}`}>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', fontWeight: 600, color: headingColor(theme) }}>{label}</td>
                        {values.map((value: unknown, valueIndex: number) => {
                          const v = typeof value === 'object' && value !== null ? (value as Record<string, unknown>).value : value;
                          return (
                            <td key={`${key}-feature-${rowIndex}-value-${valueIndex}`} style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', color: bodyColor(theme) }}>
                              {String(v || '')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'dynamicListSection') {
      const config = section as PageSection & {
        source?: 'serviceItem' | 'blogPost' | 'testimonial';
        viewMode?: 'cards' | 'list' | 'table';
        filterField?: string;
        filterValue?: string;
        sortField?: string;
        sortDirection?: 'asc' | 'desc';
        limit?: number;
        enablePagination?: boolean;
        heading?: string;
      };

      const sourceItems: Array<ServiceItem | BlogPost | Testimonial> =
        config.source === 'blogPost'
          ? collections.blogPosts
          : config.source === 'testimonial'
            ? collections.testimonials
            : collections.serviceItems;

      const filtered = sourceItems.filter((item) =>
        matchesFilter(item as unknown as Record<string, unknown>, config.filterField, config.filterValue)
      );
      const filteredAndSorted = sortItems(
        filtered as unknown as Array<Record<string, unknown>>,
        config.sortField || 'publishedAt',
        config.sortDirection || 'desc'
      ) as unknown as Array<ServiceItem | BlogPost | Testimonial>;

      const limit = typeof config.limit === 'number' && config.limit > 0 ? config.limit : 6;
      const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
      const currentPage = Math.min(listPages[key] || 1, totalPages);
      const start = (currentPage - 1) * limit;
      const pageItems = filteredAndSorted.slice(start, start + limit);

      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {config.heading ? <SectionHeading tag={hTag} style={{ marginBottom: '20px', color: headingColor(theme), fontSize: hFontSize }}>{config.heading}</SectionHeading> : null}
            {config.viewMode === 'table' ? (
              <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)', color: headingColor(theme) }}>Title</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)', color: headingColor(theme) }}>Summary</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)', color: headingColor(theme) }}>Meta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, itemIndex) => {
                      const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                      return (
                        <tr key={`${key}-table-row-${itemIndex}`}>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)' }}>
                            <Link href={normalized.href} style={{ color: headingColor(theme), textDecoration: 'none' }}>
                              {normalized.title}
                            </Link>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', color: bodyColor(theme) }}>{normalized.description}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', color: mutedColor(theme) }}>{normalized.meta}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : config.viewMode === 'list' ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pageItems.map((item, itemIndex) => {
                  const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                  return (
                    <li key={`${key}-list-${itemIndex}`} style={{ border: '1px solid var(--ui-color-border)', borderRadius: '8px', padding: '16px' }}>
                      <Link href={normalized.href} style={{ color: headingColor(theme), fontWeight: 600, textDecoration: 'none' }}>
                        {normalized.title}
                      </Link>
                      {normalized.description ? <p style={{ margin: '8px 0 0', color: mutedColor(theme) }}>{normalized.description}</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {pageItems.map((item, itemIndex) => {
                  const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                  return (
                    <article key={`${key}-card-${itemIndex}`} className="feature-card">
                      <h3 style={{ marginBottom: '8px', color: headingColor(theme), fontSize: '22px' }}>{normalized.title}</h3>
                      <p style={{ color: mutedColor(theme), marginBottom: '14px' }}>{normalized.description}</p>
                      <Link href={normalized.href} style={{ color: headingColor(theme), fontWeight: 600, textDecoration: 'none' }}>
                        Read more →
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            {config.enablePagination !== false && totalPages > 1 ? (
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setListPages((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) - 1) }))
                  }
                >
                  Previous
                </button>
                <span style={{ color: mutedColor(theme), fontSize: '14px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setListPages((prev) => ({ ...prev, [key]: Math.min(totalPages, (prev[key] || 1) + 1) }))
                  }
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'splitSection') {
      const layout = typeof section.layout === 'string' ? section.layout : '50-50';
      const leftFr = layout === '60-40' ? '3fr' : layout === '40-60' ? '2fr' : '1fr';
      const rightFr = layout === '60-40' ? '2fr' : layout === '40-60' ? '3fr' : '1fr';
      const vAlign = section.verticalAlign === 'top' ? 'flex-start' : section.verticalAlign === 'bottom' ? 'flex-end' : 'center';
      const reverseOnMobile = section.reverseOnMobile === true;
      const splitId = `split-${key}`.replace(/[^a-zA-Z0-9-_]/g, '');

      const renderPanel = (side: 'left' | 'right') => {
        const type = String(section[`${side}Type`] || 'richText');
        const heading = typeof section[`${side}Heading`] === 'string' ? section[`${side}Heading`] as string : '';
        const ctaLabel = typeof section[`${side}CtaLabel`] === 'string' ? section[`${side}CtaLabel`] as string : '';
        const ctaHref = typeof section[`${side}CtaHref`] === 'string' ? section[`${side}CtaHref`] as string : '';

        if (type === 'image') {
          const imgUrl = getImageUrl(section[`${side}Image`]);
          return imgUrl ? (
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Image src={imgUrl} alt={heading || ''} width={0} height={0} sizes="(max-width: 768px) 100vw, 50vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          ) : null;
        }

        if (type === 'video') {
          const videoUrl = typeof section[`${side}VideoUrl`] === 'string' ? section[`${side}VideoUrl`] as string : '';
          return videoUrl ? (
            <div style={{ aspectRatio: '16 / 9', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--ui-color-black-bg)' }}>
              <iframe src={videoUrl} title={heading || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 0 }} />
            </div>
          ) : null;
        }

        return (
          <div>
            {heading ? (
              <SectionHeading tag={hTag} style={{ fontFamily: 'var(--ui-font-display)', fontSize: hSize === 'md' ? 'clamp(24px, 3.5vw, 36px)' : hFontSize, fontWeight: 700, color: headingColor(theme), marginBottom: '16px' }}>
                {heading}
              </SectionHeading>
            ) : null}
            <RichText data={section[`${side}Content`] as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState | null | undefined} style={{ color: bodyColor(theme) }} />
            {ctaLabel && ctaHref ? (
              <div style={{ marginTop: '24px' }}>
                <Link href={normalizePath(ctaHref)} className={isDarkTheme(theme) ? 'btn-ghost' : 'btn-primary'}>{ctaLabel}</Link>
              </div>
            ) : null}
          </div>
        );
      };

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `${leftFr} ${rightFr}`,
                gap: '48px',
                alignItems: vAlign,
              }}
              className={`${splitId}-grid`}
            >
              <div style={{ order: reverseOnMobile ? 2 : undefined }} className={`${splitId}-left`}>{renderPanel('left')}</div>
              <div style={{ order: reverseOnMobile ? 1 : undefined }} className={`${splitId}-right`}>{renderPanel('right')}</div>
            </div>
          </div>
          <style>{`
            @media (max-width: 767px) {
              .${splitId}-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
              .${splitId}-left { order: ${reverseOnMobile ? 2 : 1} !important; }
              .${splitId}-right { order: ${reverseOnMobile ? 1 : 2} !important; }
            }
          `}</style>
        </section>
      );
    }

    if (section.blockType === 'reusableSectionReference') {
      const reusableSection = section.reusableSection as {
        id?: string;
        title?: string;
        sections?: PageSection[];
      } | undefined;
      const nestedSections = Array.isArray(reusableSection?.sections) ? reusableSection.sections : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            <SectionHeading tag={hTag} style={{ marginBottom: '16px', color: headingColor(theme), fontSize: hFontSize }}>
              {typeof section.overrideHeading === 'string' ? section.overrideHeading : reusableSection?.title || 'Reusable Section'}
            </SectionHeading>
            {nestedSections.map((nestedSection, nestedIndex) =>
              renderSection(nestedSection, nestedIndex, `${key}-nested-${nestedIndex}-`)
            )}
          </div>
        </section>
      );
    }

    if (section.blockType === 'spacerSection') {
      const height = typeof section.height === 'number' ? section.height : 40;
      return <div key={key} style={{ height: `${height}px` }} />;
    }

    if (section.blockType === 'dividerSection') {
      return (
        <div key={key} style={{ padding: '20px 24px', backgroundColor: resolvedBackgroundColor }}>
          <div style={{ ...inner, borderTop: '1px solid var(--ui-color-border)', paddingTop: '14px' }}>
            {section.label ? <p style={{ margin: 0, fontSize: '12px', color: mutedColor(theme) }}>{String(section.label)}</p> : null}
          </div>
        </div>
      );
    }

    if (section.blockType === 'statsSection') {
      const stats = Array.isArray(section.stats) ? section.stats : [];
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ fontFamily: 'var(--ui-font-display)', fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize, fontWeight: 700, color: headingColor(theme), marginBottom: '12px' }}>
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            {section.subheading ? (
              <p style={{ color: bodyColor(theme), fontSize: '16px', marginBottom: '40px' }}>
                {String(section.subheading)}
              </p>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px' }}>
              {stats.map((stat: unknown, statIndex: number) => {
                const s = stat as { value?: string; label?: string; description?: string };
                return (
                  <div key={`${key}-stat-${statIndex}`} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--ui-font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, lineHeight: 1, color: headingColor(theme), marginBottom: '8px' }}>
                      {String(s.value || '')}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '15px', color: headingColor(theme), marginBottom: s.description ? '6px' : 0 }}>
                      {String(s.label || '')}
                    </p>
                    {s.description ? (
                      <p style={{ fontSize: '13px', color: bodyColor(theme), lineHeight: 1.5, margin: 0 }}>
                        {String(s.description)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'faqSection') {
      const rawItems = Array.isArray(section.items) ? section.items : [];
      const faqItems = rawItems.map((item: unknown) => {
        const i = item as { question?: string; answer?: string };
        return { question: String(i.question || ''), answer: String(i.answer || '') };
      });
      const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      };
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
          <div style={{ ...inner, maxWidth: '800px' }}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ fontFamily: 'var(--ui-font-display)', fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize, fontWeight: 700, color: headingColor(theme), marginBottom: '12px' }}>
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            {section.subheading ? (
              <p style={{ color: bodyColor(theme), fontSize: '16px', marginBottom: '32px' }}>
                {String(section.subheading)}
              </p>
            ) : null}
            <FaqAccordion items={faqItems} theme={theme} />
          </div>
        </section>
      );
    }

    if (section.blockType === 'featureGridSection') {
      const features = Array.isArray(section.features) ? section.features : [];
      const cols = section.columns === '2' ? 2 : section.columns === '4' ? 4 : 3;
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ fontFamily: 'var(--ui-font-display)', fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize, fontWeight: 700, color: headingColor(theme), marginBottom: '12px' }}>
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            {section.subheading ? (
              <p style={{ color: bodyColor(theme), fontSize: '16px', marginBottom: '40px' }}>
                {String(section.subheading)}
              </p>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '24px' }}>
              {features.map((feature: unknown, featureIndex: number) => {
                const f = feature as { icon?: string; title?: string; description?: string; linkLabel?: string; linkHref?: string };
                return (
                  <article
                    key={`${key}-feature-${featureIndex}`}
                    style={{
                      backgroundColor: isDarkTheme(theme) ? 'rgba(255,255,255,0.06)' : 'var(--ui-color-surface)',
                      border: `1px solid ${isDarkTheme(theme) ? 'rgba(255,255,255,0.12)' : 'var(--ui-color-border)'}`,
                      borderRadius: 'var(--ui-card-radius, 8px)',
                      padding: '28px 24px',
                    }}
                  >
                    {f.icon ? (
                      <div style={{ fontSize: '32px', marginBottom: '16px' }} aria-hidden="true">{f.icon}</div>
                    ) : null}
                    <h3 style={{ fontFamily: 'var(--ui-font-display)', fontSize: '18px', fontWeight: 700, color: headingColor(theme), marginBottom: '8px' }}>
                      {String(f.title || '')}
                    </h3>
                    <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.65, margin: 0, marginBottom: f.linkLabel ? '16px' : 0 }}>
                      {String(f.description || '')}
                    </p>
                    {typeof f.linkLabel === 'string' && f.linkLabel.trim() ? (
                      <Link
                        href={normalizePath(String(f.linkHref || '#'))}
                        style={{ fontSize: '14px', fontWeight: 600, color: headingColor(theme), textDecoration: 'none' }}
                        className="text-link"
                      >
                        {f.linkLabel} →
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'formSection') {
      const formId = section.form && typeof section.form === 'object'
        ? String((section.form as { id?: string }).id || '')
        : typeof section.form === 'string'
          ? section.form
          : '';
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '700px' }}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ fontFamily: 'var(--ui-font-display)', fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize, fontWeight: 700, color: headingColor(theme), marginBottom: '12px' }}>
                {String(section.heading)}
              </SectionHeading>
            ) : null}
            {section.subheading ? (
              <p style={{ color: bodyColor(theme), fontSize: '16px', marginBottom: '32px' }}>
                {String(section.subheading)}
              </p>
            ) : null}
            {formId ? (
              <FormRenderer
                formId={formId}
                successMessage={typeof section.successMessage === 'string' ? section.successMessage : undefined}
                theme={theme}
              />
            ) : (
              <p style={{ color: bodyColor(theme) }}>No form selected.</p>
            )}
          </div>
        </section>
      );
    }

    if (section.blockType === 'teamSection') {
      const members = Array.isArray(section.members) ? section.members : [];
      const rawCols = typeof section.columns === 'string' ? section.columns : '3';
      const cols = ['2', '3', '4'].includes(rawCols) ? rawCols : '3';
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <SectionHeading tag={hTag} style={{ textAlign: 'center', marginBottom: section.subheading ? '8px' : '40px', color: headingColor(theme), fontSize: hFontSize }}>{String(section.heading)}</SectionHeading>
            ) : null}
            {section.subheading ? (
              <p style={{ textAlign: 'center', marginBottom: '40px', color: mutedColor(theme) }}>{String(section.subheading)}</p>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '32px' }}>
              {members.map((member: unknown, mIdx: number) => {
                const m = member && typeof member === 'object' ? (member as Record<string, unknown>) : {};
                const photo = m.photo && typeof m.photo === 'object' ? (m.photo as Record<string, unknown>) : null;
                const photoUrl = photo ? (typeof photo.url === 'string' ? photo.url : '') : '';
                return (
                  <div key={`${key}-member-${mIdx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    {photoUrl ? (
                      <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <Image src={photoUrl} alt={typeof m.name === 'string' ? m.name : ''} width={96} height={96} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--ui-color-section-alt)', flexShrink: 0 }} />
                    )}
                    <div style={{ textAlign: 'center' }}>
                      {m.name ? <p style={{ fontWeight: 600, color: headingColor(theme), margin: 0 }}>{String(m.name)}</p> : null}
                      {m.role ? <p style={{ fontSize: '14px', color: mutedColor(theme), margin: '4px 0 0' }}>{String(m.role)}</p> : null}
                      {m.bio ? <p style={{ fontSize: '14px', color: bodyColor(theme), marginTop: '8px' }}>{String(m.bio)}</p> : null}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                        {m.linkedinHref ? <a href={String(m.linkedinHref)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}>LinkedIn</a> : null}
                        {m.twitterHref ? <a href={String(m.twitterHref)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}>Twitter</a> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'logoBandSection') {
      const logos = Array.isArray(section.logos) ? section.logos : [];
      const displayMode = section.displayMode === 'marquee' ? 'marquee' : 'static';
      const logoHeight = typeof section.logoHeight === 'number' && section.logoHeight > 0 ? section.logoHeight : 40;
      const logoItems = logos.map((logo: unknown) => {
        const l = logo && typeof logo === 'object' ? (logo as Record<string, unknown>) : {};
        const img = l.image && typeof l.image === 'object' ? (l.image as Record<string, unknown>) : null;
        const url = img ? (typeof img.url === 'string' ? img.url : '') : '';
        const alt = img ? (typeof img.alt === 'string' ? img.alt : '') : (typeof l.name === 'string' ? l.name : '');
        const href = typeof l.href === 'string' ? l.href : '';
        return { url, alt, href };
      }).filter(l => !!l.url);

      const logoEl = (logo: { url: string; alt: string; href: string }, idx: number) => {
        const img = (
          <Image
            key={`${key}-logo-${idx}`}
            src={logo.url}
            alt={logo.alt}
            width={0}
            height={0}
            sizes="200px"
            style={{ height: `${logoHeight}px`, width: 'auto', objectFit: 'contain', opacity: 0.7, filter: 'grayscale(1)', transition: 'opacity 0.2s, filter 0.2s' }}
          />
        );
        return logo.href ? (
          <a key={`${key}-logo-link-${idx}`} href={logo.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>{img}</a>
        ) : <span key={`${key}-logo-span-${idx}`} style={{ display: 'flex', alignItems: 'center' }}>{img}</span>;
      };

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <p style={{ textAlign: 'center', marginBottom: '32px', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedColor(theme) }}>{String(section.heading)}</p>
            ) : null}
            {displayMode === 'marquee' ? (
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
                <div style={{ display: 'flex', gap: '48px', animation: 'marquee 20s linear infinite', width: 'max-content', alignItems: 'center' }}>
                  {[...logoItems, ...logoItems].map((logo, idx) => logoEl(logo, idx))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
                {logoItems.map((logo, idx) => logoEl(logo, idx))}
              </div>
            )}
          </div>
        </section>
      );
    }

    if (section.blockType === 'quoteSection') {
      const style = typeof section.style === 'string' ? section.style : 'centered';
      const photoObj = section.photo && typeof section.photo === 'object' ? (section.photo as Record<string, unknown>) : null;
      const photoUrl = photoObj ? (typeof photoObj.url === 'string' ? photoObj.url : '') : '';
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '800px' }}>
            <blockquote
              style={{
                margin: 0,
                padding: style === 'left-border' ? '0 0 0 24px' : style === 'pull' ? '24px 0' : '0',
                borderLeft: style === 'left-border' ? `4px solid ${headingColor(theme)}` : 'none',
                textAlign: style === 'centered' ? 'center' : 'left',
              }}
            >
              <p style={{
                fontSize: style === 'pull' ? 'clamp(20px, 3vw, 28px)' : '20px',
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: headingColor(theme),
                margin: '0 0 20px',
              }}>
                &ldquo;{String(section.quote || '')}&rdquo;
              </p>
              {(section.attribution || section.attributionRole || photoUrl) ? (
                <footer style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: style === 'centered' ? 'center' : 'flex-start' }}>
                  {photoUrl ? (
                    <Image src={photoUrl} alt={typeof section.attribution === 'string' ? section.attribution : ''} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  ) : null}
                  <div>
                    {section.attribution ? <cite style={{ fontStyle: 'normal', fontWeight: 600, color: headingColor(theme) }}>{String(section.attribution)}</cite> : null}
                    {section.attributionRole ? <p style={{ fontSize: '14px', color: mutedColor(theme), margin: '2px 0 0' }}>{String(section.attributionRole)}</p> : null}
                  </div>
                </footer>
              ) : null}
            </blockquote>
          </div>
        </section>
      );
    }

    if (section.blockType === 'tabsSection') {
      const tabs = Array.isArray(section.tabs) ? section.tabs : [];
      return (
        <TabsSectionRenderer
          key={key}
          sectionKey={key}
          section={section}
          tabs={tabs}
          sectionStyle={sectionStyle}
          inner={inner}
          theme={theme}
          headingColor={headingColor(theme)}
          mutedColor={mutedColor(theme)}
          bodyColor={bodyColor(theme)}
          hTag={hTag}
          hFontSize={hFontSize}
        />
      );
    }

    return null;
  };

  return (
    <>
      {sections.map((section, index) => renderSection(section, index, `${index}-`))}
    </>
  );
}
