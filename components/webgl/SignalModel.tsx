'use client';

import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';
import { prepareSignalScene } from './prepareScene';
import { useModelCamera } from './useModelCamera';
import type { AnimatedTexturesState, InteractiveSignSurface, TrafficLight } from './types';
import { usePointerScroll } from './usePointerScroll';
import { useNavigate } from '../../lib/navigationContext';
import { tryCreateShowreelVideoTexture } from './textures';
import { getRouteForMaterial } from './modelRoutes';
import { useModelCursor } from './useModelCursor';
import { useModelInteractions } from './useModelInteractions';
import { useSignalModelFrame } from './useSignalModelFrame';
import { useCanvasHoverPointer } from './useCanvasHoverPointer';

const INITIAL_SCROLL_PROGRESS = 0;

export default function SignalModel({ interactive, highQuality }: { interactive: boolean; highQuality: boolean }) {
  const textureInterval = interactive ? 1 / 24 : 1 / 12;
  const initialTextureInterval = highQuality ? 1 / 24 : 1 / 12;
  const group = useRef<THREE.Object3D | null>(null);
  const scroll = useRef(INITIAL_SCROLL_PROGRESS);
  const scrollTarget = useRef(INITIAL_SCROLL_PROGRESS);
  const shake = useRef(0);
  const shakeClock = useRef(0);
  const navigate = useNavigate();
  const { gl, raycaster, invalidate } = useThree();
  const { scene, animations } = useGLTF('/models/model.glb');
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animatedTexturesRef = useRef<AnimatedTexturesState | null>(null);
  const trafficLightsRef = useRef<TrafficLight[]>([]);
  const showreelMeshRef = useRef<THREE.Mesh | null>(null);
  const showreelVideoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const ownedResourcesRef = useRef<Array<{ dispose: () => void }>>([]);
  const hoverPointerDirty = useRef(false);
  const textureFrameTimes = useRef({ contact: 0, profile: 0, projects: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasVideoApplied = useRef(false);

  const resetScroll = useCallback(() => {
    scroll.current = INITIAL_SCROLL_PROGRESS;
    scrollTarget.current = INITIAL_SCROLL_PROGRESS;
    shake.current = 0;
    shakeClock.current = 0;
    const action = actionRef.current;
    const duration = action?.getClip().duration || 1;
    mixerRef.current?.setTime((((INITIAL_SCROLL_PROGRESS % 1) + 1) % 1) * duration);
  }, []);

  usePointerScroll({ interactive, gl, scrollTarget, onReset: resetScroll });

  const prepared = useMemo(() => prepareSignalScene(scene), [scene]);
  const preparedScene = prepared.clone;
  const signSurfaces: readonly InteractiveSignSurface[] = prepared.signSurfaces;
  const cameraRef = useModelCamera(preparedScene);

  useEffect(() => {
    animatedTexturesRef.current = prepared.animatedTextures;
    trafficLightsRef.current = prepared.trafficLights;
    showreelMeshRef.current = prepared.showreelMesh;
    ownedResourcesRef.current = prepared.ownedResources;
    textureFrameTimes.current = { contact: 0, profile: 0, projects: 0 };
    hasVideoApplied.current = false;
  }, [prepared]);

  useEffect(() => {
    invalidate();
  }, [highQuality, invalidate]);

  useEffect(() => {
    if (!hasInteracted || hasVideoApplied.current) return;
    const mesh = showreelMeshRef.current;
    if (!mesh || Array.isArray(mesh.material)) return;
    const texture = tryCreateShowreelVideoTexture();
    if (!texture) return;
    showreelVideoTextureRef.current = texture;
    const material = mesh.material.clone() as THREE.MeshStandardMaterial;
    material.map = texture;
    material.emissiveMap = texture;
    material.needsUpdate = true;
    mesh.material = material;
    hasVideoApplied.current = true;
    invalidate();
  }, [hasInteracted, invalidate]);

  useEffect(() => {
    if (hasInteracted) return undefined;
    const markInteracted = () => setHasInteracted(true);
    const element = gl.domElement;
    element.addEventListener('pointerdown', markInteracted, { passive: true });
    element.addEventListener('wheel', markInteracted, { passive: true });
    element.addEventListener('touchstart', markInteracted, { passive: true });
    return () => {
      element.removeEventListener('pointerdown', markInteracted);
      element.removeEventListener('wheel', markInteracted);
      element.removeEventListener('touchstart', markInteracted);
    };
  }, [gl.domElement, hasInteracted]);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(preparedScene);
    const clip = animations.find((item) => item.name === 'CameraAction');
    const action = clip ? mixer.clipAction(clip, preparedScene) : null;
    if (action) {
      action.enabled = true;
      action.reset().play();
    }
    mixerRef.current = mixer;
    actionRef.current = action;
    return () => {
      actionRef.current = null;
      mixerRef.current = null;
      mixer.stopAllAction();
      mixer.uncacheRoot(preparedScene);
    };
  }, [animations, preparedScene]);

  useEffect(() => {
    return () => {
      const material = showreelMeshRef.current?.material;
      if (material && !Array.isArray(material)) {
        const standardMaterial = material as THREE.MeshStandardMaterial;
        standardMaterial.map = null;
        standardMaterial.emissiveMap = null;
      }
      showreelVideoTextureRef.current?.dispose();
      const video = showreelVideoTextureRef.current?.source?.data as HTMLVideoElement | undefined;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      ownedResourcesRef.current.forEach((resource) => resource.dispose());
    };
  }, []);

  const isCanvasHovered = useRef(false);
  const { dispatchCursorLabel, hoverPointer } = useModelCursor();

  const navigateToMaterial = useCallback(
    (materialName: string) => {
      const href = getRouteForMaterial(materialName);

      if (!href) return;

      if (navigate) {
        navigate(href);
        return;
      }

      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[SignalModel] Missing NavigationContext. Internal sign navigation requires PersistentExperience.',
          { href, materialName },
        );
      }
    },
    [navigate],
  );

  const { handlePointerDown, handlePointerUp, handleClick, handlePointerMissed } =
    useModelInteractions({
      interactive,
      navigateToMaterial,
      dispatchCursorLabel,
      raycaster,
      preparedScene,
      signSurfaces,
    });

  useSignalModelFrame({
    interactive,
    highQuality,
    hasInteracted,
    textureInterval,
    initialTextureInterval,
    scrollRef: scroll,
    scrollTargetRef: scrollTarget,
    shakeRef: shake,
    shakeClockRef: shakeClock,
    hoverPointerDirtyRef: hoverPointerDirty,
    hoverPointerRef: hoverPointer,
    isCanvasHoveredRef: isCanvasHovered,
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
  });

  useCanvasHoverPointer({
    element: gl.domElement,
    hoverPointer,
    hoverPointerDirty,
    isCanvasHovered,
    dispatchCursorLabel,
  });

  return (
    <primitive
      ref={group}
      object={preparedScene}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMissed={handlePointerMissed}
    />
  );
}

useGLTF.preload('/models/model.glb');
