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
  scrollRef: React.MutableRefObject<number>;
  scrollTargetRef: React.MutableRefObject<number>;
  shakeRef: React.MutableRefObject<number>;
  shakeClockRef: React.MutableRefObject<number>;
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
  actionRef: React.MutableRefObject<THREE.AnimationAction | null>;
  mixerRef: React.MutableRefObject<THREE.AnimationMixer | null>;
};

export function useSignalModelFrame(options: UseSignalModelFrameOptions) {
  const {
    interactive,
    highQuality,
    hasInteracted,
    textureInterval,
    initialTextureInterval,
    scrollRef,
    scrollTargetRef,
    shakeRef,
    shakeClockRef,
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
    actionRef,
    mixerRef,
  } = options;

  useFrame((state, delta) => {
    if (interactive && isCanvasHoveredRef.current && Math.abs(scrollTargetRef.current - scrollRef.current) > 0.0005) {
      hoverPointerDirtyRef.current = true;
    }

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

    const action = actionRef.current;
    const mixer = mixerRef.current;
    if (!action) {
      mixer?.update(0);
      return;
    }
    if (!mixer) return;
    const duration = action.getClip().duration || 1;
    const smoothing = 1 - Math.exp(-delta / 0.14);
    scrollRef.current += (scrollTargetRef.current - scrollRef.current) * smoothing;
    if (Math.abs(scrollRef.current) > 1000) {
      const whole = Math.trunc(scrollRef.current);
      scrollRef.current -= whole;
      scrollTargetRef.current -= whole;
    }
    mixer.setTime((((scrollRef.current % 1) + 1) % 1) * duration);
    const camera = cameraRef.current;
    if (camera && shakeRef.current > 0.0001) {
      const step = Math.min(delta, 1 / 30);
      shakeClockRef.current += 52 * step;
      camera.position.x += Math.sin(1.6 * shakeClockRef.current) * shakeRef.current * 0.0026;
      camera.position.y += Math.cos(2.1 * shakeClockRef.current) * shakeRef.current * 0.0026 * 0.35;
      shakeRef.current *= Math.exp(-14 * step);
    }
  });
}
