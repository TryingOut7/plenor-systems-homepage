import { describe, expect, it } from 'vitest';
import {
  EVENT_STATUSES,
  EVENT_STATUS_CURRENT_ONGOING,
  EVENT_STATUS_PAST_COMPLETED,
  EVENT_STATUS_UPCOMING_PLANNED,
} from '@/domain/org-site/constants';

/**
 * Unit tests for event partitioning and sort-order rules.
 *
 * The plan specifies (Rule 20):
 *   - Events page partitions into 3 buckets: upcoming_planned, current_ongoing, past_completed
 *   - Within each bucket: sort by displayPriority desc, then startDate asc
 *   - Past events are capped at 12 most recent
 *
 * These tests verify the ordering contract using the same comparator logic as
 * compareEventPriorityThenStartDateAsc in orgSiteQueries.ts without coupling to
 * Payload's network layer.
 */

type MinimalEvent = {
  id: number;
  eventStatus: string;
  displayPriority: number | null;
  startDate: string | null;
};

function compareEventPriorityThenStartDateAsc(a: MinimalEvent, b: MinimalEvent): number {
  const aPriority = typeof a.displayPriority === 'number' && Number.isFinite(a.displayPriority) ? a.displayPriority : 0;
  const bPriority = typeof b.displayPriority === 'number' && Number.isFinite(b.displayPriority) ? b.displayPriority : 0;

  const priorityDiff = bPriority - aPriority;
  if (priorityDiff !== 0) return priorityDiff;

  const aMs = a.startDate ? (Number.isFinite(Date.parse(a.startDate)) ? Date.parse(a.startDate) : 0) : 0;
  const bMs = b.startDate ? (Number.isFinite(Date.parse(b.startDate)) ? Date.parse(b.startDate) : 0) : 0;
  return aMs - bMs;
}

function partitionByStatus(events: MinimalEvent[]): {
  upcoming: MinimalEvent[];
  ongoing: MinimalEvent[];
  past: MinimalEvent[];
} {
  return {
    upcoming: events.filter((e) => e.eventStatus === EVENT_STATUS_UPCOMING_PLANNED),
    ongoing: events.filter((e) => e.eventStatus === EVENT_STATUS_CURRENT_ONGOING),
    past: events.filter((e) => e.eventStatus === EVENT_STATUS_PAST_COMPLETED),
  };
}

describe('event sort buckets', () => {
  describe('EVENT_STATUSES constants', () => {
    it('has all 3 expected statuses', () => {
      expect(EVENT_STATUSES).toContain('upcoming_planned');
      expect(EVENT_STATUSES).toContain('current_ongoing');
      expect(EVENT_STATUSES).toContain('past_completed');
      expect(EVENT_STATUSES).toHaveLength(3);
    });
  });

  describe('partitionByStatus', () => {
    const events: MinimalEvent[] = [
      { id: 1, eventStatus: 'upcoming_planned', displayPriority: 1, startDate: '2026-05-01' },
      { id: 2, eventStatus: 'current_ongoing', displayPriority: 5, startDate: '2026-04-01' },
      { id: 3, eventStatus: 'past_completed', displayPriority: 0, startDate: '2025-12-01' },
      { id: 4, eventStatus: 'upcoming_planned', displayPriority: 3, startDate: '2026-06-01' },
      { id: 5, eventStatus: 'past_completed', displayPriority: 2, startDate: '2025-11-01' },
    ];

    it('routes upcoming_planned events to the upcoming bucket', () => {
      const { upcoming } = partitionByStatus(events);
      expect(upcoming.map((e) => e.id)).toEqual(expect.arrayContaining([1, 4]));
      expect(upcoming).toHaveLength(2);
    });

    it('routes current_ongoing events to the ongoing bucket', () => {
      const { ongoing } = partitionByStatus(events);
      expect(ongoing.map((e) => e.id)).toEqual([2]);
    });

    it('routes past_completed events to the past bucket', () => {
      const { past } = partitionByStatus(events);
      expect(past.map((e) => e.id)).toEqual(expect.arrayContaining([3, 5]));
      expect(past).toHaveLength(2);
    });

    it('does not bleed events across buckets', () => {
      const { upcoming, ongoing, past } = partitionByStatus(events);
      const total = upcoming.length + ongoing.length + past.length;
      expect(total).toBe(events.length);
    });
  });

  describe('sort: displayPriority desc, startDate asc', () => {
    it('sorts higher displayPriority first', () => {
      const events: MinimalEvent[] = [
        { id: 1, eventStatus: 'upcoming_planned', displayPriority: 1, startDate: '2026-05-01' },
        { id: 2, eventStatus: 'upcoming_planned', displayPriority: 5, startDate: '2026-05-01' },
        { id: 3, eventStatus: 'upcoming_planned', displayPriority: 3, startDate: '2026-05-01' },
      ];

      const sorted = [...events].sort(compareEventPriorityThenStartDateAsc);
      expect(sorted.map((e) => e.id)).toEqual([2, 3, 1]);
    });

    it('breaks priority ties by startDate ascending', () => {
      const events: MinimalEvent[] = [
        { id: 1, eventStatus: 'upcoming_planned', displayPriority: 2, startDate: '2026-07-01' },
        { id: 2, eventStatus: 'upcoming_planned', displayPriority: 2, startDate: '2026-05-01' },
        { id: 3, eventStatus: 'upcoming_planned', displayPriority: 2, startDate: '2026-06-01' },
      ];

      const sorted = [...events].sort(compareEventPriorityThenStartDateAsc);
      expect(sorted.map((e) => e.id)).toEqual([2, 3, 1]);
    });

    it('treats null displayPriority as 0', () => {
      const events: MinimalEvent[] = [
        { id: 1, eventStatus: 'upcoming_planned', displayPriority: null, startDate: '2026-05-01' },
        { id: 2, eventStatus: 'upcoming_planned', displayPriority: 1, startDate: '2026-05-01' },
      ];

      const sorted = [...events].sort(compareEventPriorityThenStartDateAsc);
      expect(sorted[0]!.id).toBe(2); // priority 1 before null (0)
    });

    it('treats null startDate as epoch (earliest)', () => {
      const events: MinimalEvent[] = [
        { id: 1, eventStatus: 'upcoming_planned', displayPriority: 1, startDate: '2026-05-01' },
        { id: 2, eventStatus: 'upcoming_planned', displayPriority: 1, startDate: null },
      ];

      const sorted = [...events].sort(compareEventPriorityThenStartDateAsc);
      expect(sorted[0]!.id).toBe(2); // null startDate → epoch → comes first asc
    });
  });

  describe('past event cap at 12', () => {
    it('caps past events at 12 items', () => {
      const pastEvents: MinimalEvent[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        eventStatus: 'past_completed',
        displayPriority: 0,
        startDate: `2025-${String(i + 1).padStart(2, '0')}-01`,
      }));

      // Simulate cap: sort by startDate desc (most recent), then take 12.
      const sorted = [...pastEvents].sort(
        (a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''),
      );
      const capped = sorted.slice(0, 12);

      expect(capped).toHaveLength(12);
      // The 12 most recent should have the highest month numbers.
      const monthNums = capped.map((e) => parseInt(e.startDate!.split('-')[1]!, 10));
      expect(Math.min(...monthNums)).toBeGreaterThan(8); // months 9-20 (capped to 12)
    });
  });
});
