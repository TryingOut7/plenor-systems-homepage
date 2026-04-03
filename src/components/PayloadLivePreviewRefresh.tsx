'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  serverURL?: string;
};

function toOrigin(value: string | null | undefined, base?: string): string | null {
  if (!value) return null;

  try {
    return new URL(value, base).origin;
  } catch {
    return null;
  }
}

function resolveAllowedOrigins(serverURL?: string): Set<string> {
  const origins = new Set<string>();

  const serverOrigin = toOrigin(serverURL);
  if (serverOrigin) {
    origins.add(serverOrigin);
  }

  if (typeof window === 'undefined') {
    return origins;
  }

  const currentOrigin = toOrigin(window.location.origin);
  if (currentOrigin) {
    origins.add(currentOrigin);
  }

  const referrerOrigin = toOrigin(document.referrer, currentOrigin ?? undefined);
  if (referrerOrigin) {
    origins.add(referrerOrigin);
  }

  return origins;
}

export default function PayloadLivePreviewRefresh({ serverURL }: Props) {
  const router = useRouter();
  const hasSentReadyMessage = useRef<boolean>(false);
  const allowedOrigins = useMemo(() => resolveAllowedOrigins(serverURL), [serverURL]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (!allowedOrigins.has(event.origin)) {
        return;
      }

      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      if ((event.data as { type?: unknown }).type !== 'payload-document-event') {
        return;
      }

      router.refresh();
    };

    window.addEventListener('message', onMessage);

    if (!hasSentReadyMessage.current) {
      hasSentReadyMessage.current = true;
      const windowToPostTo = window.opener || window.parent;
      const readyMessage = {
        type: 'payload-live-preview',
        ready: true,
      };

      for (const origin of allowedOrigins) {
        windowToPostTo?.postMessage(readyMessage, origin);
      }

      router.refresh();
    }

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [allowedOrigins, router]);

  return null;
}
