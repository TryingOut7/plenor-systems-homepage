import { describe, expect, it, vi } from 'vitest';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';
import {
  type SitePageGuardRule,
  sitePageGuardInternals,
  sitePagePublishGuardsBeforeChange,
} from '@/payload/hooks/sitePageGuards';

function makeReq(withUser = true, role = 'editor', loggerOverrides?: Record<string, unknown>) {
  return {
    user: withUser ? { id: 'u-1', role } : undefined,
    payload: {
      logger: {
        warn: () => undefined,
        info: () => undefined,
        ...loggerOverrides,
      },
    },
  } as never;
}

describe('site page publish guards', () => {
  it('blocks duplicate structural keys as ERROR_SAVE', () => {
    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'custom',
          workflowStatus: 'draft',
          sections: [
            { id: 'a', blockType: 'richTextSection', structuralKey: 'dup-key', heading: 'A' },
            { id: 'b', blockType: 'richTextSection', structuralKey: 'dup-key', heading: 'B' },
          ],
        },
        originalDoc: {
          presetKey: 'custom',
          workflowStatus: 'draft',
          sections: [],
        },
        req: makeReq(),
      } as never),
    ).toThrow('[ERROR_SAVE]');
  });

  it('normalizes dotted structural keys to strict hyphen format', () => {
    const sections = buildCorePresetSections('home', {});
    const dotted = sections.map((section) => {
      const record = section as Record<string, unknown>;
      return {
        ...record,
        structuralKey: String(record.structuralKey || '').replace(/-/g, '.'),
      };
    });

    const result = sitePagePublishGuardsBeforeChange({
      operation: 'update',
      data: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections: dotted,
      },
      originalDoc: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections,
      },
      req: makeReq(),
    } as never) as Record<string, unknown>;

    const normalizedKeys = (result.sections as Array<Record<string, unknown>>).map((section) =>
      String(section.structuralKey),
    );
    expect(normalizedKeys.every((key) => key.includes('.') === false)).toBe(true);
  });

  it('auto-fills missing structural keys from core preset template constraints', () => {
    const sections = buildCorePresetSections('home', {});
    const keyless = sections.map((section) => {
      const copy = { ...(section as Record<string, unknown>) };
      delete copy.structuralKey;
      return copy;
    });

    const result = sitePagePublishGuardsBeforeChange({
      operation: 'update',
      data: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections: keyless,
      },
      originalDoc: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections,
      },
      req: makeReq(),
    } as never) as Record<string, unknown>;

    const keys = (result.sections as Array<Record<string, unknown>>).map((section) =>
      String(section.structuralKey || ''),
    );
    expect(keys.every((key) => key.length > 0)).toBe(true);
    expect(keys.includes('home-hero')).toBe(true);
  });

  it('enforces completeness rules as ERROR_PUBLISH on publish path', () => {
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'approved',
          sections,
        },
        req: makeReq(),
      } as never),
    ).toThrow('[ERROR_PUBLISH]');
  });

  it('does not block draft saves for completeness-only issues', () => {
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'draft',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'draft',
          sections,
        },
        req: makeReq(),
      } as never),
    ).not.toThrow();
  });

  it('does not block moving a published page back to draft for completeness-only issues', () => {
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'draft',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections,
        },
        req: makeReq(),
      } as never),
    ).not.toThrow();
  });

  it('still enforces publish completeness when updating an already-published page', () => {
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections,
        },
        req: makeReq(),
      } as never),
    ).toThrow('[ERROR_PUBLISH]');
  });

  it('ignores bypassPublishGuards for non-admin users and logs the attempt', () => {
    const warn = vi.fn();
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'approved',
          sections,
        },
        context: {
          bypassPublishGuards: true,
        },
        req: makeReq(true, 'editor', { warn }),
      } as never),
    ).toThrow('[ERROR_PUBLISH]');

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'Site page publish guard bypass ignored for non-admin user',
        userRole: 'editor',
      }),
    );
  });

  it('allows admins to bypass publish guards and records the bypass', () => {
    const warn = vi.fn();
    const sections = buildCorePresetSections('home', {});
    const nextSections = sections.map((section) => {
      if ((section as Record<string, unknown>).structuralKey === 'home-hero') {
        return {
          ...section,
          heading: '',
        };
      }
      return section;
    });

    expect(() =>
      sitePagePublishGuardsBeforeChange({
        operation: 'update',
        data: {
          presetKey: 'home',
          workflowStatus: 'published',
          sections: nextSections,
        },
        originalDoc: {
          presetKey: 'home',
          workflowStatus: 'approved',
          sections,
        },
        context: {
          bypassPublishGuards: true,
        },
        req: makeReq(true, 'admin', { warn }),
      } as never),
    ).not.toThrow();

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'Site page publish guards bypassed by admin',
        userId: 'u-1',
      }),
    );
  });
});

