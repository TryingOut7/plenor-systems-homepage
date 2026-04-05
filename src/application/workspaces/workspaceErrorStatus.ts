export function inferWorkspaceErrorStatus(message: string): number {
  const lowered = message.toLowerCase();

  if (lowered.includes('not found')) return 404;
  if (lowered.includes('forbidden') || lowered.includes('permission')) return 403;
  if (lowered.includes('unauthorized') || lowered.includes('authentication')) return 401;
  if (lowered.includes('conflict') || lowered.includes('already exists') || lowered.includes('duplicate')) {
    return 409;
  }
  if (lowered.includes('too many requests') || lowered.includes('rate limit')) return 429;
  if (
    lowered.includes('dependency') ||
    lowered.includes('unavailable') ||
    lowered.includes('timeout')
  ) {
    return 503;
  }

  return 400;
}
