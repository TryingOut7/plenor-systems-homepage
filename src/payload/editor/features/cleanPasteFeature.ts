import { createServerFeature } from '@payloadcms/richtext-lexical';

export const CleanPasteFeature = createServerFeature({
  key: 'cleanPaste',
  feature: {
    ClientFeature: '@/payload/editor/features/cleanPasteFeature.client#CleanPasteFeatureClient',
  },
});
