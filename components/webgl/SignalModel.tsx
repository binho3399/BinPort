'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as THREE from 'three';
import { prepareSignalScene } from './prepareScene';
import { getInteractiveCanvasHit, getMaterialLabel, SIGN_MATERIAL_NAMES } from './hitTest';
import { updateAnimatedTextures, updateTrafficLights } from './textureAnimation';
import { useModelCamera } from './useModelCamera';
import type { AnimatedTexturesState, InteractiveSignSurface, TrafficLight } from './types';
import { usePointerScroll } from './usePointerScroll';
import { signalEvents } from '../../lib/events';
import { useNavigate } from '../../lib/navigationContext';
import { tryCreateShowreelVideoTexture } from './textures';

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
    textureFrameTimes.current = { contact: 0, profile: 0, projects: 0 };
    hasVideoApplied.current = false;
  }, [prepared]);

  useEffect(() => {
    invalidate();
  }, [highQuality, invalidate]);

  useEffect(() => {
    if (!highQuality || !hasInteracted || hasVideoApplied.current) return;
    const mesh = showreelMeshRef.current;
    if (!mesh || Array.isArray(mesh.material)) return;
    const texture = tryCreateShowreelVideoTexture();
    if (!texture) return;
    const material = mesh.material.clone() as THREE.MeshStandardMaterial;
    material.map = texture;
    material.emissiveMap = texture;
    material.needsUpdate = true;
    mesh.material = material;
    hasVideoApplied.current = true;
    invalidate();
  }, [highQuality, hasInteracted, invalidate]);

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

  const activeLabel = useRef<string | null>(null);
  const isCanvasHovered = useRef(false);
  const hoverPointer = useRef(new THREE.Vector2());

  const dispatchCursorLabel = useCallback((label: string | null) => {
    if (activeLabel.current === label) return;
    activeLabel.current = label;
    document.body.style.cursor = label ? 'pointer' : '';
    if (label) {
      window.dispatchEvent(
        new CustomEvent(signalEvents.cursorEnter, { detail: { label, showArrow: true } }),
      );
    } else {
      window.dispatchEvent(new CustomEvent(signalEvents.cursorLeave));
    }
  }, []);

  const getInteractiveMaterialNameFromRay = (ray: THREE.Ray) => {
    raycaster.ray.copy(ray);
    const intersections = raycaster.intersectObject(preparedScene, true);
    intersections.sort((a, b) => a.distance - b.distance);
    return getInteractiveCanvasHit(intersections, SIGN_MATERIAL_NAMES, signSurfaces, raycaster.ray)
      ?.materialName;
  };

  const navigateToMaterial = useCallback(
    (materialName: string) => {
      const href =
        materialName === 'hiroto-profile'
          ? '/about'
          : materialName === 'to_projects'
            ? '/projects'
            : materialName === 'to_contact'
              ? '/contact'
              : null;

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

  const touchStart = useRef<{ id: number; x: number; y: number } | null>(null);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    if (event.nativeEvent.pointerType !== 'touch') return;
    touchStart.current = {
      id: event.nativeEvent.pointerId,
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    };
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive || event.nativeEvent.pointerType !== 'touch') return;
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || start.id !== event.nativeEvent.pointerId) return;
    const dist = Math.hypot(
      event.nativeEvent.clientX - start.x,
      event.nativeEvent.clientY - start.y,
    );
    if (dist > 12) return;
    const materialName = getInteractiveMaterialNameFromRay(event.ray);
    if (!materialName) return;
    navigateToMaterial(materialName);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    if ((event.nativeEvent as PointerEvent).pointerType === 'touch') return;
    const materialName = getInteractiveMaterialNameFromRay(event.ray);
    if (!materialName) return;
    navigateToMaterial(materialName);
  };

  const handlePointerMissed = useCallback(() => {
    dispatchCursorLabel(null);
    window.dispatchEvent(new CustomEvent(signalEvents.resetCameraScroll));
  }, [dispatchCursorLabel]);

  useFrame((state, delta) => {
    if (
      interactive &&
      isCanvasHovered.current &&
      Math.abs(scrollTarget.current - scroll.current) > 0.0005
    ) {
      hoverPointerDirty.current = true;
    }

    if (interactive && isCanvasHovered.current && hoverPointerDirty.current) {
      hoverPointerDirty.current = false;
      const activeCamera = cameraRef.current ?? (state.camera as THREE.PerspectiveCamera);
      raycaster.setFromCamera(hoverPointer.current, activeCamera);
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
      updateAnimatedTextures(
        animated,
        textureFrameTimes.current,
        state.clock.elapsedTime,
        delta,
        interval,
      );
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
    scroll.current += (scrollTarget.current - scroll.current) * smoothing;
    if (Math.abs(scroll.current) > 1000) {
      const whole = Math.trunc(scroll.current);
      scroll.current -= whole;
      scrollTarget.current -= whole;
    }
    mixer.setTime((((scroll.current % 1) + 1) % 1) * duration);
    const camera = cameraRef.current;
    if (camera && shake.current > 0.0001) {
      const step = Math.min(delta, 1 / 30);
      shakeClock.current += 52 * step;
      camera.position.x += Math.sin(1.6 * shakeClock.current) * shake.current * 0.0026;
      camera.position.y += Math.cos(2.1 * shakeClock.current) * shake.current * 0.0026 * 0.35;
      shake.current *= Math.exp(-14 * step);
    }
  });

  useEffect(() => {
    const element = gl.domElement;

    const updateHoverPointer = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      hoverPointer.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      hoverPointerDirty.current = true;
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      isCanvasHovered.current = true;
      updateHoverPointer(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      isCanvasHovered.current = true;
      updateHoverPointer(event);
    };

    const handlePointerLeave = () => {
      isCanvasHovered.current = false;
      hoverPointerDirty.current = false;
      dispatchCursorLabel(null);
    };

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [dispatchCursorLabel, gl.domElement]);

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
