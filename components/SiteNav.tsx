'use client';

import { useEffect, useState } from 'react';
import { routes } from '../lib/routes';
import type { RouteId } from '../lib/routes';

type SiteNavProps = {
  currentRoute: RouteId | null;
  onNavigate: (href: string) => void;
};

export default function SiteNav({ currentRoute, onNavigate }: SiteNavProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setIsReady(true), 100);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <nav
      className={`site-nav${isReady ? ' site-nav--visible' : ' site-nav--hidden'}`}
      aria-label="Primary"
    >
      {routes.map(({ href, label, id }) => (
        <button
          key={id}
          type="button"
          aria-current={currentRoute === id ? 'page' : undefined}
          onClick={() => onNavigate(href)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
