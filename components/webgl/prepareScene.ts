import * as THREE from 'three';
import {
  drawContactTexture,
  drawProjectsTexture,
  makeAnimatedCanvasTexture,
  makeShowreelTexture,
  makeVideoTexture,
} from './textures';
import type { PreparedSignalScene, TrafficLight } from './types';

type SignalMaterial = THREE.MeshStandardMaterial;
type SignalMesh = THREE.Mesh<THREE.BufferGeometry, SignalMaterial | SignalMaterial[]>;
type ShaderWithFragment = { fragmentShader: string };

function asSignalMesh(object: THREE.Object3D): SignalMesh | null {
  return (object as SignalMesh).isMesh ? (object as SignalMesh) : null;
}

const SHOWREEL_CACHE_KEY = 'showreel-1.16-1.04';
const SHOWREEL_FRAGMENT = `#include <map_fragment>
      vec3 showreelColor = diffuseColor.rgb;
      float showreelLuma = dot(showreelColor, vec3(0.299, 0.587, 0.114));
      showreelColor = mix(vec3(showreelLuma), showreelColor, 1.04);
      showreelColor = (showreelColor - 0.5) * 1.16 + 0.5;
      diffuseColor.rgb = clamp(showreelColor, 0.0, 0.88);
    `;

function removeProfileMaterialGroups(object: SignalMesh) {
  if (!Array.isArray(object.material)) return false;
  const profileMaterialIndexes = new Set(
    object.material
      .map((material, index) => (material?.name === 'hiroto-profile' ? index : -1))
      .filter((index) => index >= 0),
  );
  if (profileMaterialIndexes.size === 0) return false;
  const geometry = object.geometry.clone();
  geometry.clearGroups();
  object.geometry.groups.forEach((group) => {
    if (group.materialIndex === undefined || !profileMaterialIndexes.has(group.materialIndex)) {
      geometry.addGroup(group.start, group.count, group.materialIndex);
    }
  });
  object.geometry = geometry;
  return true;
}

function applyProjectsMaterial(object: SignalMesh, texture: THREE.Texture | null | undefined) {
  if (Array.isArray(object.material)) return;
  const name = object.material.name;
  object.material = object.material.clone();
  object.material.map = texture || object.material.map;
  object.material.emissiveMap = texture || object.material.emissiveMap;
  object.material.color.set('#ffffff');
  object.material.emissive.set('#ffffff');
  object.material.emissiveIntensity = 0.68;
  object.material.metalness = 0;
  object.material.roughness = 0.48;
  object.material.toneMapped = false;
  object.material.side = THREE.DoubleSide;
  object.material.needsUpdate = true;
  object.material.name = name;
}

function applyContactMaterial(object: SignalMesh, texture: THREE.Texture | null | undefined) {
  if (Array.isArray(object.material)) return;
  const name = object.material.name;
  object.material = object.material.clone();
  object.material.map = texture || object.material.map;
  object.material.emissiveMap = texture || object.material.emissiveMap;
  object.material.color.set('#ffffff');
  object.material.emissive.set('#ffffff');
  object.material.emissiveIntensity = 0.86;
  object.material.metalness = 0;
  object.material.roughness = 0.5;
  object.material.toneMapped = false;
  object.material.side = THREE.DoubleSide;
  object.material.needsUpdate = true;
  object.material.name = name;
}

function applyShowreelMaterial(object: SignalMesh, texture: THREE.Texture | null) {
  if (Array.isArray(object.material)) return;
  const name = object.material.name;
  object.material = object.material.clone();
  object.material.map = texture;
  object.material.emissiveMap = texture;
  object.material.color.set('#ffffff');
  object.material.emissive.set('#ffffff');
  object.material.emissiveIntensity = 0.56;
  object.material.roughness = 0.62;
  object.material.metalness = 0;
  object.material.toneMapped = false;
  object.material.side = THREE.DoubleSide;
  object.material.onBeforeCompile = (shader: ShaderWithFragment) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      SHOWREEL_FRAGMENT,
    );
  };
  object.material.customProgramCacheKey = () => SHOWREEL_CACHE_KEY;
  object.material.needsUpdate = true;
  object.material.name = name;
}

function applyTrafficLightMaterial(
  object: SignalMesh,
  name: string,
  trafficLights: TrafficLight[],
) {
  if (Array.isArray(object.material)) return;
  object.material = object.material.clone();
  object.material.color.set('#050505');
  object.material.emissive.set('#050505');
  object.material.emissiveIntensity = 0.05;
  object.material.toneMapped = false;
  object.material.needsUpdate = true;
  trafficLights.push({
    material: object.material,
    idleColor: new THREE.Color('#050505'),
    activeColor: new THREE.Color(
      name === 'light1' ? '#ff2b1f' : name === 'light2' ? '#ffd21f' : '#12d7a8',
    ),
  });
}

export function prepareSignalScene(scene: THREE.Object3D): PreparedSignalScene {
  const clone = scene.clone(true);
  const projectsSign = makeAnimatedCanvasTexture();
  const contactSign = makeAnimatedCanvasTexture();
  const showreel = makeVideoTexture('/videos/hirotos_showreel.mp4') || makeShowreelTexture();
  const trafficLights: TrafficLight[] = [];
  const objectsToRemove: THREE.Object3D[] = [];

  if (projectsSign?.ctx)
    projectsSign.scrollWidth = drawProjectsTexture(projectsSign.ctx, projectsSign.canvas, 0);
  if (contactSign?.ctx) drawContactTexture(contactSign.ctx, contactSign.canvas, 0);

  clone.traverse((object: THREE.Object3D) => {
    if ((object.name || '').toLowerCase().includes('text')) {
      objectsToRemove.push(object);
      return;
    }
    const mesh = asSignalMesh(object);
    if (!mesh) return;
    object.castShadow = true;
    object.receiveShadow = true;

    if (
      !removeProfileMaterialGroups(mesh) &&
      !Array.isArray(mesh.material) &&
      mesh.material?.name === 'hiroto-profile'
    ) {
      objectsToRemove.push(object);
      return;
    }

    const name = Array.isArray(mesh.material) ? undefined : mesh.material?.name;
    if (name === 'to_projects') applyProjectsMaterial(mesh, projectsSign?.texture);
    if (name === 'to_contact') applyContactMaterial(mesh, contactSign?.texture);
    if (name === 'hirotos_showreel') applyShowreelMaterial(mesh, showreel);
    if (name && ['light1', 'light2', 'light3'].includes(name)) {
      applyTrafficLightMaterial(mesh, name, trafficLights);
    }
  });

  objectsToRemove.forEach((object) => object.parent?.remove(object));

  const animatedTextures = { projectsSign, contactSign, projectsOffset: 0, contactTime: 0 };
  return { clone, animatedTextures, trafficLights };
}
