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
import type { ModelRouteMood } from './modelRoutes';
import { useModelCursor } from './useModelCursor';
import { useModelInteractions } from './useModelInteractions';
import { useSignalModelFrame } from './useSignalModelFrame';
import { useCanvasHoverPointer } from './useCanvasHoverPointer';
import { useModelDragRotation } from './useModelDragRotation';

export default function SignalModel({
  interactive,
  highQuality,
  mood,
}: {
  interactive: boolean;
  highQuality: boolean;
  mood: ModelRouteMood;
}) {
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
  const activeSignRippleRef = useRef<{
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    material: THREE.MeshStandardMaterial;
    originalMaterial: THREE.Material;
    materialIndex: number | null;
    startedAt: number;
    uniforms: {
      uPortalProgress: { value: number };
      uPortalStrength: { value: number };
      uPortalOrigin: { value: THREE.Vector2 };
    };
  } | null>(null);

  function restoreActiveSignGlow() {
    const active = activeSignGlowRef.current;
    if (!active) return;

    active.material.emissive.copy(active.baseEmissive);
    active.material.emissiveIntensity = active.baseEmissiveIntensity;
    active.material.needsUpdate = true;
    activeSignGlowRef.current = null;
  }

  function restoreActiveSignRipple() {
    const active = activeSignRippleRef.current;
    if (!active) return;

    if (active.materialIndex === null) {
      active.mesh.material = active.originalMaterial;
    } else if (Array.isArray(active.mesh.material)) {
      active.mesh.material[active.materialIndex] = active.originalMaterial;
    }

    active.material.dispose();
    activeSignRippleRef.current = null;
  }

  const prepared = useMemo(() => prepareSignalScene(scene), [scene]);
  const preparedScene = prepared.clone;
  const visualRoot = useMemo(() => {
    const root = new THREE.Group();
    root.name = 'SignalModelVisualRoot';

    preparedScene.updateMatrixWorld(true);
    const cameraObject = preparedScene.getObjectByName('Camera');
    if (cameraObject?.parent && cameraObject.parent !== preparedScene) {
      preparedScene.attach(cameraObject);
    }

    preparedScene.add(root);
    const topLevelChildren = [...preparedScene.children];
    for (const child of topLevelChildren) {
      if (child === root || child === cameraObject) continue;
      root.attach(child);
    }

    return root;
  }, [preparedScene]);
  const signSurfaces: readonly InteractiveSignSurface[] = prepared.signSurfaces;
  const raycastTargets = useMemo<readonly THREE.Object3D[]>(() => {
    return signSurfaces.every((surface) => (surface.mesh as THREE.Mesh).isMesh === true)
      ? signSurfaces.map((surface) => surface.mesh)
      : [preparedScene];
  }, [preparedScene, signSurfaces]);
  const cameraRef = useModelCamera(preparedScene);

  useEffect(() => {
    group.current = visualRoot;
    return () => {
      if (group.current === visualRoot) group.current = null;
    };
  }, [visualRoot]);

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
      restoreActiveSignRipple();
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

  useEffect(() => {
    invalidate();
  }, [invalidate, mood]);

  const { rotationOffsetRef, shouldSuppressNavigation } = useModelDragRotation({
    element: gl.domElement,
    interactive,
    invalidate,
  });

  const startSignRipple = useCallback((hit: InteractiveCanvasHit) => {
    const uv = hit.intersection.uv;
    if (!uv) return getHitStandardMaterial(hit);

    restoreActiveSignRipple();
    const mesh = hit.intersection.object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    const materials = mesh.material;
    const materialIndex = Array.isArray(materials) ? (hit.intersection.face?.materialIndex ?? 0) : null;
    const originalMaterial = Array.isArray(materials) ? materials[materialIndex ?? 0] : materials;
    if (!(originalMaterial instanceof THREE.MeshStandardMaterial)) return null;

    const rippleMaterial = originalMaterial.clone();
    const uniforms = {
      uPortalProgress: { value: 0 },
      uPortalStrength: { value: 0 },
      uPortalOrigin: { value: uv.clone() },
    };

    rippleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uPortalProgress = uniforms.uPortalProgress;
      shader.uniforms.uPortalStrength = uniforms.uPortalStrength;
      shader.uniforms.uPortalOrigin = uniforms.uPortalOrigin;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vPortalUv;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPortalUv = uv;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uPortalProgress;\nuniform float uPortalStrength;\nuniform vec2 uPortalOrigin;\nvarying vec2 vPortalUv;',
        )
        .replace(
          '#include <dithering_fragment>',
          'float portalDistance = distance(vPortalUv, uPortalOrigin);\nfloat portalRadius = mix(0.03, 0.62, uPortalProgress);\nfloat portalRing = smoothstep(0.055, 0.0, abs(portalDistance - portalRadius));\nfloat portalCore = smoothstep(0.22, 0.0, portalDistance) * (1.0 - uPortalProgress);\nvec3 portalColor = mix(vec3(0.42, 0.72, 1.0), vec3(1.0, 0.76, 0.42), 0.28);\ngl_FragColor.rgb += portalColor * (portalRing * 0.42 + portalCore * 0.18) * uPortalStrength;\n#include <dithering_fragment>',
        );
    };
    rippleMaterial.customProgramCacheKey = () => 'signal-portal-ripple-v1';
    rippleMaterial.needsUpdate = true;

    if (materialIndex === null) {
      mesh.material = rippleMaterial;
    } else if (Array.isArray(mesh.material)) {
      mesh.material[materialIndex] = rippleMaterial;
    }

    activeSignRippleRef.current = {
      mesh,
      material: rippleMaterial,
      originalMaterial,
      materialIndex,
      startedAt: performance.now(),
      uniforms,
    };

    return rippleMaterial;
  }, [getHitStandardMaterial]);

  useFrame(() => {
    const modelGroup = group.current;
    if (!modelGroup || portalPulseStartedAtRef.current !== null) return;

    const rotationOffset = rotationOffsetRef.current;
    const targetPosition = new THREE.Vector3(...mood.position);
    const targetRotation = new THREE.Euler(
      mood.rotation[0] + rotationOffset.x,
      mood.rotation[1] + rotationOffset.y,
      mood.rotation[2],
    );
    const targetScale = new THREE.Vector3(mood.scale, mood.scale, mood.scale);
    modelGroup.position.lerp(targetPosition, 0.08);
    modelGroup.rotation.x = THREE.MathUtils.lerp(modelGroup.rotation.x, targetRotation.x, 0.08);
    modelGroup.rotation.y = THREE.MathUtils.lerp(modelGroup.rotation.y, targetRotation.y, 0.08);
    modelGroup.rotation.z = THREE.MathUtils.lerp(modelGroup.rotation.z, targetRotation.z, 0.08);
    modelGroup.scale.lerp(targetScale, 0.08);

    const isSettled =
      modelGroup.position.distanceTo(targetPosition) < 0.002 &&
      Math.abs(modelGroup.rotation.x - targetRotation.x) < 0.0005 &&
      Math.abs(modelGroup.rotation.y - targetRotation.y) < 0.0005 &&
      Math.abs(modelGroup.rotation.z - targetRotation.z) < 0.0005 &&
      modelGroup.scale.distanceTo(targetScale) < 0.002;

    if (!isSettled) invalidate();
  });

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

  useFrame(() => {
    const active = activeSignRippleRef.current;
    if (!active) return;

    const elapsed = performance.now() - active.startedAt;
    const progress = Math.min(elapsed / 560, 1);
    const fade = Math.sin(progress * Math.PI);
    active.uniforms.uPortalProgress.value = progress;
    active.uniforms.uPortalStrength.value = fade;

    if (progress >= 1) {
      restoreActiveSignRipple();
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
      const signMaterial = startSignRipple(hit);
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
    [invalidate, navigate, startSignRipple],
  );

  const { handlePointerDown, handlePointerUp, handleClick, handlePointerMissed } =
    useModelInteractions({
      interactive,
      navigateToMaterial,
      dispatchCursorLabel,
      raycaster,
      raycastTargets,
      signSurfaces,
      shouldSuppressNavigation,
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
      object={preparedScene}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMissed={handlePointerMissed}
    />
  );
}

useGLTF.preload('/models/model.glb');
