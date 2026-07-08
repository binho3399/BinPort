import type { RouteId } from '../../lib/routes';
import type { InteractiveSignMaterialName } from './types';

export type ModelRouteMood = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  lightMultiplier: number;
  environmentMultiplier: number;
};

const materialRoutes: Record<InteractiveSignMaterialName, string> = {
  'hiroto-profile': '/about',
  to_projects: '/projects',
  to_contact: '/contact',
};

const routeMoods = {
  home: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    lightMultiplier: 1,
    environmentMultiplier: 1,
  },
  projects: {
    position: [0.18, -0.08, -0.34],
    rotation: [0.005, -0.055, 0.012],
    scale: 0.94,
    lightMultiplier: 0.82,
    environmentMultiplier: 0.78,
  },
  about: {
    position: [-0.16, -0.04, -0.28],
    rotation: [-0.006, 0.052, -0.01],
    scale: 0.95,
    lightMultiplier: 0.88,
    environmentMultiplier: 0.82,
  },
  contact: {
    position: [0.08, -0.12, -0.42],
    rotation: [0.01, -0.025, 0.006],
    scale: 0.92,
    lightMultiplier: 0.74,
    environmentMultiplier: 0.72,
  },
} as const satisfies Record<RouteId, ModelRouteMood>;

export function getRouteForMaterial(materialName: string) {
  return materialName in materialRoutes
    ? materialRoutes[materialName as InteractiveSignMaterialName]
    : null;
}

export function getModelRouteMood(route: RouteId | null): ModelRouteMood {
  return route ? routeMoods[route] : routeMoods.home;
}
