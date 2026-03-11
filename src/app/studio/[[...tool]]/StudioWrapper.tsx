'use client';

import dynamic from 'next/dynamic';

const Studio = dynamic(() => import('./Studio'), { ssr: false });

export default function StudioWrapper() {
  return <Studio />;
}
