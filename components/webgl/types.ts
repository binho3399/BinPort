import type * as THREE from 'three';

export type AnimatedCanvasTexture = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  scrollWidth?: number;
};

export type AnimatedTexturesState = {
  projectsSign: AnimatedCanvasTexture | null;
  contactSign: AnimatedCanvasTexture | null;
  profileSign: AnimatedCanvasTexture | null;
  projectsOffset: number;
  contactTime: number;
  profileTime: number;
};

export type TrafficLight = {
  material: THREE.MeshStandardMaterial;
  idleColor: THREE.Color;
  activeColor: THREE.Color;
};

export type PreparedSignalSceneResource = {
  dispose: () => void;
};

export type InteractiveSignMaterialName = 'hiroto-profile' | 'to_projects' | 'to_contact';

export type InteractiveSignSurface = {
  mesh: THREE.Object3D;
  materialName: InteractiveSignMaterialName;
  root: THREE.Object3D;
};

export type PreparedSignalScene = {
  clone: THREE.Object3D;
  animatedTextures: AnimatedTexturesState;
  trafficLights: TrafficLight[];
  signSurfaces: InteractiveSignSurface[];
  showreelMesh: THREE.Mesh | null;
  ownedResources: PreparedSignalSceneResource[];
};
