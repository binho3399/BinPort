'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import Cursor from './Cursor';
import WebGLScene from './WebGLScene';
import { signalEvents } from '../lib/events';
import { getRouteId, routeIds, routes } from '../lib/routes';

gsap.registerPlugin(ScrambleTextPlugin);

const loadingMessages = ['Loading...', 'Almost there...', 'Just a moment...'];
const scrambleChars = 'upperAndLowerCase0123456789<>!?_#*+';
const preloaderOpenPath = { bottomY: 100, closeY: 0, controlY: 100 };
const preloaderMidPath = { bottomY: 50, closeY: 0, controlY: 100 };
const preloaderClosedPath = { bottomY: 0, closeY: 0, controlY: 0 };

let hasEnteredExperience = false;

type PreloaderPath = typeof preloaderOpenPath;

function setPreloaderPath(path: SVGPathElement | null, values: PreloaderPath) {
  if (!path) return;
  path.setAttribute(
    'd',
    `M 0 0 V ${values.bottomY} Q 50 ${values.controlY} 100 ${values.bottomY} V ${values.closeY} z`,
  );
}

function Preloader() {
  const preloader = useRef<HTMLDivElement | null>(null);
  const text = useRef<HTMLSpanElement | null>(null);
  const wave = useRef<SVGPathElement | null>(null);
  const loadingLoop = useRef<gsap.core.Timeline | null>(null);
  const exitTimeline = useRef<gsap.core.Timeline | null>(null);
  const exitDelay = useRef<gsap.core.Tween | null>(null);
  const hardExitDelay = useRef<gsap.core.Tween | null>(null);
  const hasStartedExit = useRef(false);
  const skipPreloader = hasEnteredExperience;

  const finish = useCallback(() => {
    const root = preloader.current;
    loadingLoop.current?.kill();
    exitTimeline.current?.kill();
    exitDelay.current?.kill();
    hardExitDelay.current?.kill();
    loadingLoop.current = null;
    exitTimeline.current = null;
    exitDelay.current = null;
    hardExitDelay.current = null;
    setPreloaderPath(wave.current, preloaderClosedPath);
    if (root) gsap.set(root, { autoAlpha: 0, display: 'none' });
    hasEnteredExperience = true;
    document.documentElement.classList.add('is-page-ready', 'is-page-surface-ready', 'is-entered');
    window.dispatchEvent(new CustomEvent('signal-pole:entered'));
  }, []);

  const startExit = useCallback(() => {
    if (hasStartedExit.current) return;
    const root = preloader.current;
    const label = text.current;
    const wavePath = wave.current;
    if (!root || !label || !wavePath) {
      finish();
      return;
    }

    hasStartedExit.current = true;
    loadingLoop.current?.kill();
    loadingLoop.current = null;
    hardExitDelay.current = gsap.delayedCall(6.2, finish);

    const textTimeline = gsap.timeline();
    textTimeline
      .set(label, { autoAlpha: 1, opacity: 1, y: 0 })
      .to(label, {
        duration: 0.8,
        ease: 'power2.out',
        scrambleText: {
          chars: scrambleChars,
          revealDelay: 0.07,
          speed: 1.2,
          text: 'Thanks for waiting - all set.',
        },
      })
      .to({}, { duration: 0.38 })
      .to(label, {
        duration: 0.6,
        ease: 'power2.in',
        opacity: 0,
        scrambleText: { chars: scrambleChars, revealDelay: 0, speed: 0.82, text: '' },
      })
      .to(label, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' });

    exitDelay.current = gsap.delayedCall(1.15, () => {
      document.documentElement.classList.add('is-page-surface-ready');
      const pathState = { ...preloaderOpenPath };
      exitTimeline.current = gsap
        .timeline({ onComplete: finish })
        .to(pathState, {
          ...preloaderMidPath,
          duration: 1.3,
          ease: 'power3.inOut',
          onUpdate: () => setPreloaderPath(wavePath, pathState),
        })
        .to(
          pathState,
          {
            ...preloaderClosedPath,
            duration: 1.3,
            ease: 'power3.out',
            onUpdate: () => setPreloaderPath(wavePath, pathState),
          },
          '-=0.65',
        );
    });
  }, [finish]);

  useLayoutEffect(() => {
    if (skipPreloader) {
      finish();
      return;
    }

    const root = preloader.current;
    const label = text.current;
    if (!root || !label) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1, display: 'grid' });
      gsap.set(label, { autoAlpha: 1, opacity: 0, textContent: '', y: 6 });
      setPreloaderPath(wave.current, preloaderOpenPath);

      const loop = gsap.timeline({ repeat: -1 });
      loadingMessages.forEach((message) => {
        loop
          .to(label, {
            duration: 0.66,
            ease: 'power2.out',
            opacity: 1,
            y: 0,
            scrambleText: {
              chars: scrambleChars,
              revealDelay: 0.04,
              speed: 1.05,
              text: message,
            },
          })
          .to({}, { duration: 0.36 })
          .to(label, {
            duration: 0.54,
            ease: 'power2.in',
            opacity: 0.68,
            scrambleText: { chars: scrambleChars, revealDelay: 0, speed: 0.9, text: '' },
          })
          .set(label, { y: 0 });
      });
      loadingLoop.current = loop;
    }, root);

    exitDelay.current = gsap.delayedCall(3.5, startExit);

    return () => {
      loadingLoop.current?.kill();
      exitTimeline.current?.kill();
      exitDelay.current?.kill();
      hardExitDelay.current?.kill();
      gsap.killTweensOf(label);
      loadingLoop.current = null;
      exitTimeline.current = null;
      exitDelay.current = null;
      hardExitDelay.current = null;
      ctx.revert();
    };
  }, [finish, skipPreloader, startExit]);

  if (skipPreloader) return null;

  return (
    <div ref={preloader} className="preloader" aria-atomic="true" aria-live="polite">
      <svg className="preloader__wave" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice">
        <path ref={wave} fill="#050505" />
      </svg>
      <div className="preloader__inner">
        <span ref={text} className="preloader__text">
          Loading...
        </span>
      </div>
    </div>
  );
}

