'use client';

import { routes } from '../lib/routes';
import type { RouteId } from '../lib/routes';

type SiteNavProps = {
  currentRoute: RouteId | null;
  onNavigate: (href: string) => void;
};

export default function SiteNav({ currentRoute, onNavigate }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label="Primary">
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
