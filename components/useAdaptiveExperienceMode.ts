'use client';

import { useEffect, useState } from 'react';

export type ExperienceMode = 'full' | 'reduced' | 'minimal';

export type AdaptiveExperienceMode = {
  isResolved: boolean;
  mode: ExperienceMode;
  isMobileViewport: boolean;
  prefersReducedMotion: boolean;
  hasCoarsePointer: boolean;
  isWeakDevice: boolean;
  shouldReduceMotion: boolean;
  shouldMinimizeMotion: boolean;
  disableAmbientMotion: boolean;
  disableInteractiveParallax: boolean;
  disableHeavyVisualEffects: boolean;
  shouldUseLowPowerRendering: boolean;
  allowBackgroundWebGL: boolean;
  allowShowreelVideo: boolean;
  disableHeavyExperience: boolean;
};

const UNRESOLVED_ADAPTIVE_EXPERIENCE_MODE: AdaptiveExperienceMode = {
  isResolved: false,
  mode: 'full',
  isMobileViewport: false,
  prefersReducedMotion: false,
  hasCoarsePointer: false,
  isWeakDevice: false,
  shouldReduceMotion: false,
  shouldMinimizeMotion: false,
  disableAmbientMotion: false,
  disableInteractiveParallax: false,
  disableHeavyVisualEffects: false,
  shouldUseLowPowerRendering: false,
  allowBackgroundWebGL: true,
  allowShowreelVideo: true,
  disableHeavyExperience: false,
};

function deriveExperienceMode({
  isMobileViewport,
  prefersReducedMotion,
  hasCoarsePointer,
  isWeakDevice,
}: {
  isMobileViewport: boolean;
  prefersReducedMotion: boolean;
  hasCoarsePointer: boolean;
  isWeakDevice: boolean;
}): ExperienceMode {
  if (prefersReducedMotion) return 'minimal';
  if (isMobileViewport || hasCoarsePointer || isWeakDevice) return 'reduced';
  return 'full';
}

function readAdaptiveExperienceMode(): AdaptiveExperienceMode {
  if (typeof window === 'undefined') {
    return UNRESOLVED_ADAPTIVE_EXPERIENCE_MODE;
  }

  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency ?? 0;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;
  const isWeakDevice = (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);
  const mode = deriveExperienceMode({
    isMobileViewport,
    prefersReducedMotion,
    hasCoarsePointer,
    isWeakDevice,
  });
  const shouldReduceMotion = mode !== 'full';
  const shouldMinimizeMotion = mode === 'minimal';
  const disableHeavyVisualEffects = mode !== 'full';
  const shouldUseLowPowerRendering = mode !== 'full';

  return {
    isResolved: true,
    mode,
    isMobileViewport,
    prefersReducedMotion,
    hasCoarsePointer,
    isWeakDevice,
    shouldReduceMotion,
    shouldMinimizeMotion,
    disableAmbientMotion: shouldReduceMotion,
    disableInteractiveParallax: shouldReduceMotion,
    disableHeavyVisualEffects,
    shouldUseLowPowerRendering,
    allowBackgroundWebGL: mode === 'full',
    allowShowreelVideo: mode === 'full',
    disableHeavyExperience: disableHeavyVisualEffects,
  };
}

export function useAdaptiveExperienceMode() {
  const [mode, setMode] = useState<AdaptiveExperienceMode>(UNRESOLVED_ADAPTIVE_EXPERIENCE_MODE);

  useEffect(() => {
    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerMedia = window.matchMedia('(pointer: coarse)');
    const update = () => setMode(readAdaptiveExperienceMode());
    const medias = [mobileMedia, reducedMotionMedia, coarsePointerMedia];

    update();

    medias.forEach((media) => {
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', update);
      } else {
        media.addListener(update);
      }
    });

    window.addEventListener('resize', update);

    return () => {
      medias.forEach((media) => {
        if (typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', update);
        } else {
          media.removeListener(update);
        }
      });

      window.removeEventListener('resize', update);
    };
  }, []);

  return mode;
}
