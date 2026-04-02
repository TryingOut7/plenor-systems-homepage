'use client';

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';

type Props = {
  serverURL?: string;
};

export default function PayloadLivePreviewRefresh({ serverURL }: Props) {
  const router = useRouter();
  const resolvedServerURL = serverURL || (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <PayloadRefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={resolvedServerURL}
    />
  );
}
