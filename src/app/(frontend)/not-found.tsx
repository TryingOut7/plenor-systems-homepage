import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/payload/cms';
import { resolveNotFoundPageData } from '@/lib/page-content/not-found';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const notFoundData = resolveNotFoundPageData(settings);

  return {
    title: notFoundData.metaTitle,
    description: notFoundData.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const notFoundData = resolveNotFoundPageData(settings);

  return (
    <section
      aria-labelledby="not-found-heading"
      style={{
        padding: '120px 24px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        aria-hidden="true"
        style={{ fontSize: '64px', fontWeight: 700, color: '#E5E7EB', lineHeight: 1, marginBottom: '16px' }}
      >
        404
      </p>
      <h1
        id="not-found-heading"
        style={{ fontSize: '28px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
      >
        {notFoundData.heading}
      </h1>
      <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6, marginBottom: '36px', maxWidth: '400px' }}>
        {notFoundData.body}
      </p>
      <Link href={notFoundData.buttonHref} className="btn-primary">
        {notFoundData.buttonLabel}
      </Link>
    </section>
  );
}
