/**
 * Single source of truth for org-site enum values.
 *
 * Payload collection options, route-param validation, and DB CHECK constraints
 * all derive from these arrays. No inline string literals elsewhere.
 */

export const EVENT_TYPES = ['concert', 'competition', 'festival', 'workshop'] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const EVENT_TYPE_FESTIVAL: EventType = EVENT_TYPES[2];

export const EVENT_STATUSES = ['upcoming_planned', 'current_ongoing', 'past_completed'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export const EVENT_STATUS_UPCOMING_PLANNED: EventStatus = EVENT_STATUSES[0];
export const EVENT_STATUS_CURRENT_ONGOING: EventStatus = EVENT_STATUSES[1];
export const EVENT_STATUS_PAST_COMPLETED: EventStatus = EVENT_STATUSES[2];

export const SPOTLIGHT_CATEGORIES = [
  'student',
  'teacher',
  'volunteer',
  'local_organization',
  'local_prominent_artist',
] as const;
export type SpotlightCategory = (typeof SPOTLIGHT_CATEGORIES)[number];

export const ABOUT_CATEGORIES = ['founder', 'volunteer_team', 'mentor'] as const;
export type AboutCategory = (typeof ABOUT_CATEGORIES)[number];

export const LEARNING_CATEGORIES = ['knowledge_sharing', 'college_prep', 'mentorship'] as const;
export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

export const REGISTRATION_STATUSES = [
  'submitted',
  'payment_pending',
  'payment_confirmation_submitted',
  'payment_confirmed',
  'registration_confirmed',
  'cancelled_rejected',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const HOME_SECTION_KEYS = ['events', 'spotlight', 'learning', 'sponsors'] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const ORG_SLUG_MAX_LENGTH = 120;
export const ORG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateOrgSlug(value: unknown): true | string {
  if (typeof value !== 'string') return 'Slug is required.';

  const trimmed = value.trim();
  if (!trimmed) return 'Slug is required.';

  if (trimmed.length > ORG_SLUG_MAX_LENGTH) {
    return `Slug must be ${ORG_SLUG_MAX_LENGTH} characters or fewer.`;
  }

  if (!ORG_SLUG_PATTERN.test(trimmed)) {
    return 'Slug can only include lowercase letters, numbers, and hyphens.';
  }

  return true;
}

/** Convert a `const` string array to Payload select options. */
export function toPayloadOptions<T extends string>(
  values: readonly T[],
): { label: string; value: T }[] {
  return values.map((v) => ({ label: v, value: v }));
}
