import { describe, expect, it } from 'vitest';
import {
  SPOTLIGHT_CATEGORIES,
  ABOUT_CATEGORIES,
  LEARNING_CATEGORIES,
  type SpotlightCategory,
  type AboutCategory,
  type LearningCategory,
} from '@/domain/org-site/constants';

/**
 * Unit tests for category route parameter validation logic (Rule 17, Plan §Phase 2).
 *
 * These tests verify the validation contract used by dynamic [category] route segments.
 * The route pages call `notFound()` when the category param is not a member of its
 * respective constant array. This file validates:
 *   - All valid categories are accepted (no false negatives)
 *   - Invalid/unknown strings are rejected (no false positives)
 *   - Empty string, numeric-looking strings, and mixed-case variants are rejected
 */

function isValidSpotlightCategory(value: unknown): value is SpotlightCategory {
  return SPOTLIGHT_CATEGORIES.includes(value as SpotlightCategory);
}

function isValidAboutCategory(value: unknown): value is AboutCategory {
  return ABOUT_CATEGORIES.includes(value as AboutCategory);
}

function isValidLearningCategory(value: unknown): value is LearningCategory {
  return LEARNING_CATEGORIES.includes(value as LearningCategory);
}

describe('category route validation', () => {
  describe('SPOTLIGHT_CATEGORIES', () => {
    it('has all 5 expected values', () => {
      expect(SPOTLIGHT_CATEGORIES).toHaveLength(5);
      expect(SPOTLIGHT_CATEGORIES).toContain('student');
      expect(SPOTLIGHT_CATEGORIES).toContain('teacher');
      expect(SPOTLIGHT_CATEGORIES).toContain('volunteer');
      expect(SPOTLIGHT_CATEGORIES).toContain('local_organization');
      expect(SPOTLIGHT_CATEGORIES).toContain('local_prominent_artist');
    });

    it('accepts all valid spotlight categories', () => {
      for (const cat of SPOTLIGHT_CATEGORIES) {
        expect(isValidSpotlightCategory(cat)).toBe(true);
      }
    });

    it('rejects unknown spotlight category', () => {
      expect(isValidSpotlightCategory('unknown')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidSpotlightCategory('')).toBe(false);
    });

    it('rejects mixed case variants', () => {
      expect(isValidSpotlightCategory('Student')).toBe(false);
      expect(isValidSpotlightCategory('TEACHER')).toBe(false);
    });

    it('rejects partial matches', () => {
      expect(isValidSpotlightCategory('studen')).toBe(false);
      expect(isValidSpotlightCategory('local')).toBe(false);
    });

    it('rejects about or learning category values', () => {
      expect(isValidSpotlightCategory('founder')).toBe(false);
      expect(isValidSpotlightCategory('knowledge_sharing')).toBe(false);
    });

    it('rejects undefined and null', () => {
      expect(isValidSpotlightCategory(undefined)).toBe(false);
      expect(isValidSpotlightCategory(null)).toBe(false);
    });
  });

  describe('ABOUT_CATEGORIES', () => {
    it('has all 3 expected values', () => {
      expect(ABOUT_CATEGORIES).toHaveLength(3);
      expect(ABOUT_CATEGORIES).toContain('founder');
      expect(ABOUT_CATEGORIES).toContain('volunteer_team');
      expect(ABOUT_CATEGORIES).toContain('mentor');
    });

    it('accepts all valid about categories', () => {
      for (const cat of ABOUT_CATEGORIES) {
        expect(isValidAboutCategory(cat)).toBe(true);
      }
    });

    it('rejects unknown about category', () => {
      expect(isValidAboutCategory('invalid')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidAboutCategory('')).toBe(false);
    });

    it('rejects spotlight category values', () => {
      expect(isValidAboutCategory('student')).toBe(false);
      expect(isValidAboutCategory('teacher')).toBe(false);
    });

    it('rejects mixed case', () => {
      expect(isValidAboutCategory('Founder')).toBe(false);
      expect(isValidAboutCategory('MENTOR')).toBe(false);
    });

    it('rejects undefined and null', () => {
      expect(isValidAboutCategory(undefined)).toBe(false);
      expect(isValidAboutCategory(null)).toBe(false);
    });
  });

  describe('LEARNING_CATEGORIES', () => {
    it('has all 3 expected values', () => {
      expect(LEARNING_CATEGORIES).toHaveLength(3);
      expect(LEARNING_CATEGORIES).toContain('knowledge_sharing');
      expect(LEARNING_CATEGORIES).toContain('college_prep');
      expect(LEARNING_CATEGORIES).toContain('mentorship');
    });

    it('accepts all valid learning categories', () => {
      for (const cat of LEARNING_CATEGORIES) {
        expect(isValidLearningCategory(cat)).toBe(true);
      }
    });

    it('rejects unknown learning category', () => {
      expect(isValidLearningCategory('coding')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidLearningCategory('')).toBe(false);
    });

    it('rejects mixed case', () => {
      expect(isValidLearningCategory('Knowledge_Sharing')).toBe(false);
      expect(isValidLearningCategory('MENTORSHIP')).toBe(false);
    });

    it('rejects spotlight or about category values', () => {
      expect(isValidLearningCategory('volunteer')).toBe(false);
      expect(isValidLearningCategory('founder')).toBe(false);
    });

    it('rejects partial category names', () => {
      expect(isValidLearningCategory('college')).toBe(false);
      expect(isValidLearningCategory('mentor')).toBe(false); // 'mentor' is in ABOUT, not LEARNING
    });

    it('rejects undefined and null', () => {
      expect(isValidLearningCategory(undefined)).toBe(false);
      expect(isValidLearningCategory(null)).toBe(false);
    });
  });

  describe('cross-category isolation', () => {
    it('categories do not overlap between collections', () => {
      const spotlightSet = new Set<string>(SPOTLIGHT_CATEGORIES);
      const aboutSet = new Set<string>(ABOUT_CATEGORIES);
      const learningSet = new Set<string>(LEARNING_CATEGORIES);

      for (const cat of ABOUT_CATEGORIES) {
        expect(spotlightSet.has(cat)).toBe(false);
        expect(learningSet.has(cat)).toBe(false);
      }
      for (const cat of LEARNING_CATEGORIES) {
        expect(spotlightSet.has(cat)).toBe(false);
        expect(aboutSet.has(cat)).toBe(false);
      }
      for (const cat of SPOTLIGHT_CATEGORIES) {
        expect(aboutSet.has(cat)).toBe(false);
        expect(learningSet.has(cat)).toBe(false);
      }
    });
  });
});
