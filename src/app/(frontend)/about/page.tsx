import type { Metadata } from 'next';
import UniversalSections from '@/components/cms/UniversalSections';
import type { CollectionData, PageSection } from '@/payload/cms';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

const EMPTY_COLLECTIONS: CollectionData = {
  serviceItems: [], blogPosts: [], testimonials: [], teamMembers: [], logos: [],
};

export const metadata: Metadata = {
  title: { absolute: 'Why Plenor Exists | Plenor Systems' },
  description: 'Learn why Plenor Systems helps founders and startup teams turn product ideas into clearer product definitions and functional specifications before implementation.',
  alternates: { canonical: 'https://www.plenor.ai/about' },
  openGraph: {
    title: 'Why Plenor Exists | Plenor Systems',
    description: 'Learn why Plenor Systems helps founders and startup teams turn product ideas into clearer product definitions and functional specifications before implementation.',
    url: 'https://www.plenor.ai/about',
  },
};

export default function AboutPage() {
  return <UniversalSections sections={buildCorePresetSections('about', {}) as PageSection[]} collections={EMPTY_COLLECTIONS} />;
}
