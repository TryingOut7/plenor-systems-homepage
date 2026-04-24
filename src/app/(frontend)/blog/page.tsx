import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function LegacyBlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawCategory = resolvedSearchParams.category;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

  redirect(category ? `/insights?category=${encodeURIComponent(category)}` : '/insights');
}
