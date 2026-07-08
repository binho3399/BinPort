'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import type { RouteId } from '../../lib/routes';

export function usePageRevealAnimations(
  displayRoute: RouteId | null,
  containerRef: RefObject<HTMLDivElement | null>,
  revealMode: 'initial' | 'route' = 'initial',
) {
  useEffect(() => {
    if (!displayRoute) return undefined;

    const isRouteReveal = revealMode === 'route';
    const yPercent = isRouteReveal ? 18 : 55;
    const y = isRouteReveal ? 10 : 22;
    const cardY = isRouteReveal ? 18 : 42;
    const duration = isRouteReveal ? 0.48 : 0.72;
    const delay = isRouteReveal ? 0.18 : 0.08;

    const ctx = gsap.context(() => {
      if (displayRoute === 'home') {
        gsap.fromTo(
          '[data-text-reveal-kicker], [data-text-reveal-heading], .home-meta > div',
          { yPercent, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: isRouteReveal ? 0.5 : 0.8, stagger: 0.04, ease: 'power3.out' },
        );
        gsap.fromTo(
          '.home-rotate-hint',
          { y: isRouteReveal ? 4 : 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay: isRouteReveal ? 0.18 : 0.28, duration: 0.5, ease: 'power3.out' },
        );
      } else {
        gsap.fromTo(
          '.reveal',
          { y, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration, stagger: isRouteReveal ? 0.035 : 0.06, ease: 'power3.out' },
        );
      }

      if (displayRoute === 'projects') {
        gsap.fromTo(
          '.projects-marquee__card',
          { y: cardY, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay, duration: isRouteReveal ? 0.52 : 0.75, stagger: 0.035, ease: 'power3.out' },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [displayRoute, containerRef, revealMode]);
}
