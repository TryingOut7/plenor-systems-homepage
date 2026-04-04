import type { BackendPrincipal, BackendRole } from '@plenor/contracts/auth';
import { safeCompare } from '@/lib/timing-safe-equal';

interface ApiKeyEntry {
  key: string;
  role: BackendRole;
  keyId: string;
}

function parseRole(raw: string): BackendRole | null {
  if (raw === 'internal' || raw === 'admin') {
    return raw;
  }
  return null;
}

function parseCompositeEntries(raw: string | undefined): ApiKeyEntry[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry, index) => {
      const [key, roleRaw, keyIdRaw] = entry.split(':').map((v) => v.trim());
      const role = parseRole(roleRaw || '');
      if (!key || !role) return null;
      return {
        key,
        role,
        keyId: keyIdRaw || `${role}-key-${index + 1}`,
      } satisfies ApiKeyEntry;
    })
    .filter((entry): entry is ApiKeyEntry => !!entry);
}

function parseDedicatedKey(
  rawKey: string | undefined,
  role: BackendRole,
  keyId: string,
): ApiKeyEntry[] {
  if (!rawKey) return [];
  return [{ key: rawKey.trim(), role, keyId }];
}

let _cachedApiKeys: ApiKeyEntry[] | null = null;

function getConfiguredApiKeys(): ApiKeyEntry[] {
  if (_cachedApiKeys !== null) return _cachedApiKeys;

  const composite = parseCompositeEntries(process.env.BACKEND_API_KEYS);
  const dedicated = [
    ...parseDedicatedKey(process.env.BACKEND_INTERNAL_API_KEY, 'internal', 'internal-default'),
    ...parseDedicatedKey(process.env.BACKEND_ADMIN_API_KEY, 'admin', 'admin-default'),
  ];
  const merged = [...composite, ...dedicated];

  const deduped = new Map<string, ApiKeyEntry>();
  for (const entry of merged) {
    if (entry.key) {
      deduped.set(entry.key, entry);
    }
  }
  _cachedApiKeys = [...deduped.values()];
  return _cachedApiKeys;
}

export function authenticateBackendApiKey(
  rawApiKey: string | null,
): BackendPrincipal | null {
  if (!rawApiKey) return null;
  const provided = rawApiKey.trim();
  if (!provided) return null;

  let match: ApiKeyEntry | null = null;
  for (const entry of getConfiguredApiKeys()) {
    if (safeCompare(entry.key, provided)) {
      match = entry;
    }
  }

  if (!match) return null;
  return { keyId: match.keyId, role: match.role };
}

export function hasRequiredRole(
  principal: BackendPrincipal,
  allowed: BackendRole[],
): boolean {
  return allowed.includes(principal.role);
}
