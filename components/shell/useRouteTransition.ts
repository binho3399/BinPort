'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { emitInteractionEvent } from '../../lib/interactions';
import type { RouteId } from '../../lib/routes';
import { getRouteId, normalizeRoutePath } from '../../lib/routes';
import { skyTransition } from '../../lib/skyTransition';
import { buildRevealTimeline, setWavePath, waveClosedPath, waveMidPath, waveOpenPath } from '../waveTransition';

const NAVIGATION_FAILSAFE_MS = 1400;

export function useRouteTransition(children: ReactNode) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const router = useRouter();
  const routeWaveRef = useRef<SVGPathElement | null>(null);
  const routeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const coverTweenRef = useRef<gsap.core.Animation | null>(null);
  const prevRoute = useRef<RouteId | null>(null);
  const prevChildren = useRef<ReactNode | null>(null);
  const pendingNavRef = useRef<string | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const isPreCoveredRef = useRef(false);
  const [displayRoute, setDisplayRoute] = useState<RouteId | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current !== null) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }, []);

  const clearPendingNavigation = useCallback(() => {
    pendingNavRef.current = null;
    coverTweenRef.current?.kill();
    coverTweenRef.current = null;
    clearFallbackTimeout();
  }, [clearFallbackTimeout]);

  const finishPendingNavigation = useCallback((target: string | null) => {
    clearPendingNavigation();
    isPreCoveredRef.current = true;
    if (target) router.push(target);
    gsap.killTweensOf(skyTransition);
    gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
  }, [clearPendingNavigation, router]);

  useLayoutEffect(() => {
    routeTimelineRef.current?.kill();
    routeTimelineRef.current = null;
    coverTweenRef.current?.kill();
    coverTweenRef.current = null;

    if (!route) return;
    const path = routeWaveRef.current;
    if (!path) return;
    const svg = path.parentElement as HTMLElement | null;
    if (!svg) return;

    if (!prevRoute.current || prevRoute.current === route) {
      clearPendingNavigation();
      prevRoute.current = route;
      prevChildren.current = children;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('idle');
      setWavePath(path, waveClosedPath);
      gsap.set(svg, { opacity: 0 });
      gsap.killTweensOf(skyTransition);
      skyTransition.ascend = 0;
      return;
    }

    prevRoute.current = route;

    if (isPreCoveredRef.current) {
      clearPendingNavigation();
      isPreCoveredRef.current = false;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('revealing');
      prevChildren.current = children;
      gsap.killTweensOf(skyTransition);
      gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
      routeTimelineRef.current = buildRevealTimeline(path, svg, () => setTransitionPhase('idle'));
      return;
    }

    setTransitionPhase('covering');
    const coverState = { ...waveClosedPath };
    setWavePath(path, coverState);
    gsap.set(svg, { opacity: 1 });
    const coverTl = gsap.timeline({
      onComplete: () => {
        clearPendingNavigation();
        setDisplayedChildren(children);
        setDisplayRoute(route);
        setTransitionPhase('revealing');
        prevChildren.current = children;
        gsap.killTweensOf(skyTransition);
        gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
        routeTimelineRef.current = buildRevealTimeline(path, svg, () => setTransitionPhase('idle'));
      },
    });
    routeTimelineRef.current = coverTl;
    coverTl
      .to(coverState, {
        ...waveMidPath,
        duration: 0.28,
        ease: 'power2.in',
        onUpdate: () => setWavePath(path, coverState),
      })
      .to(coverState, {
        ...waveOpenPath,
        duration: 0.22,
        ease: 'power2.out',
        onUpdate: () => setWavePath(path, coverState),
      });

    return () => {
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
    };
  }, [children, clearPendingNavigation, route]);

  useLayoutEffect(() => {
    return () => {
      clearPendingNavigation();
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
      gsap.killTweensOf(skyTransition);
    };
  }, [clearPendingNavigation]);

  const handleNavigate = (href: string) => {
    const currentPath = normalizeRoutePath(pathname);
    const nextPath = normalizeRoutePath(href);
    if (currentPath === nextPath) {
      return;
    }

    if (pendingNavRef.current) {
      pendingNavRef.current = href;
      return;
    }

    emitInteractionEvent(window, 'cursorReset');
    gsap.killTweensOf(skyTransition);
    gsap.to(skyTransition, { ascend: 1, duration: 0.5, ease: 'power2.in' });

    const path = routeWaveRef.current;
    if (!path) {
      router.push(href);
      return;
    }
    const svg = path.parentElement as HTMLElement | null;
    if (!svg) {
      router.push(href);
      return;
    }

    pendingNavRef.current = href;
    clearFallbackTimeout();
    fallbackTimeoutRef.current = window.setTimeout(() => {
      finishPendingNavigation(pendingNavRef.current);
    }, NAVIGATION_FAILSAFE_MS);
    const coverState = { ...waveClosedPath };
    setWavePath(path, coverState);
    gsap.set(svg, { opacity: 1 });
    const coverTl = gsap.timeline({
      onComplete: () => {
        finishPendingNavigation(pendingNavRef.current);
      },
    });
    coverTweenRef.current = coverTl;
    coverTl
      .to(coverState, {
        ...waveMidPath,
        duration: 0.28,
        ease: 'power2.in',
        onUpdate: () => setWavePath(path, coverState),
      })
      .to(coverState, {
        ...waveOpenPath,
        duration: 0.22,
        ease: 'power2.out',
        onUpdate: () => setWavePath(path, coverState),
      });
  };

  return {
    route,
    routeWaveRef,
    displayRoute,
    displayedChildren,
    transitionPhase,
    handleNavigate,
  };
}
