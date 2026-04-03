import { describe, expect, it } from 'vitest';
import {
  canEditAdvancedTier,
  canManageRedirectRules,
  canManageSystemFields,
  isAdvancedLane,
} from '@/payload/access/editorLanes';

describe('editor lane access', () => {
  it('allows advanced-tier editing for admin/editor and requires advanced lane for authors', () => {
    expect(
      canEditAdvancedTier({ role: 'editor', cmsLanePreference: 'simple' }),
    ).toBe(true);
    expect(
      canEditAdvancedTier({ role: 'admin', cmsLanePreference: 'simple' }),
    ).toBe(true);
    expect(
      canEditAdvancedTier({ role: 'editor', cmsLanePreference: 'advanced' }),
    ).toBe(true);
    expect(
      canEditAdvancedTier({ role: 'author', cmsLanePreference: 'simple' }),
    ).toBe(false);
    expect(
      canEditAdvancedTier({ role: 'author', cmsLanePreference: 'advanced' }),
    ).toBe(true);
    expect(isAdvancedLane({ cmsLanePreference: 'advanced' })).toBe(true);
  });

  it('allows system management for admin and trusted editors only', () => {
    expect(canManageSystemFields({ role: 'admin' })).toBe(true);
    expect(canManageSystemFields({ role: 'editor', canManageSystemFields: true })).toBe(true);
    expect(canManageSystemFields({ role: 'editor', canManageSystemFields: false })).toBe(false);
    expect(canManageRedirectRules({ role: 'editor', canManageSystemFields: true })).toBe(true);
    expect(canManageRedirectRules({ role: 'author', canManageSystemFields: true })).toBe(false);
  });
});
