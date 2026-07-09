'use client';

import { useEffect } from 'react';

type RouteWarmer = {
  prefetch: (href: string) => void;
};

export function useWarmRoutes({
  enabled,
  router,
}: {
  enabled: boolean;
  router: RouteWarmer;
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const warmRoutes = () => {
      router.prefetch('/projects');
      router.prefetch('/about');
      router.prefetch('/contact');
    };

    const idleCallbackId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(warmRoutes, { timeout: 2000 })
        : window.setTimeout(warmRoutes, 900);

    return () => {
      if (typeof window.cancelIdleCallback === 'function' && typeof idleCallbackId === 'number') {
        window.cancelIdleCallback(idleCallbackId);
      } else {
        window.clearTimeout(idleCallbackId);
      }
    };
  }, [enabled, router]);
}
