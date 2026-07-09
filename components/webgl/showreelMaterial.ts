import * as THREE from 'three';

import type { ShowreelVideoTextureResource } from './textures';

export function captureShowreelOriginalMaterial(
  mesh: THREE.Mesh | null,
): THREE.Material | null {
  if (!mesh || Array.isArray(mesh.material)) return null;
  return mesh.material;
}

export function restoreShowreelMaterial({
  mesh,
  originalMaterial,
  ownedMaterial,
}: {
  mesh: THREE.Mesh | null;
  originalMaterial: THREE.Material | null;
  ownedMaterial: THREE.Material | null;
}) {
  if (!mesh) return;

  if (originalMaterial) {
    if (mesh.material === ownedMaterial) {
      mesh.material = originalMaterial;
    }
    disposeOwnedShowreelMaterial(ownedMaterial);
    return;
  }

  if (!Array.isArray(mesh.material) && mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.map = null;
    mesh.material.emissiveMap = null;
    mesh.material.needsUpdate = true;
  }
}

export function disposeOwnedShowreelMaterial(material: THREE.Material | null) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;
  material.map = null;
  material.emissiveMap = null;
  material.dispose();
}

export function applyShowreelVideoMaterial({
  mesh,
  resource,
}: {
  mesh: THREE.Mesh | null;
  resource: ShowreelVideoTextureResource;
}) {
  if (!mesh || Array.isArray(mesh.material) || !(mesh.material instanceof THREE.MeshStandardMaterial)) return null;

  const material = mesh.material.clone();
  material.map = resource.texture;
  material.emissiveMap = resource.texture;
  material.needsUpdate = true;
  mesh.material = material;
  return material;
}
