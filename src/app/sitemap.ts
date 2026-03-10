import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://plenorsystems.com';
  const lastModified = new Date('2026-03-01');

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