describe('site page guard lifecycle model', () => {
  it('maps all six lifecycle events deterministically', () => {
    const resolve = sitePageGuardInternals.resolveGuardLifecycleEvent;

    expect(resolve({
      oldStatus: 'draft',
      newStatus: 'draft',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('draft_save');

    expect(resolve({
      oldStatus: 'draft',
      newStatus: 'in_review',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('submit_for_review');

    expect(resolve({
      oldStatus: 'in_review',
      newStatus: 'approved',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('approve');

    expect(resolve({
      oldStatus: 'approved',
      newStatus: 'published',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('publish');

    expect(resolve({
      oldStatus: 'approved',
      newStatus: 'published',
      req: {},
      context: {},
    })).toBe('publish');

    expect(resolve({
      oldStatus: 'published',
      newStatus: 'published',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('update_published_document');

    expect(resolve({
      oldStatus: 'published',
      newStatus: 'draft',
      req: { user: { id: '1' } },
      context: {},
    })).toBe('draft_save');
  });
});

describe('site page guard severities', () => {
  it('routes failures into ERROR_SAVE / ERROR_PUBLISH / WARN / INFO buckets', () => {
    const rules: SitePageGuardRule[] = [
      {
        preset: 'home',
        structuralKey: 'home-hero',
        severity: 'ERROR_SAVE',
        message: 'shape',
        validate: () => false,
      },
      {
        preset: 'home',
        structuralKey: 'home-hero',
        severity: 'ERROR_PUBLISH',
        message: 'publish',
        validate: () => false,
      },
      {
        preset: 'home',
        structuralKey: 'home-hero',
        severity: 'WARN',
        message: 'warn',
        validate: () => false,
      },
      {
        preset: 'home',
        structuralKey: 'home-hero',
        severity: 'INFO',
        message: 'info',
        validate: () => false,
      },
    ];

    const sections = [
      {
        structuralKey: 'home-hero',
        blockType: 'heroSection',
      },
    ];
    const result = sitePageGuardInternals.runCompletenessRules('home', sections, rules);

    expect(result.ERROR_SAVE).toHaveLength(1);
    expect(result.ERROR_PUBLISH).toHaveLength(1);
    expect(result.WARN).toHaveLength(1);
    expect(result.INFO).toHaveLength(1);
  });
});

describe('site page quality scoring', () => {
  it('derives a blocked score when structural/save errors exist', () => {
    const score = sitePageGuardInternals.buildPublishQualityScore({
      structuralErrors: ['duplicate'],
      completeness: {
        ERROR_SAVE: [],
        ERROR_PUBLISH: [],
        WARN: [],
        INFO: [],
      },
    });

    expect(score.level).toBe('blocked');
    expect(score.score).toBeLessThan(100);
  });

  it('populates publish quality fields on successful draft saves', () => {
    const sections = buildCorePresetSections('home', {});
    const result = sitePagePublishGuardsBeforeChange({
      operation: 'update',
      data: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections,
      },
      originalDoc: {
        presetKey: 'home',
        workflowStatus: 'draft',
        sections,
      },
      req: makeReq(),
    } as never) as Record<string, unknown>;

    expect(typeof result.publishQualityScore).toBe('number');
    expect(typeof result.publishQualityLevel).toBe('string');
    expect(result.previewDiffSummary).toBeTruthy();
  });
});

describe('site page preview diff summary', () => {
  it('reports drift when structural keys do not match template', () => {
    const sections = buildCorePresetSections('home', {}).map((section, index) => {
      if (index !== 0) return section as Record<string, unknown>;
      return {
        ...(section as Record<string, unknown>),
        structuralKey: 'home-hero-renamed',
      };
    });

    const diff = sitePageGuardInternals.buildPreviewDiffSummary(
      'home',
      sections as Array<Record<string, unknown>>,
    ) as Record<string, unknown>;

    expect(diff.status).toBe('drift_detected');
    expect(Array.isArray(diff.missingStructuralKeys)).toBe(true);
    expect(Array.isArray(diff.unexpectedStructuralKeys)).toBe(true);
  });
});
