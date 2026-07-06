'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { emitInteractionEvent } from '../../lib/interactions';
import type { RouteId } from '../../lib/routes';
import { getRouteId } from '../../lib/routes';
import { skyTransition } from '../../lib/skyTransition';

export function useRouteTransition(children: ReactNode) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const router = useRouter();
  const routeWaveRef = useRef<SVGPathElement | null>(null);
  const routeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const coverTweenRef = useRef<gsap.core.Tween | null>(null);
  const prevRoute = useRef<RouteId | null>(null);
  const prevChildren = useRef<ReactNode | null>(null);
  const pendingNavRef = useRef<string | null>(null);
  const isPreCoveredRef = useRef(false);
  const [displayRoute, setDisplayRoute] = useState<RouteId | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');

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
      prevRoute.current = route;
      prevChildren.current = children;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('idle');
      gsap.killTweensOf(skyTransition);
      skyTransition.ascend = 0;
      return;
    }

    prevRoute.current = route;

    if (isPreCoveredRef.current) {
      isPreCoveredRef.current = false;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('revealing');
      prevChildren.current = children;
      gsap.killTweensOf(skyTransition);
      gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
      // fade veil out — no wave shape morphing
      gsap.to(svg, { opacity: 0, duration: 1.0, delay: 0.1, ease: 'power2.out', onComplete: () => setTransitionPhase('idle') });
      return;
    }

    setTransitionPhase('covering');
    // set wave path to full cover (static, no animation)
    path.setAttribute('d', 'M 0 0 H 100 V 100 H 0 Z');
    gsap.set(svg, { opacity: 1 });
    const coverTl = gsap.timeline({
      onComplete: () => {
        setDisplayedChildren(children);
        setDisplayRoute(route);
        setTransitionPhase('revealing');
        prevChildren.current = children;
        gsap.killTweensOf(skyTransition);
        gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
        gsap.to(svg, { opacity: 0, duration: 1.0, delay: 0.1, ease: 'power2.out', onComplete: () => setTransitionPhase('idle') });
      },
    });
    routeTimelineRef.current = coverTl;
    // small pause so sky ascend is visible before DOM swap
    coverTl.to({}, { duration: 0.45 });

    return () => {
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
    };
  }, [route, children]);

  const handleNavigate = (href: string) => {
    if (pendingNavRef.current) return;

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
    // snap veil on — sky ascend is the visual; veil just ensures DOM swap is hidden
    path.setAttribute('d', 'M 0 0 H 100 V 100 H 0 Z');
    gsap.set(svg, { opacity: 1 });
    // wait for ascend to peak, then push route
    coverTweenRef.current = gsap.delayedCall(0.45, () => {
      coverTweenRef.current = null;
      isPreCoveredRef.current = true;
      const target = pendingNavRef.current;
      pendingNavRef.current = null;
      if (target) router.push(target);
      gsap.killTweensOf(skyTransition);
      gsap.to(skyTransition, { ascend: 0, duration: 1.2, ease: 'power3.out' });
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
