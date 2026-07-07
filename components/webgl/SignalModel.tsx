'use client';

import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';
import { prepareSignalScene } from './prepareScene';
import { useModelCamera } from './useModelCamera';
import type { AnimatedTexturesState, InteractiveSignSurface, TrafficLight } from './types';
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
