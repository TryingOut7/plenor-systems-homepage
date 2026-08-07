import type { Metadata } from 'next';
import UniversalSections from '@/components/cms/UniversalSections';
import type { CollectionData, PageSection } from '@/payload/cms';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

const EMPTY_COLLECTIONS: CollectionData = {
  serviceItems: [], blogPosts: [], testimonials: [], teamMembers: [], logos: [],
};

export const metadata: Metadata = {
  title: { absolute: 'Contact Plenor | Plenor Systems' },
  description: 'Contact Plenor Systems to discuss a product idea, business problem, or product and system definition challenge.',
  alternates: { canonical: 'https://www.plenor.ai/contact' },
  openGraph: {
    title: 'Contact Plenor | Plenor Systems',
    description: 'Contact Plenor Systems to discuss a product idea, business problem, or product and system definition challenge.',
    url: 'https://www.plenor.ai/contact',
  },
};

export default function ContactPage() {
  return <UniversalSections sections={buildCorePresetSections('contact', {}) as PageSection[]} collections={EMPTY_COLLECTIONS} />;
}
