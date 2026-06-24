export const routeIds = {
  home: 'home',
  projects: 'projects',
  about: 'about',
  contact: 'contact',
} as const;

export type RouteId = (typeof routeIds)[keyof typeof routeIds];

export const routes = [
  { href: '/', label: 'Home', id: routeIds.home },
  { href: '/projects', label: 'Projects', id: routeIds.projects },
  { href: '/about', label: 'About', id: routeIds.about },
  { href: '/contact', label: 'Contact', id: routeIds.contact },
];

export function getRouteId(pathname: string): RouteId {
  return routes.find((route) => route.href === pathname)?.id ?? routeIds.home;
}
