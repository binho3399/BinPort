'use client';

import { useEffect } from 'react';

export function useWarmHomeExperience({
  enabled,
}: {
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    void import('../WebGLScene');
    void import('../webgl/SignalModel');

    const warmModel = () => {
      const fetchMode = typeof fetch === 'function' ? { cache: 'force-cache' as const } : undefined;
      void fetch('/models/model.glb', fetchMode).catch(() => {});
    };

    const idleCallbackId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(warmModel, { timeout: 2000 })
        : window.setTimeout(warmModel, 300);

    return () => {
      if (typeof window.cancelIdleCallback === 'function' && typeof idleCallbackId === 'number') {
        window.cancelIdleCallback(idleCallbackId);
      } else {
        window.clearTimeout(idleCallbackId);
      }
    };
  }, [enabled]);
}
