export const routeIds = {
  home: 'home',
  projects: 'projects',
  about: 'about',
  contact: 'contact',
};

export const routes = [
  { href: '/', label: 'Home', id: routeIds.home },
  { href: '/projects', label: 'Projects', id: routeIds.projects },
  { href: '/about', label: 'About', id: routeIds.about },
  { href: '/contact', label: 'Contact', id: routeIds.contact },
];

export function getRouteId(pathname) {
  return routes.find((route) => route.href === pathname)?.id ?? routeIds.home;
}
