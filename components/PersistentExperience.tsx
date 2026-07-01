'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import Cursor from './Cursor';
import SkyBackground from './SkyBackground';
import Preloader from './Preloader';
import FilmGrain from './FilmGrain';
import SiteNav from './SiteNav';
import { buildRevealTimeline, setWavePath, waveClosedPath } from './waveTransition';
import { signalEvents } from '../lib/events';
import type { RouteId } from '../lib/routes';
import { getRouteId, routeIds } from '../lib/routes';

const WebGLScene = dynamic(() => import('./WebGLScene'), {
  ssr: false,
  loading: () => null,
});

export default function PersistentExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const isHomeRoute = route === routeIds.home;
  const isContactRoute = route === routeIds.contact;
  const page = useRef<HTMLDivElement | null>(null);
  const routeWaveRef = useRef<SVGPathElement | null>(null);
  const routeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const coverTweenRef = useRef<gsap.core.Tween | null>(null);
  const prevRoute = useRef<RouteId | null>(null);
  const prevChildren = useRef<ReactNode | null>(null);
  const pendingNavRef = useRef<string | null>(null);
  const isPreCoveredRef = useRef(false);
  const router = useRouter();
  const [displayRoute, setDisplayRoute] = useState<RouteId | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');

  useEffect(() => {
    const handleCursorReset = () => {
      document.body.style.cursor = '';
    };
    window.addEventListener(signalEvents.cursorReset, handleCursorReset);
    return () => window.removeEventListener(signalEvents.cursorReset, handleCursorReset);
  }, []);

  // Route transition wave
  useLayoutEffect(() => {
    // Kill any ongoing route transition or pre-cover
    routeTimelineRef.current?.kill();
    routeTimelineRef.current = null;
    coverTweenRef.current?.kill();
    coverTweenRef.current = null;

    if (!route) return;

    const path = routeWaveRef.current;
    if (!path) return;
    const svg = path.parentElement as HTMLElement | null;
    if (!svg) return;

    // First route or same route — no transition needed
    if (!prevRoute.current || prevRoute.current === route) {
      prevRoute.current = route;
      prevChildren.current = children;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('idle');
      return;
    }

    prevRoute.current = route;

    if (isPreCoveredRef.current) {
      // Pre-covered by click handler: just reveal new page
      isPreCoveredRef.current = false;
      setDisplayedChildren(children);
      setDisplayRoute(route);
      setTransitionPhase('revealing');
      prevChildren.current = children;

      routeTimelineRef.current = buildRevealTimeline(path, svg, () => setTransitionPhase('idle'));
      return;
    }

    // No pre-cover: full transition (browser back/forward)
    setTransitionPhase('covering');
    // displayedChildren and displayRoute stay at OLD values during covering

    const state = { ...waveClosedPath };
    setWavePath(path, state);

    const coverTl = gsap.timeline({
      onComplete: () => {
        setDisplayedChildren(children);
        setDisplayRoute(route);
        setTransitionPhase('revealing');
        prevChildren.current = children;

        routeTimelineRef.current = buildRevealTimeline(path, svg, () => setTransitionPhase('idle'));
      },
    });
    routeTimelineRef.current = coverTl;
    coverTl.set(svg, { opacity: 1 }).to(state, {
      bottomY: 100,
      controlY: 100,
      duration: 0.35,
      ease: 'power2.in',
      onUpdate: () => setWavePath(path, state),
    });

    return () => {
      routeTimelineRef.current?.kill();
      routeTimelineRef.current = null;
    };
  }, [route, children]);

  const handleNavigate = (href: string) => {
    // Prevent double-clicks during transition
    if (pendingNavRef.current) return;

    window.dispatchEvent(new CustomEvent(signalEvents.cursorReset));

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

    // Cover wave on current (old) page first
    const state = { ...waveClosedPath };
    setWavePath(path, state);

    gsap.set(svg, { opacity: 1 });
    coverTweenRef.current = gsap.to(state, {
      bottomY: 100,
      controlY: 100,
      duration: 0.35,
      ease: 'power2.in',
      onUpdate: () => setWavePath(path, state),
      onComplete: () => {
        coverTweenRef.current = null;
        isPreCoveredRef.current = true;
        const target = pendingNavRef.current;
        pendingNavRef.current = null;
        if (target) router.push(target);
      },
    });
  };

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
          '.project-card',
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay: 0.08, duration: 0.75, stagger: 0.045, ease: 'power3.out' },
        );
      }
    }, page);
    return () => ctx.revert();
  }, [displayRoute]);

  return (
    <div
      ref={page}
      className="persistent-experience"
      data-route={route ?? 'unknown'}
      data-transitioning={transitionPhase !== 'idle'}
    >
      <div className="webgl-background" aria-hidden="true">
        <div className="sky-layer">
          <SkyBackground />
        </div>
        {isHomeRoute ? <WebGLScene interactive /> : null}
      </div>
      <Preloader />
      <svg
        className="route-wave"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <path ref={routeWaveRef} fill="#050505" />
      </svg>
      {route && route !== routeIds.home && route !== routeIds.about ? (
        <button
          type="button"
          className="back-circle-control back-circle-control--shell"
          aria-label="Back to home"
          onClick={() => handleNavigate('/')}
        >
          <svg viewBox="0 0 24 24" width={20} height={20}>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" strokeWidth={2.4} />
          </svg>
        </button>
      ) : null}
      <div className="route-current">
        {transitionPhase === 'covering' ? displayedChildren : children}
      </div>
      <SiteNav currentRoute={route} onNavigate={handleNavigate} />
      {isHomeRoute ? (
        <div className="home-rotate-hint" aria-hidden="true">
          <span>Scroll to rotate model 3D</span>
        </div>
      ) : null}
      {isContactRoute ? null : (
        <>
          <FilmGrain />
          <Cursor />
        </>
      )}
    </div>
  );
}
