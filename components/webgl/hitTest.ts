import type * as THREE from 'three';
import type { InteractiveSignMaterialName, InteractiveSignSurface } from './types';

type SignMaterialName = InteractiveSignMaterialName;

const SIGN_FACE_DIRECTION = {
  'hiroto-profile': 'front',
  to_projects: 'front',
  to_contact: 'front',
} as const satisfies Record<InteractiveSignMaterialName, 'front' | 'back'>;

const OCCLUSION_EPSILON = 0.003;
const FACE_SIDE_DOT_THRESHOLD = 0.08;
const SIGN_FACE_SIDE_DOT_THRESHOLDS: Record<SignMaterialName, number> = {
  'hiroto-profile': FACE_SIDE_DOT_THRESHOLD,
  to_projects: FACE_SIDE_DOT_THRESHOLD,
  to_contact: 0.18,
};
export const SIGN_MATERIAL_NAMES: readonly SignMaterialName[] = [
  'hiroto-profile',
  'to_projects',
  'to_contact',
];
const SIGN_HIT_BOUNDS: Record<
  SignMaterialName,
  { minU: number; maxU: number; minV: number; maxV: number }
> = {
  'hiroto-profile': { minU: 0.08, maxU: 0.92, minV: 0.08, maxV: 0.92 },
  to_projects: { minU: 0.12, maxU: 0.87, minV: 0.2, maxV: 0.8 },
  to_contact: { minU: 0.12, maxU: 0.88, minV: 0.16, maxV: 0.84 },
};

export type InteractiveCanvasHit = {
  intersection: THREE.Intersection<THREE.Object3D>;
  materialName: SignMaterialName;
  surface: InteractiveSignSurface;
};

type MeshLike = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;

function isMeshLike(object: THREE.Object3D | null | undefined): object is MeshLike {
  return !!object && (object as THREE.Mesh).isMesh === true;
}

function getIntersectionMaterial(
  intersection: THREE.Intersection<THREE.Object3D>,
): THREE.Material | null {
  const { object } = intersection;
  if (!isMeshLike(object)) return null;
  const mesh = object;

  if (!Array.isArray(mesh.material)) return mesh.material;

  const faceMaterialIndex = intersection.face?.materialIndex;
  if (typeof faceMaterialIndex === 'number') {
    return mesh.material[faceMaterialIndex] ?? null;
  }

  if (typeof intersection.faceIndex !== 'number') return null;

  const triangleOffset = intersection.faceIndex * 3;
  const hitGroup = mesh.geometry.groups.find(
    (group) => triangleOffset >= group.start && triangleOffset < group.start + group.count,
  );

  return typeof hitGroup?.materialIndex === 'number'
    ? (mesh.material[hitGroup.materialIndex] ?? null)
    : null;
}

function getIntersectionMaterialName(
  intersection: THREE.Intersection<THREE.Object3D>,
  materialNames: readonly SignMaterialName[],
): SignMaterialName | null {
  const material = getIntersectionMaterial(intersection);
  if (!material) return null;

  return materialNames.find((materialName) => material.name === materialName) ?? null;
}

function isWithinInteractiveUv(
  intersection: THREE.Intersection<THREE.Object3D>,
  materialName: SignMaterialName,
) {
  const uv = intersection.uv;
  if (!uv) return false;

  const { minU, maxU, minV, maxV } = SIGN_HIT_BOUNDS[materialName];
  return uv.x >= minU && uv.x <= maxU && uv.y >= minV && uv.y <= maxV;
}

function isIntendedCanvasSideIntersection(
  intersection: THREE.Intersection<THREE.Object3D>,
  rayDirection: THREE.Vector3,
  materialName: keyof typeof SIGN_FACE_DIRECTION,
) {
  if (!intersection.face) return false;

  const worldNormal = intersection.face.normal
    .clone()
    .transformDirection(intersection.object.matrixWorld)
    .normalize();
  const dot = worldNormal.dot(rayDirection);
  const direction = SIGN_FACE_DIRECTION[materialName];
  const threshold = SIGN_FACE_SIDE_DOT_THRESHOLDS[materialName];
  return direction === 'front' ? dot < -threshold : dot > threshold;
}

function isObjectWithinRoot(object: THREE.Object3D, root: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current === root) return true;
    current = current.parent;
  }
  return false;
}

function getSurfaceForIntersection(
  intersection: THREE.Intersection<THREE.Object3D>,
  materialName: SignMaterialName,
  surfaces: readonly InteractiveSignSurface[],
) {
  return (
    surfaces.find(
      (surface) => surface.mesh === intersection.object && surface.materialName === materialName,
    ) ?? null
  );
}

function isCanvasHitOccluded(
  hit: InteractiveCanvasHit,
  intersections: THREE.Intersection<THREE.Object3D>[],
) {
  for (const intersection of intersections) {
    if (intersection === hit.intersection) return false;
    if (intersection.distance >= hit.intersection.distance - OCCLUSION_EPSILON) return false;

    if (intersection.object === hit.surface.mesh) continue;
    if (isObjectWithinRoot(intersection.object, hit.surface.root)) continue;

    return true;
  }

  return false;
}

export function getInteractiveCanvasHit(
  intersections: THREE.Intersection<THREE.Object3D>[],
  materialNames: readonly SignMaterialName[],
  surfaces: readonly InteractiveSignSurface[],
  ray: THREE.Ray,
): InteractiveCanvasHit | null {
  const normalizedRayDirection = ray.direction.clone().normalize();
  for (const intersection of intersections) {
    const materialName = getIntersectionMaterialName(intersection, materialNames);
    if (!materialName) continue;
    if (!isIntendedCanvasSideIntersection(intersection, normalizedRayDirection, materialName)) {
      continue;
    }
    if (!isWithinInteractiveUv(intersection, materialName)) continue;

    const surface = getSurfaceForIntersection(intersection, materialName, surfaces);
    if (!surface) continue;

    const hit = { intersection, materialName, surface };
    return isCanvasHitOccluded(hit, intersections) ? null : hit;
  }

  return null;
}

export function getMaterialLabel(materialName: string | null): string | null {
  if (materialName === 'to_projects') return 'Projects';
  if (materialName === 'to_contact') return 'Contact';
  if (materialName === 'hiroto-profile') return 'About';
  return null;
}
