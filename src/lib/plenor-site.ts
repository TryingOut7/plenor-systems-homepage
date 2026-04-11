export const FRAMEWORK_CATEGORY_OPTIONS = [
  { label: 'What Plenor Is', value: 'what-plenor-is' },
  { label: 'How the Approach Works', value: 'how-the-approach-works' },
  { label: 'CMS-Driven Website Model', value: 'cms-driven-website-model' },
  { label: 'Why This Is Different', value: 'why-this-is-different' },
] as const;

export const SOLUTION_CATEGORY_OPTIONS = [
  { label: 'Strategy and Definition', value: 'strategy-and-definition' },
  {
    label: 'Website and CMS Implementation',
    value: 'website-and-cms-implementation',
  },
  { label: 'Framework-Led Delivery', value: 'framework-led-delivery' },
] as const;

export const INSIGHT_CATEGORY_OPTIONS = [
  { label: 'Articles', value: 'article' },
  { label: 'Essays', value: 'essay' },
  { label: 'Guides/Resources', value: 'guide-resource' },
] as const;

export const ABOUT_SECTION_OPTIONS = [
  { label: 'Company', value: 'company' },
  { label: 'Founder', value: 'founder' },
  { label: 'Leadership', value: 'leadership' },
  { label: 'Working Principles', value: 'working-principles' },
] as const;

export type FrameworkCategory = (typeof FRAMEWORK_CATEGORY_OPTIONS)[number]['value'];
export type SolutionCategory = (typeof SOLUTION_CATEGORY_OPTIONS)[number]['value'];
export type InsightCategory = (typeof INSIGHT_CATEGORY_OPTIONS)[number]['value'];
export type AboutSection = (typeof ABOUT_SECTION_OPTIONS)[number]['value'];

export const FRAMEWORK_CATEGORY_VALUES = FRAMEWORK_CATEGORY_OPTIONS.map(
  (option) => option.value,
) as readonly FrameworkCategory[];
export const SOLUTION_CATEGORY_VALUES = SOLUTION_CATEGORY_OPTIONS.map(
  (option) => option.value,
) as readonly SolutionCategory[];
export const INSIGHT_CATEGORY_VALUES = INSIGHT_CATEGORY_OPTIONS.map(
  (option) => option.value,
) as readonly InsightCategory[];
export const ABOUT_SECTION_VALUES = ABOUT_SECTION_OPTIONS.map(
  (option) => option.value,
) as readonly AboutSection[];

function buildQueryNavItems<T extends readonly { label: string; value: string }[]>(
  basePath: string,
  options: T,
  key = 'category',
) {
  return options.map((option) => ({
    label: option.label,
    href: `${basePath}?${key}=${option.value}`,
  }));
}

export const FRAMEWORK_SECONDARY_NAV_ITEMS = buildQueryNavItems(
  '/framework',
  FRAMEWORK_CATEGORY_OPTIONS,
);

export const SOLUTION_SECONDARY_NAV_ITEMS = buildQueryNavItems(
  '/solutions',
  SOLUTION_CATEGORY_OPTIONS,
);

export const INSIGHT_SECONDARY_NAV_ITEMS = buildQueryNavItems(
  '/insights',
  INSIGHT_CATEGORY_OPTIONS,
);

export const ABOUT_SECONDARY_NAV_ITEMS = buildQueryNavItems(
  '/about',
  ABOUT_SECTION_OPTIONS,
  'section',
);

export function readSingleQueryParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    return readSingleQueryParam(value[0]);
  }

  return undefined;
}

export function readAllowedQueryValue<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const candidate = readSingleQueryParam(value);
  if (!candidate) return undefined;
  return allowed.includes(candidate as T) ? (candidate as T) : undefined;
}

export function getOptionLabel<T extends readonly { label: string; value: string }[]>(
  options: T,
  value: T[number]['value'] | string | undefined,
): string | undefined {
  return options.find((option) => option.value === value)?.label;
}

export function inferAboutProfileLabel(value: string | undefined): string {
  switch (value) {
    case 'founder':
      return 'Founder';
    case 'mentor':
      return 'Leadership';
    case 'volunteer_team':
      return 'Team Member';
    default:
      return 'Profile';
  }
}

export function mapAboutSectionToProfileCategories(
  section: AboutSection | undefined,
): string[] {
  switch (section) {
    case 'founder':
      return ['founder'];
    case 'leadership':
      return ['mentor'];
    default:
      return [];
  }
}

export function sortGovernedContent<T extends {
  orderingValue?: number;
  publishedAt?: string;
  title?: string;
  name?: string;
}>(
  items: T[],
): T[] {
  return [...items].sort((left, right) => {
    const leftOrdering =
      typeof left.orderingValue === 'number' ? left.orderingValue : Number.POSITIVE_INFINITY;
    const rightOrdering =
      typeof right.orderingValue === 'number'
        ? right.orderingValue
        : Number.POSITIVE_INFINITY;

    if (leftOrdering !== rightOrdering) {
      return leftOrdering - rightOrdering;
    }

    const leftPublished = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
    const rightPublished = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
    if (leftPublished !== rightPublished) {
      return rightPublished - leftPublished;
    }

    const leftTitle = (left.title || left.name || '').toLowerCase();
    const rightTitle = (right.title || right.name || '').toLowerCase();
    return leftTitle.localeCompare(rightTitle);
  });
}