function PageTransition() {
  return (
    <div className="page-transition" aria-hidden="true">
      <svg className="page-transition__clip-defs">
        <defs>
          <clipPath id="page-transition-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V1 H0 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="page-transition__background-snapshot" />
      <div className="page-transition__next">
        <div className="page-transition__next-content" />
      </div>
    </div>
  );
}

function FilmGrain() {
  const grainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!grainRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.to({}, {
        duration: 0.083,
        repeat: -1,
        onRepeat: () => {
          if (grainRef.current) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            grainRef.current.style.backgroundPosition = `${x}px ${y}px`;
          }
        },
      });
    }, grainRef.current);

    return () => ctx.revert();
  }, []);

  return <div ref={grainRef} className="film-grain" aria-hidden="true" />;
}

export default function PersistentExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const isHomeRoute = route === routeIds.home;
  const page = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleCursorReset = () => {
      document.body.style.cursor = '';
    };
    window.addEventListener(signalEvents.cursorReset, handleCursorReset);
    return () => window.removeEventListener(signalEvents.cursorReset, handleCursorReset);
  }, []);

  const handleNavigate = () => {
    window.dispatchEvent(new CustomEvent(signalEvents.cursorReset));
  };

  useEffect(() => {
    if (!route) return undefined;

    const ctx = gsap.context(() => {
      if (route === 'home') {
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

      if (route === 'projects') {
        gsap.fromTo(
          '.project-card',
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, delay: 0.08, duration: 0.75, stagger: 0.045, ease: 'power3.out' },
        );
      }
    }, page);
    return () => ctx.revert();
  }, [route]);

  return (
    <div
      ref={page}
      className="persistent-experience is-page-ready is-entered is-page-surface-ready"
      data-route={route ?? 'unknown'}
      data-transitioning="false"
    >
      <WebGLScene interactive={isHomeRoute} />
      <Preloader />
      <div className="route-current">{children}</div>
      <nav className="site-nav" aria-label="Primary">
        {routes.map(({ href, label, id }) => (
          <Link
            key={id}
            href={href}
            aria-current={route === id ? 'page' : undefined}
            onClick={handleNavigate}
          >
            {label}
          </Link>
        ))}
      </nav>
      {isHomeRoute ? (
        <div className="home-rotate-hint" aria-hidden="true">
          <span>Scroll to rotate model 3D</span>
        </div>
      ) : null}
      <FilmGrain />
      <Cursor />
      <PageTransition />
    </div>
  );
}
