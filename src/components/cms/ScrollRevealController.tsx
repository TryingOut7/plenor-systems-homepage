'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-scroll-reveal="fade-up"]';

function setRevealState(element: HTMLElement, state: 'idle' | 'waiting' | 'entered') {
  element.setAttribute('data-scroll-reveal-state', state);
}

function isInInitialViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 0 && rect.top < viewportHeight * 0.92;
}

export default function ScrollRevealController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isScheduled = false;
    let observer: IntersectionObserver | null = null;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            setRevealState(element, 'entered');
            observer?.unobserve(element);
          });
        },
        {
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.15,
        },
      );
    }

    const syncRevealTargets = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
      if (elements.length === 0) return;

      if (!observer) {
        elements.forEach((element) => setRevealState(element, 'entered'));
        return;
      }

      elements.forEach((element) => {
        if (element.dataset.scrollRevealState === 'entered') {
          observer.unobserve(element);
          return;
        }

        if (isInInitialViewport(element)) {
          setRevealState(element, 'entered');
          observer.unobserve(element);
          return;
        }

        setRevealState(element, 'waiting');
        observer.observe(element);
      });
    };

    const scheduleSync = () => {
      if (isScheduled) return;
      isScheduled = true;
      window.requestAnimationFrame(() => {
        isScheduled = false;
        syncRevealTargets();
      });
    };

    syncRevealTargets();

    const mutationObserver = new MutationObserver(() => {
      scheduleSync();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, []);

  return null;
}
