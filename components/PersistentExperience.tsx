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
import CloudTransitionVeil from './CloudTransitionVeil';
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
  const [hasPreloaderCompleted, setHasPreloaderCompleted] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('is-entered'),
  );
  const [showOverlayExtras, setShowOverlayExtras] = useState(false);
  const { displayRoute, displayedChildren, transitionPhase, revealMode, handleNavigate } =
    useRouteTransition(children);

  useEffect(() => {
    if (hasEnteredExperience) return;
    if (document.documentElement.classList.contains('is-entered')) {
      const id = window.setTimeout(() => setHasEnteredExperience(true), 0);
      return () => window.clearTimeout(id);
    }
    const handleEntered = () => setHasEnteredExperience(true);
    onInteractionEvent(window, 'entered', handleEntered);
    return () => offInteractionEvent(window, 'entered', handleEntered);
  }, [hasEnteredExperience]);

  useEffect(() => {
    if (hasPreloaderCompleted) return;
    if (document.documentElement.classList.contains('is-entered')) {
      const id = window.setTimeout(() => setHasPreloaderCompleted(true), 0);
      return () => window.clearTimeout(id);
    }
    const handlePreloaderComplete = () => setHasPreloaderCompleted(true);
    onInteractionEvent(window, 'preloaderComplete', handlePreloaderComplete);
    return () => offInteractionEvent(window, 'preloaderComplete', handlePreloaderComplete);
  }, [hasPreloaderCompleted]);

  useEffect(() => {
    if (!hasEnteredExperience) return undefined;
    const id = window.setTimeout(() => setShowOverlayExtras(true), 650);
    return () => window.clearTimeout(id);
  }, [hasEnteredExperience]);

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
  }, [isHomeShellRoute]);

  useEffect(() => {
    const handleCursorReset = () => {
      document.body.style.cursor = '';
    };
    onInteractionEvent(window, 'cursorReset', handleCursorReset);
    return () => offInteractionEvent(window, 'cursorReset', handleCursorReset);
  }, []);

  usePageRevealAnimations(displayRoute, page, revealMode);

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
        {isHomeShellRoute ? (
          <WebGLScene
            route={route}
            interactive={hasPreloaderCompleted}
            revealMode={revealMode}
            transitionPhase={transitionPhase}
          />
        ) : null}
      </div>
      <Preloader />
      <CloudTransitionVeil />
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
