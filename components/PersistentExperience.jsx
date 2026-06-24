'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Cursor from './Cursor';
import WebGLScene from './WebGLScene';
import { signalEvents } from '../lib/events';
import { getRouteId, routeIds, routes } from '../lib/routes';
import { profile } from '../lib/siteContent';

function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <svg className="preloader__wave" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100V0h100v100H0Z" />
      </svg>
      <div className="preloader__inner">
        <span className="preloader__text">{profile.displayName}</span>
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

export default function PersistentExperience({ children }) {
  const pathname = usePathname();
  const route = getRouteId(pathname);
  const page = useRef(null);

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
    const ctx = gsap.context(() => {
      if (route === 'home') {
        gsap.fromTo(
          '[data-text-reveal-kicker], [data-text-reveal-heading], .home-meta > div',
          { yPercent: 55, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.055, ease: 'power3.out' },
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
      data-route={route}
      data-transitioning="false"
    >
      <WebGLScene interactive={route === routeIds.home} />
      <Preloader />
      <div className="route-current">{children}</div>
      <nav className="site-nav" aria-label="Primary">
        {routes.map(({ href, label, id }) => (
          <Link
            key={id}
            href={href}
            aria-current={route === id ? 'page' : undefined}
            data-cursor-stalker-label={label}
            onClick={handleNavigate}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Cursor />
      <PageTransition />
    </div>
  );
}
