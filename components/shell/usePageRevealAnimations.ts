'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import type { RouteId } from '../../lib/routes';

export function usePageRevealAnimations(
  displayRoute: RouteId | null,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!displayRoute) return undefined;

    const ctx = gsap.context(() => {
      if (displayRoute === 'home') {
        gsap.fromTo(
          '[data-text-reveal-kicker], [data-text-reveal-heading], .home-meta > div',
          { yPercent: 55, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.055, ease: 'power3.out' },
        );
        gsap.fromTo(
          '.home-rotate-hint',
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay: 0.28, duration: 0.64, ease: 'power3.out' },
        );
      } else {
        gsap.fromTo(
          '.reveal',
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.06, ease: 'power3.out' },
        );
      }

      if (displayRoute === 'projects') {
        gsap.fromTo(
          '.projects-marquee__card',
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay: 0.08, duration: 0.75, stagger: 0.045, ease: 'power3.out' },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [displayRoute, containerRef]);
}
