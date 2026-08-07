import type { Metadata } from 'next';
import UniversalSections from '@/components/cms/UniversalSections';
import type { CollectionData, PageSection } from '@/payload/cms';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

const EMPTY_COLLECTIONS: CollectionData = {
  serviceItems: [], blogPosts: [], testimonials: [], teamMembers: [], logos: [],
};

export const metadata: Metadata = {
  title: { absolute: 'Product Definitions and System Specifications | Plenor Systems' },
  description: 'Plenor turns business knowledge into clear product definitions and system specifications that give AI tools and implementation teams better direction before building begins.',
  alternates: { canonical: 'https://www.plenor.ai/' },
  openGraph: {
    title: 'Product Definitions and System Specifications | Plenor Systems',
    description: 'Plenor turns business knowledge into clear product definitions and system specifications that give AI tools and implementation teams better direction before building begins.',
    url: 'https://www.plenor.ai/',
  },
};

export default function HomePage() {
  return <UniversalSections sections={buildCorePresetSections('home', {}) as PageSection[]} collections={EMPTY_COLLECTIONS} />;
}
