import { redirect } from 'next/navigation';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

export default async function LegacyServiceItemPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  redirect(`/solutions/${encodeURIComponent(slug)}`);
}
