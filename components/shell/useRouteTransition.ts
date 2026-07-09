'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { emitInteractionEvent } from '../../lib/interactions';
import type { RouteId } from '../../lib/routes';
import { getRouteId, normalizeRoutePath } from '../../lib/routes';

export type TransitionPhase = 'idle' | 'covering' | 'revealing';
export type RevealMode = 'initial' | 'route';

const NAVIGATION_FAILSAFE_MS = 1500;

export type RouteTransitionRefs = {
  routeCurrentRef: RefObject<HTMLDivElement | null>;
  atmosphereCanvasRef: RefObject<HTMLCanvasElement | null>;
  modelWrapperRef: RefObject<HTMLDivElement | null>;
  cloudVeilRef: RefObject<HTMLDivElement | null>;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useRouteTransition(children: ReactNode, refs: RouteTransitionRefs) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const router = useRouter();
  const routeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const prevRoute = useRef<RouteId | null>(null);
  const pendingNavRef = useRef<string | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const phaseRef = useRef<TransitionPhase>('idle');
  const [displayRoute, setDisplayRoute] = useState<RouteId | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [transitionPhase, setTransitionPhaseState] = useState<TransitionPhase>('idle');
  const [revealMode, setRevealMode] = useState<RevealMode>('initial');

  const setTransitionPhase = useCallback((phase: TransitionPhase) => {
    phaseRef.current = phase;
    setTransitionPhaseState(phase);
  }, []);

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current !== null) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, []);

  const clearPendingNavigation = useCallback(() => {
    pendingNavRef.current = null;
    clearFallbackTimeout();
  }, [clearFallbackTimeout]);

  const { routeCurrentRef, atmosphereCanvasRef, modelWrapperRef, cloudVeilRef } = refs;

  const shellTargets = useCallback(() => {
    const routeCurrent = routeCurrentRef.current;
    const atmosphere = atmosphereCanvasRef.current;
    const model = modelWrapperRef.current;
    const veil = cloudVeilRef.current;
    const depthTargets = [atmosphere].filter(Boolean);
    return { routeCurrent, atmosphere, model, depthTargets, veil };
  }, [atmosphereCanvasRef, cloudVeilRef, modelWrapperRef, routeCurrentRef]);

  const resetShellTargets = useCallback(() => {
    const { routeCurrent, depthTargets, model, veil } = shellTargets();
    gsap.set([routeCurrent, ...depthTargets, model].filter(Boolean), { clearProps: 'transform,opacity,filter' });
    gsap.set(veil, { autoAlpha: 0, scale: 1.18, clearProps: 'filter' });
  }, [shellTargets]);

  const finishPendingNavigation = useCallback(
    (target: string | null) => {
      clearPendingNavigation();
      if (target) router.push(target);
    },
    [clearPendingNavigation, router],
  );

  const buildRevealTimeline = useCallback(
    (onComplete?: () => void) => {
      const reduced = prefersReducedMotion();
      const { routeCurrent, atmosphere, veil } = shellTargets();
      routeTimelineRef.current?.kill();

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          resetShellTargets();
          setTransitionPhase('idle');
          onComplete?.();
        },
      });
      routeTimelineRef.current = tl;

      if (reduced) {
        tl.set(routeCurrent, { autoAlpha: 0, scale: 1, y: 0, clearProps: 'filter' })
          .to(routeCurrent, { autoAlpha: 1, duration: 0.18, ease: 'power1.out' }, 0)
          .to(veil, { autoAlpha: 0, duration: 0.18, ease: 'power1.out' }, 0);
        return tl;
      }

      tl.set(routeCurrent, { autoAlpha: 0, scale: 1.5, y: 26, filter: 'blur(10px)', transformOrigin: '50% 42%' })
        .set(atmosphere, { scale: 0.96, autoAlpha: 0.72, transformOrigin: '50% 50%' })
        .to(routeCurrent, { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.72, ease: 'power3.out' }, 0.06)
        .to(atmosphere, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 0)
        .to(veil, { autoAlpha: 0, scale: 1, filter: 'blur(16px)', duration: 0.82, ease: 'power2.out' }, 0.08);
      return tl;
    },
    [resetShellTargets, setTransitionPhase, shellTargets],
  );

  useLayoutEffect(() => {
    if (!route) return;

    if (!prevRoute.current || prevRoute.current === route) {
      if (phaseRef.current !== 'idle' || pendingNavRef.current) return;
      clearPendingNavigation();
      prevRoute.current = route;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setRevealMode('initial');
      setTransitionPhase('idle');
      resetShellTargets();
      return;
    }

    prevRoute.current = route;
    setDisplayedChildren(children);
    setDisplayRoute(route);
    setRevealMode('route');
    setTransitionPhase('revealing');
    clearPendingNavigation();
    buildRevealTimeline();

    return () => {
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
    };
  }, [buildRevealTimeline, children, clearPendingNavigation, resetShellTargets, route, setTransitionPhase]);

  useEffect(() => {
    return () => {
      clearPendingNavigation();
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
    };
  }, [clearPendingNavigation]);

  const handleNavigate = (href: string) => {
    const currentPath = normalizeRoutePath(pathname);
    const nextPath = normalizeRoutePath(href);
    if (currentPath === nextPath || phaseRef.current !== 'idle' || pendingNavRef.current) {
      return;
    }

    emitInteractionEvent(window, 'cursorReset');
    pendingNavRef.current = href;
    setTransitionPhase('covering');
    clearFallbackTimeout();
    fallbackTimeoutRef.current = window.setTimeout(() => {
      finishPendingNavigation(pendingNavRef.current);
    }, NAVIGATION_FAILSAFE_MS);

    const reduced = prefersReducedMotion();
    const { routeCurrent, atmosphere, model, veil } = shellTargets();
    routeTimelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => finishPendingNavigation(pendingNavRef.current),
    });
    routeTimelineRef.current = tl;

    if (reduced) {
      tl.set(veil, { autoAlpha: 0, scale: 1, clearProps: 'filter' })
        .to(routeCurrent, { autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, 0)
        .to(veil, { autoAlpha: 0.42, duration: 0.16, ease: 'power1.out' }, 0);
      return;
    }

    tl.set(veil, { autoAlpha: 0, scale: 1.5, filter: 'blur(18px)', transformOrigin: '50% 50%' })
      .to(routeCurrent, { autoAlpha: 0, scale: 0.86, y: 34, filter: 'blur(4px)', duration: 0.52, ease: 'power3.in' }, 0)
      .to(atmosphere, { autoAlpha: 0.42, scale: 0.9, filter: 'blur(3px)', duration: 0.58, ease: 'power3.in' }, 0)
      .to(veil, { autoAlpha: 1, scale: 1.08, filter: 'blur(7px)', duration: 0.62, ease: 'power2.out' }, 0.04);
    if (model) {
      tl.to(model, { autoAlpha: 0.42, filter: 'blur(3px)', duration: 0.58, ease: 'power3.in' }, 0);
    }
  };

  return {
    route,
    displayRoute,
    displayedChildren,
    transitionPhase,
    revealMode,
    handleNavigate,
  };
}
