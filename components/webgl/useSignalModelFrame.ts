'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getInteractiveCanvasHit, getMaterialLabel, SIGN_MATERIAL_NAMES } from './hitTest';
import { updateAnimatedTextures, updateTrafficLights } from './textureAnimation';
import type { AnimatedTexturesState, InteractiveSignSurface, TrafficLight } from './types';

type UseSignalModelFrameOptions = {
  interactive: boolean;
  highQuality: boolean;
  hasInteracted: boolean;
  textureInterval: number;
  initialTextureInterval: number;
  hoverPointerDirtyRef: React.MutableRefObject<boolean>;
  hoverPointerRef: React.MutableRefObject<THREE.Vector2>;
  isCanvasHoveredRef: React.MutableRefObject<boolean>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  raycaster: THREE.Raycaster;
  preparedScene: THREE.Object3D;
  signSurfaces: readonly InteractiveSignSurface[];
  dispatchCursorLabel: (label: string | null) => void;
  animatedTexturesRef: React.MutableRefObject<AnimatedTexturesState | null>;
  textureFrameTimes: React.MutableRefObject<{ contact: number; profile: number; projects: number }>;
  trafficLightsRef: React.MutableRefObject<TrafficLight[]>;
};

export function useSignalModelFrame(options: UseSignalModelFrameOptions) {
  const {
    interactive,
    highQuality,
    hasInteracted,
    textureInterval,
    initialTextureInterval,
    hoverPointerDirtyRef,
    hoverPointerRef,
    isCanvasHoveredRef,
    cameraRef,
    raycaster,
    preparedScene,
    signSurfaces,
    dispatchCursorLabel,
    animatedTexturesRef,
    textureFrameTimes,
    trafficLightsRef,
  } = options;

  useFrame((state, delta) => {
    if (interactive && isCanvasHoveredRef.current && hoverPointerDirtyRef.current) {
      hoverPointerDirtyRef.current = false;
      const activeCamera = cameraRef.current ?? (state.camera as THREE.PerspectiveCamera);
      raycaster.setFromCamera(hoverPointerRef.current, activeCamera);
      const intersections = raycaster.intersectObject(preparedScene, true);
      intersections.sort((a, b) => a.distance - b.distance);
      const materialName = getInteractiveCanvasHit(
        intersections,
        SIGN_MATERIAL_NAMES,
        signSurfaces,
        raycaster.ray,
      )?.materialName;
      const signLabel = getMaterialLabel(materialName ?? null);
      dispatchCursorLabel(signLabel);
    }

    const animated = animatedTexturesRef.current;
    if (animated) {
      const interval = highQuality || hasInteracted ? textureInterval : initialTextureInterval;
      updateAnimatedTextures(animated, textureFrameTimes.current, state.clock.elapsedTime, delta, interval);
    }

    updateTrafficLights(trafficLightsRef.current, state.clock.elapsedTime, highQuality || hasInteracted);
  });
}
