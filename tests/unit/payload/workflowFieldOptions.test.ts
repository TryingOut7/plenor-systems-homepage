import { describe, expect, it } from 'vitest';
import { pageDraftWorkflowStatusField } from '@/payload/fields/workflow';

type OptionLike = string | { label: string; value: string };
type SelectWorkflowField = {
  filterOptions?: (args: unknown) => OptionLike[];
  options: OptionLike[];
};

function optionValue(option: OptionLike): string {
  return typeof option === 'string' ? option : option.value;
}

function getFilteredValues(args: {
  role?: string;
  currentStatus?: string;
  data?: Record<string, unknown>;
  siblingData?: Record<string, unknown>;
}): string[] {
  const field = pageDraftWorkflowStatusField as unknown as SelectWorkflowField;
  const filterOptions = field.filterOptions;
  if (!filterOptions) throw new Error('workflow field is missing filterOptions');

  const options = field.options;
  const filtered = filterOptions({
    data: args.data ?? (args.currentStatus ? { workflowStatus: args.currentStatus } : {}),
    siblingData: args.siblingData ?? {},
    options,
    req: args.role ? { user: { role: args.role } } : {},
  } as never) as OptionLike[];

  return filtered.map(optionValue);
}

describe('workflow status field options', () => {
  it('limits author choices on new drafts to draft and in_review', () => {
    expect(getFilteredValues({ role: 'author' })).toEqual(['draft', 'in_review']);
  });

  it('keeps only valid author transitions for in_review drafts', () => {
    expect(getFilteredValues({ role: 'author', currentStatus: 'in_review' })).toEqual([
      'draft',
      'in_review',
    ]);
  });

  it('allows admin to choose all statuses from draft', () => {
    expect(getFilteredValues({ role: 'admin', currentStatus: 'draft' })).toEqual([
      'draft',
      'in_review',
      'approved',
      'published',
    ]);
  });

  it('is resilient when payload does not provide data or siblingData', () => {
    expect(() => getFilteredValues({ role: 'author', data: undefined, siblingData: undefined })).not.toThrow();
  });
});
