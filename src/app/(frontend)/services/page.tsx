import type { Metadata } from 'next';
import UniversalSections from '@/components/cms/UniversalSections';
import type { CollectionData, PageSection } from '@/payload/cms';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

const EMPTY_COLLECTIONS: CollectionData = {
  serviceItems: [], blogPosts: [], testimonials: [], teamMembers: [], logos: [],
};

export const metadata: Metadata = {
  title: { absolute: 'Product and System Definition Services | Plenor Systems' },
  description: 'Explore Plenor offerings for defining business direction, product experience, requirements, system behavior, and professional review before implementation.',
  alternates: { canonical: 'https://www.plenor.ai/services' },
  openGraph: {
    title: 'Product and System Definition Services | Plenor Systems',
    description: 'Explore Plenor offerings for defining business direction, product experience, requirements, system behavior, and professional review before implementation.',
    url: 'https://www.plenor.ai/services',
  },
};

export default function ServicesPage() {
  return <UniversalSections sections={buildCorePresetSections('services', {}) as PageSection[]} collections={EMPTY_COLLECTIONS} />;
}
