import { describe, expect, it } from 'vitest';
import { inferWorkspaceErrorStatus } from '@/application/workspaces/workspaceErrorStatus';

describe('application/workspaces/workspaceErrorStatus', () => {
  it('maps common workspace error messages to stable HTTP status codes', () => {
    expect(inferWorkspaceErrorStatus('Draft not found.')).toBe(404);
    expect(inferWorkspaceErrorStatus('Insufficient permissions.')).toBe(403);
    expect(inferWorkspaceErrorStatus('Authentication required.')).toBe(401);
    expect(inferWorkspaceErrorStatus('Conflict: preset already exists.')).toBe(409);
    expect(inferWorkspaceErrorStatus('Rate limit exceeded.')).toBe(429);
    expect(inferWorkspaceErrorStatus('Dependency unavailable.')).toBe(503);
    expect(inferWorkspaceErrorStatus('Validation failed.')).toBe(400);
  });
});
