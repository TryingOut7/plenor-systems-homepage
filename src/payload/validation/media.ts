type MediaUploadLike = {
  id?: unknown;
  mimeType?: unknown;
};

type ImageUploadValidationContext = {
  req?: {
    payload?: {
      findByID: (args: {
        collection: 'media';
        id: number | string;
        depth?: number;
        overrideAccess?: boolean;
      }) => Promise<unknown>;
    };
  };
};

function extractMediaId(value: unknown): number | string | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value;

  if (!value || typeof value !== 'object') return null;
  const maybeId = (value as MediaUploadLike).id;
  if (typeof maybeId === 'number') return maybeId;
  if (typeof maybeId === 'string' && maybeId.trim()) return maybeId;

  return null;
}

function isImageMimeType(value: unknown): boolean {
  return typeof value === 'string' && value.toLowerCase().startsWith('image/');
}

/**
 * Enforce image-only uploads for fields that must never accept documents (e.g. QR codes).
 */
export async function validateImageUploadReference(
  value: unknown,
  context?: ImageUploadValidationContext,
): Promise<true | string> {
  if (value === null || value === undefined || value === '') return true;

  const mediaId = extractMediaId(value);
  if (mediaId === null) return 'Select a valid media upload.';

  const payloadApi = context?.req?.payload;
  if (!payloadApi) return true;

  try {
    const mediaDoc = await payloadApi.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
      overrideAccess: true,
    });

    const mimeType =
      mediaDoc && typeof mediaDoc === 'object' ? (mediaDoc as MediaUploadLike).mimeType : null;
    if (!isImageMimeType(mimeType)) {
      return 'Only image uploads are allowed for this field.';
    }
  } catch {
    return 'Select a valid media upload.';
  }

  return true;
}
