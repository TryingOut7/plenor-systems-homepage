export interface MetricsSnapshot {
  service: string;
  uptimeSeconds: number;
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
    byPath: Record<string, number>;
  };
  timing: {
    averageMs: number;
    maxMs: number;
  };
}

interface MutableMetrics {
  startedAt: number;
  totalRequests: number;
  totalDurationMs: number;
  maxDurationMs: number;
  byMethod: Map<string, number>;
  byStatus: Map<string, number>;
  byPath: Map<string, number>;
}

const registry: MutableMetrics = {
  startedAt: Date.now(),
  totalRequests: 0,
  totalDurationMs: 0,
  maxDurationMs: 0,
  byMethod: new Map(),
  byStatus: new Map(),
  byPath: new Map(),
};

function bump(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) || 0) + 1);
}

function toRecord(map: Map<string, number>): Record<string, number> {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function recordBackendRequest(input: {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}): void {
  registry.totalRequests += 1;
  registry.totalDurationMs += input.durationMs;
  registry.maxDurationMs = Math.max(registry.maxDurationMs, input.durationMs);
  bump(registry.byMethod, input.method.toUpperCase());
  bump(registry.byStatus, String(input.statusCode));
  bump(registry.byPath, input.path);
}

export function getBackendMetricsSnapshot(): MetricsSnapshot {
  return {
    service: 'plenor-backend',
    uptimeSeconds: Math.floor((Date.now() - registry.startedAt) / 1000),
    requests: {
      total: registry.totalRequests,
      byMethod: toRecord(registry.byMethod),
      byStatus: toRecord(registry.byStatus),
      byPath: toRecord(registry.byPath),
    },
    timing: {
      averageMs:
        registry.totalRequests > 0
          ? Number((registry.totalDurationMs / registry.totalRequests).toFixed(2))
          : 0,
      maxMs: Number(registry.maxDurationMs.toFixed(2)),
    },
  };
}
