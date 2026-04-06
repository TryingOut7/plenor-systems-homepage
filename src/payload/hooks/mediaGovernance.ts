import type { CollectionBeforeChangeHook } from 'payload';

type RecordValue = Record<string, unknown>;

function readRole(user: unknown): string {
  if (!user || typeof user !== 'object') return '';
  const role = (user as RecordValue).role;
  return typeof role === 'string' ? role : '';
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function canApproveMedia(user: unknown): boolean {
  const role = readRole(user);
  return role === 'admin' || role === 'editor';
}

export const mediaGovernanceBeforeChange: CollectionBeforeChangeHook = ({
  data,
  req,
  originalDoc,
}) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = { ...(data as RecordValue) };
  const original = originalDoc && typeof originalDoc === 'object'
    ? (originalDoc as RecordValue)
    : {};

  const alt = readString(incoming.alt);
  if (alt.length < 8) {
    throw new Error('Media governance: alt text must be at least 8 characters for accessibility.');
  }

  const usageScope = readString(incoming.usageScope) || readString(original.usageScope) || 'site-only';
  incoming.usageScope = usageScope;

  if (usageScope === 'licensed-third-party') {
    const licenseSource = readString(incoming.licenseSource) || readString(original.licenseSource);
    if (!licenseSource) {
      throw new Error('Media governance: licenseSource is required for third-party licensed assets.');
    }
    incoming.licenseSource = licenseSource;
  }

  const requiresAttribution = incoming.requiresAttribution === true;
  if (requiresAttribution) {
    const attributionText = readString(incoming.attributionText) || readString(original.attributionText);
    if (!attributionText) {
      throw new Error('Media governance: attributionText is required when requiresAttribution is enabled.');
    }
    incoming.attributionText = attributionText;
  }

  const user = req.user as unknown as RecordValue | undefined;
  const requestedStatus = readString(incoming.mediaQaStatus);
  if (requestedStatus === 'approved' && !canApproveMedia(user)) {
    throw new Error('Media governance: only editors/admins can set mediaQaStatus=approved.');
  }

  if (requestedStatus === 'approved' && canApproveMedia(user)) {
    if (!incoming.usageApprovedBy) {
      incoming.usageApprovedBy = user?.id || null;
    }
    incoming.usageApprovedAt = new Date().toISOString();
  }

  const expiresAtRaw = readString(incoming.licenseExpiresAt) || readString(original.licenseExpiresAt);
  if (expiresAtRaw) {
    const expiresAt = new Date(expiresAtRaw);
    if (!Number.isNaN(expiresAt.getTime())) {
      const msUntilExpiry = expiresAt.getTime() - Date.now();
      const expiresInDays = Math.ceil(msUntilExpiry / (1000 * 60 * 60 * 24));

      if (expiresInDays < 0) {
        incoming.mediaQaStatus = 'restricted';
      } else if (expiresInDays <= 30) {
        req.payload.logger.warn({
          msg: 'Media governance: license will expire within 30 days.',
          mediaId: incoming.id || original.id || null,
          expiresAt: expiresAt.toISOString(),
          daysRemaining: expiresInDays,
        });
      }
    }
  }

  return incoming;
};
