import * as THREE from 'three';
import {
  drawContactTexture,
  drawProjectsTexture,
  makeAnimatedCanvasTexture,
  makeShowreelTexture,
  makeVideoTexture,
} from './textures';

const SHOWREEL_CACHE_KEY = 'showreel-1.16-1.04';
const SHOWREEL_FRAGMENT = `#include <map_fragment>
      vec3 showreelColor = diffuseColor.rgb;
      float showreelLuma = dot(showreelColor, vec3(0.299, 0.587, 0.114));
      showreelColor = mix(vec3(showreelLuma), showreelColor, 1.04);
      showreelColor = (showreelColor - 0.5) * 1.16 + 0.5;
      diffuseColor.rgb = clamp(showreelColor, 0.0, 0.88);
    `;

function removeProfileMaterialGroups(object) {
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
    if (!profileMaterialIndexes.has(group.materialIndex)) {
      geometry.addGroup(group.start, group.count, group.materialIndex);
    }
  });
  object.geometry = geometry;
  return true;
}

function applyProjectsMaterial(object, texture) {
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

function applyContactMaterial(object, texture) {
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

function applyShowreelMaterial(object, texture) {
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
  object.material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      SHOWREEL_FRAGMENT,
    );
  };
  object.material.customProgramCacheKey = () => SHOWREEL_CACHE_KEY;
  object.material.needsUpdate = true;
  object.material.name = name;
}

function applyTrafficLightMaterial(object, name, trafficLights) {
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

export function prepareSignalScene(scene) {
  const clone = scene.clone(true);
  const projectsSign = makeAnimatedCanvasTexture();
  const contactSign = makeAnimatedCanvasTexture();
  const showreel = makeVideoTexture('/videos/hirotos_showreel.mp4') || makeShowreelTexture();
  const trafficLights = [];
  const objectsToRemove = [];

  if (projectsSign?.ctx)
    projectsSign.scrollWidth = drawProjectsTexture(projectsSign.ctx, projectsSign.canvas, 0);
  if (contactSign?.ctx) drawContactTexture(contactSign.ctx, contactSign.canvas, 0);

  clone.traverse((object) => {
    if ((object.name || '').toLowerCase().includes('text')) {
      objectsToRemove.push(object);
      return;
    }
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;

    if (!removeProfileMaterialGroups(object) && object.material?.name === 'hiroto-profile') {
      objectsToRemove.push(object);
      return;
    }

    const name = object.material?.name;
    if (name === 'to_projects') applyProjectsMaterial(object, projectsSign?.texture);
    if (name === 'to_contact') applyContactMaterial(object, contactSign?.texture);
    if (name === 'hirotos_showreel') applyShowreelMaterial(object, showreel);
    if (['light1', 'light2', 'light3'].includes(name)) {
      applyTrafficLightMaterial(object, name, trafficLights);
    }
  });

  objectsToRemove.forEach((object) => object.parent?.remove(object));

  const animatedTextures = { projectsSign, contactSign, projectsOffset: 0, contactTime: 0 };
  return { clone, animatedTextures, trafficLights };
}
