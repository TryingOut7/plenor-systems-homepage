type AuditLogRecord = {
  changedAt?: string;
  riskTier?: string;
  action?: string;
  collection?: string;
  actorRole?: string;
  fieldPath?: string;
};

export type AuditDashboardSummary = {
  totalEvents: number;
  systemRiskEvents: number;
  routineEvents: number;
  topCollections: Array<{ collection: string; count: number }>;
  actionBreakdown: Array<{ action: string; count: number }>;
  actorRoleBreakdown: Array<{ role: string; count: number }>;
  systemFieldChanges: Array<{ fieldPath: string; count: number }>;
};

function incrementCounter(map: Map<string, number>, key: string): void {
  const current = map.get(key) || 0;
  map.set(key, current + 1);
}

function sortedCounts(map: Map<string, number>, limit = 10): Array<[string, number]> {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

export function buildAuditDashboardSummary(logs: AuditLogRecord[]): AuditDashboardSummary {
  const collectionCounts = new Map<string, number>();
  const actionCounts = new Map<string, number>();
  const roleCounts = new Map<string, number>();
  const systemFieldCounts = new Map<string, number>();

  let systemRiskEvents = 0;
  let routineEvents = 0;

  for (const log of logs) {
    const collection = typeof log.collection === 'string' ? log.collection : 'unknown';
    const action = typeof log.action === 'string' ? log.action : 'unknown';
    const role = typeof log.actorRole === 'string' ? log.actorRole : 'unknown';
    const fieldPath = typeof log.fieldPath === 'string' ? log.fieldPath : '';

    incrementCounter(collectionCounts, collection);
    incrementCounter(actionCounts, action);
    incrementCounter(roleCounts, role);

    if (log.riskTier === 'system') {
      systemRiskEvents += 1;
      if (fieldPath && fieldPath !== '*') {
        incrementCounter(systemFieldCounts, fieldPath);
      }
    } else {
      routineEvents += 1;
    }
  }

  return {
    totalEvents: logs.length,
    systemRiskEvents,
    routineEvents,
    topCollections: sortedCounts(collectionCounts).map(([collection, count]) => ({ collection, count })),
    actionBreakdown: sortedCounts(actionCounts).map(([action, count]) => ({ action, count })),
    actorRoleBreakdown: sortedCounts(roleCounts).map(([role, count]) => ({ role, count })),
    systemFieldChanges: sortedCounts(systemFieldCounts).map(([fieldPath, count]) => ({ fieldPath, count })),
  };
}
