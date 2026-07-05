'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import Cursor from './Cursor';
import SkyBackground from './SkyBackground';
import Preloader from './Preloader';
import FilmGrain from './FilmGrain';
import SiteNav from './SiteNav';
import { getRouteId, isContactRoute, isHomeRoute, shouldShowShellBackButton } from '../lib/routes';
import { NavigationContext } from '../lib/navigationContext';
import { offInteractionEvent, onInteractionEvent } from '../lib/interactions';
import { useRouteTransition } from './shell/useRouteTransition';
import { usePageRevealAnimations } from './shell/usePageRevealAnimations';

const WebGLScene = dynamic(() => import('./WebGLScene'), {
  ssr: false,
  loading: () => null,
});

export default function PersistentExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const route = getRouteId(pathname);
  const isHomeShellRoute = isHomeRoute(route);
  const isContactShellRoute = isContactRoute(route);
  const page = useRef<HTMLDivElement | null>(null);
  const [hasEnteredExperience, setHasEnteredExperience] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('is-entered'),
  );
  const [showOverlayExtras, setShowOverlayExtras] = useState(false);
  const { routeWaveRef, displayRoute, displayedChildren, transitionPhase, handleNavigate } =
    useRouteTransition(children);

  useEffect(() => {
    if (hasEnteredExperience) return;
    const handleEntered = () => setHasEnteredExperience(true);
    onInteractionEvent(window, 'entered', handleEntered);
    return () => offInteractionEvent(window, 'entered', handleEntered);
  }, [hasEnteredExperience, router]);

  useEffect(() => {
    if (!hasEnteredExperience) return undefined;
    const id = window.setTimeout(() => setShowOverlayExtras(true), 650);
    return () => window.clearTimeout(id);
  }, [hasEnteredExperience, router]);

  useEffect(() => {
    if (!hasEnteredExperience) return undefined;

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
  }, [hasEnteredExperience, router]);

  useEffect(() => {
    if (!isHomeShellRoute) return;
    void import('./WebGLScene');
    void import('./webgl/SignalModel');
  }, [isHomeShellRoute]);

  useEffect(() => {
    const handleCursorReset = () => {
      document.body.style.cursor = '';
    };
    onInteractionEvent(window, 'cursorReset', handleCursorReset);
    return () => offInteractionEvent(window, 'cursorReset', handleCursorReset);
  }, []);

  usePageRevealAnimations(displayRoute, page);

  return (
    <NavigationContext.Provider value={handleNavigate}>
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
        {isHomeShellRoute ? <WebGLScene interactive={hasEnteredExperience} /> : null}
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
      {shouldShowShellBackButton(route) ? (
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
      {isHomeShellRoute ? (
        <div className="home-rotate-hint" aria-hidden="true">
          <span>Scroll to rotate\nmodel 3D</span>
        </div>
      ) : null}
      {isContactShellRoute ? null : (
        <>
          {showOverlayExtras ? <FilmGrain /> : null}
          {showOverlayExtras ? <Cursor /> : null}
        </>
      )}
    </div>
    </NavigationContext.Provider>
  );
}
