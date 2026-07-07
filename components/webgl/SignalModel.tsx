'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';
import { prepareSignalScene } from './prepareScene';
import { useModelCamera } from './useModelCamera';
import type { InteractiveCanvasHit } from './hitTest';
import type { AnimatedTexturesState, InteractiveSignSurface, TrafficLight } from './types';
import { emitInteractionEvent } from '../../lib/interactions';
import { useNavigate } from '../../lib/navigationContext';
import { tryCreateShowreelVideoTextureResource } from './textures';
import { getRouteForMaterial } from './modelRoutes';
import { useModelCursor } from './useModelCursor';
import { useModelInteractions } from './useModelInteractions';
import { useSignalModelFrame } from './useSignalModelFrame';
import { useCanvasHoverPointer } from './useCanvasHoverPointer';

export default function SignalModel({ interactive, highQuality }: { interactive: boolean; highQuality: boolean }) {
  const textureInterval = interactive ? 1 / 24 : 1 / 12;
  const initialTextureInterval = highQuality ? 1 / 24 : 1 / 12;
  const group = useRef<THREE.Object3D | null>(null);
  const navigate = useNavigate();
  const { gl, raycaster, invalidate } = useThree();
  const { scene } = useGLTF('/models/model.glb');
  const animatedTexturesRef = useRef<AnimatedTexturesState | null>(null);
  const trafficLightsRef = useRef<TrafficLight[]>([]);
  const showreelMeshRef = useRef<THREE.Mesh | null>(null);
  const showreelVideoResourceRef = useRef<ReturnType<typeof tryCreateShowreelVideoTextureResource> | null>(null);
  const ownedResourcesRef = useRef<Array<{ dispose: () => void }>>([]);
  const hoverPointerDirty = useRef(false);
  const textureFrameTimes = useRef({ contact: 0, profile: 0, projects: 0 });
  const hasVideoApplied = useRef(false);
  const portalNavigationTimerRef = useRef<number | null>(null);
  const isPortalNavigationPendingRef = useRef(false);
  const portalPulseStartedAtRef = useRef<number | null>(null);
  const portalPulseBaseRef = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  } | null>(null);
  const activeSignGlowRef = useRef<{
    material: THREE.MeshStandardMaterial;
    startedAt: number;
    baseEmissive: THREE.Color;
    baseEmissiveIntensity: number;
  } | null>(null);

  function restoreActiveSignGlow() {
    const active = activeSignGlowRef.current;
    if (!active) return;

    active.material.emissive.copy(active.baseEmissive);
    active.material.emissiveIntensity = active.baseEmissiveIntensity;
    active.material.needsUpdate = true;
    activeSignGlowRef.current = null;
  }

  const prepared = useMemo(() => prepareSignalScene(scene), [scene]);
  const preparedScene = prepared.clone;
  const signSurfaces: readonly InteractiveSignSurface[] = prepared.signSurfaces;
  const raycastTargets = useMemo<readonly THREE.Object3D[]>(() => {
    return signSurfaces.every((surface) => (surface.mesh as THREE.Mesh).isMesh === true)
      ? signSurfaces.map((surface) => surface.mesh)
      : [preparedScene];
  }, [preparedScene, signSurfaces]);
  const cameraRef = useModelCamera(preparedScene);

  useEffect(() => {
    animatedTexturesRef.current = prepared.animatedTextures;
    trafficLightsRef.current = prepared.trafficLights;
    showreelMeshRef.current = prepared.showreelMesh;
    ownedResourcesRef.current = prepared.ownedResources;
    textureFrameTimes.current = { contact: 0, profile: 0, projects: 0 };
    hasVideoApplied.current = false;
    showreelVideoResourceRef.current?.dispose();
    showreelVideoResourceRef.current = null;
  }, [prepared]);

  useEffect(() => {
    invalidate();
  }, [highQuality, invalidate]);

  useEffect(() => {
    if (hasVideoApplied.current) return;
    const mesh = showreelMeshRef.current;
    if (!mesh || Array.isArray(mesh.material)) return;
    if (!showreelVideoResourceRef.current) {
      showreelVideoResourceRef.current = tryCreateShowreelVideoTextureResource();
    }
    const resource = showreelVideoResourceRef.current;
    if (!resource) return;

    const applyReadyVideoMaterial = () => {
      if (hasVideoApplied.current) return;
      const currentMesh = showreelMeshRef.current;
      if (!currentMesh || Array.isArray(currentMesh.material)) return;
      const material = currentMesh.material.clone() as THREE.MeshStandardMaterial;
      material.map = resource.texture;
      material.emissiveMap = resource.texture;
      material.needsUpdate = true;
      currentMesh.material = material;
      hasVideoApplied.current = true;
      invalidate();
    };

    if (resource.isReady()) {
      applyReadyVideoMaterial();
      return;
    }

    const handleReady = () => {
      cleanupListeners();
      applyReadyVideoMaterial();
    };

    const cleanupListeners = () => {
      resource.video.removeEventListener('loadeddata', handleReady);
      resource.video.removeEventListener('canplay', handleReady);
      resource.video.removeEventListener('canplaythrough', handleReady);
    };

    resource.video.addEventListener('loadeddata', handleReady, { passive: true });
    resource.video.addEventListener('canplay', handleReady, { passive: true });
    resource.video.addEventListener('canplaythrough', handleReady, { passive: true });

    return cleanupListeners;
  }, [invalidate, prepared]);

  useEffect(() => {
    return () => {
      if (portalNavigationTimerRef.current !== null) {
        window.clearTimeout(portalNavigationTimerRef.current);
        portalNavigationTimerRef.current = null;
      }
      isPortalNavigationPendingRef.current = false;
      restoreActiveSignGlow();
      const material = showreelMeshRef.current?.material;
      if (material && !Array.isArray(material)) {
        const standardMaterial = material as THREE.MeshStandardMaterial;
        standardMaterial.map = null;
        standardMaterial.emissiveMap = null;
      }
      showreelVideoResourceRef.current?.dispose();
      showreelVideoResourceRef.current = null;
      ownedResourcesRef.current.forEach((resource) => resource.dispose());
    };
  }, []);

  const isCanvasHovered = useRef(false);
  const { dispatchCursorLabel, hoverPointer } = useModelCursor();

  const getHitStandardMaterial = useCallback((hit: InteractiveCanvasHit) => {
    const mesh = hit.intersection.object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    const material = Array.isArray(mesh.material)
      ? mesh.material[hit.intersection.face?.materialIndex ?? 0]
      : mesh.material;

    return material instanceof THREE.MeshStandardMaterial ? material : null;
  }, []);

  useFrame(() => {
    const startedAt = portalPulseStartedAtRef.current;
    const base = portalPulseBaseRef.current;
    const modelGroup = group.current;
    if (startedAt === null || !base || !modelGroup) return;

    const elapsed = performance.now() - startedAt;
    const progress = Math.min(elapsed / 220, 1);
    const lift = Math.sin(progress * Math.PI);
    const settle = 1 - Math.pow(1 - progress, 3);

    modelGroup.scale.set(
      base.scale.x * (1 + lift * 0.018),
      base.scale.y * (1 + lift * 0.018),
      base.scale.z * (1 + lift * 0.018),
    );
    modelGroup.rotation.set(
      base.rotation.x - lift * 0.012,
      base.rotation.y + lift * 0.018,
      base.rotation.z - lift * 0.006,
    );
    modelGroup.position.set(
      base.position.x,
      base.position.y + lift * 0.035,
      base.position.z - settle * 0.035,
    );

    if (progress >= 1) {
      modelGroup.position.copy(base.position);
      modelGroup.rotation.copy(base.rotation);
      modelGroup.scale.copy(base.scale);
      portalPulseStartedAtRef.current = null;
      portalPulseBaseRef.current = null;
      return;
    }

    invalidate();
  });

  useFrame(() => {
    const active = activeSignGlowRef.current;
    if (!active) return;

    const elapsed = performance.now() - active.startedAt;
    const progress = Math.min(elapsed / 520, 1);
    const flare = Math.sin(progress * Math.PI);
    const warmSignal = new THREE.Color('#8fc8ff').lerp(new THREE.Color('#ffd38a'), flare * 0.35);

    active.material.emissive.copy(active.baseEmissive).lerp(warmSignal, flare * 0.72);
    active.material.emissiveIntensity = active.baseEmissiveIntensity + flare * 0.95;
    active.material.needsUpdate = true;

    if (progress >= 1) {
      restoreActiveSignGlow();
      return;
    }

    invalidate();
  });

  const navigateToMaterial = useCallback(
    (hit: InteractiveCanvasHit, event: MouseEvent | PointerEvent) => {
      if (isPortalNavigationPendingRef.current) return;

      const { materialName } = hit;
      const href = getRouteForMaterial(materialName);

      if (!href) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      emitInteractionEvent(window, 'modelPortalStart', {
        href,
        materialName,
        clientX: event.clientX,
        clientY: event.clientY,
      });

      const performNavigation = () => {
        isPortalNavigationPendingRef.current = false;

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
      };

      if (prefersReducedMotion) {
        performNavigation();
        return;
      }

      restoreActiveSignGlow();
      const signMaterial = getHitStandardMaterial(hit);
      if (signMaterial) {
        activeSignGlowRef.current = {
          material: signMaterial,
          startedAt: performance.now(),
          baseEmissive: signMaterial.emissive.clone(),
          baseEmissiveIntensity: signMaterial.emissiveIntensity,
        };
        invalidate();
      }

      const modelGroup = group.current;
      if (modelGroup) {
        portalPulseBaseRef.current = {
          position: modelGroup.position.clone(),
          rotation: modelGroup.rotation.clone(),
          scale: modelGroup.scale.clone(),
        };
        portalPulseStartedAtRef.current = performance.now();
        invalidate();
      }

      isPortalNavigationPendingRef.current = true;
      portalNavigationTimerRef.current = window.setTimeout(() => {
        portalNavigationTimerRef.current = null;
        performNavigation();
      }, 90);
    },
    [getHitStandardMaterial, invalidate, navigate],
  );

  const { handlePointerDown, handlePointerUp, handleClick, handlePointerMissed } =
    useModelInteractions({
      interactive,
      navigateToMaterial,
      dispatchCursorLabel,
      raycaster,
      raycastTargets,
      signSurfaces,
    });

  useSignalModelFrame({
    interactive,
    highQuality,
    hasInteracted: true,
    textureInterval,
    initialTextureInterval,
    hoverPointerDirtyRef: hoverPointerDirty,
    hoverPointerRef: hoverPointer,
    isCanvasHoveredRef: isCanvasHovered,
    cameraRef,
    raycaster,
    raycastTargets,
    signSurfaces,
    dispatchCursorLabel,
    animatedTexturesRef,
    textureFrameTimes,
    trafficLightsRef,
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
