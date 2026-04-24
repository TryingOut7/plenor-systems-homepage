import { redirect } from 'next/navigation';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

export default async function LegacyBlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  redirect(`/insights/${encodeURIComponent(slug)}`);
}
