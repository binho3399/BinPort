'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { drawProfileTexture } from '../profileSignCanvas';
import { prepareSignalScene } from './prepareScene';
import { drawContactTexture, drawProjectsTexture } from './textures';
import type { AnimatedTexturesState, TrafficLight } from './types';
import { usePointerScroll } from './usePointerScroll';
import { signalEvents } from '../../lib/events';

function getIntersectionMaterial(
  intersection: THREE.Intersection<THREE.Object3D>,
): THREE.Material | null {
  const mesh = intersection.object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  if (!mesh.isMesh) return null;

  if (!Array.isArray(mesh.material)) return mesh.material;

  const faceMaterialIndex = intersection.face?.materialIndex;
  if (typeof faceMaterialIndex === 'number') {
    return mesh.material[faceMaterialIndex] ?? null;
  }

  if (typeof intersection.faceIndex !== 'number') return null;

  const triangleOffset = intersection.faceIndex * 3;
  const hitGroup = mesh.geometry.groups.find(
    (group) => triangleOffset >= group.start && triangleOffset < group.start + group.count,
  );

  return typeof hitGroup?.materialIndex === 'number' ? mesh.material[hitGroup.materialIndex] ?? null : null;
}

function getIntersectionMaterialName(
  intersection: THREE.Intersection<THREE.Object3D>,
  materialNames: readonly SignMaterialName[],
): SignMaterialName | null {
  const material = getIntersectionMaterial(intersection);
  if (!material) return null;

  return materialNames.find((materialName) => material.name === materialName) ?? null;
}

const SIGN_FACE_DIRECTION = {
  'hiroto-profile': 'front',
  to_projects: 'front',
  to_contact: 'back',
} as const;

type SignMaterialName = keyof typeof SIGN_FACE_DIRECTION;

const SURFACE_DISTANCE_EPSILON = 0.01;
const SIGN_HIT_BOUNDS: Record<SignMaterialName, { minU: number; maxU: number; minV: number; maxV: number }> = {
  'hiroto-profile': { minU: 0.08, maxU: 0.92, minV: 0.08, maxV: 0.92 },
  to_projects: { minU: 0.12, maxU: 0.87, minV: 0.2, maxV: 0.8 },
  to_contact: { minU: 0.08, maxU: 0.92, minV: 0.12, maxV: 0.88 },
};

function isWithinInteractiveUv(
  intersection: THREE.Intersection<THREE.Object3D>,
  materialName: SignMaterialName,
) {
  const uv = intersection.uv;
  if (!uv) return false;

  const { minU, maxU, minV, maxV } = SIGN_HIT_BOUNDS[materialName];
  return uv.x >= minU && uv.x <= maxU && uv.y >= minV && uv.y <= maxV;
}

function isFrontFacingIntersection(
  intersection: THREE.Intersection<THREE.Object3D>,
  camera: THREE.Camera,
  materialName: keyof typeof SIGN_FACE_DIRECTION,
) {
  if (!intersection.face) return false;

  const worldNormal = intersection.face.normal
    .clone()
    .transformDirection(intersection.object.matrixWorld)
    .normalize();
  const toCamera = camera.position.clone().sub(intersection.point).normalize();

  const dot = worldNormal.dot(toCamera);
  const direction = SIGN_FACE_DIRECTION[materialName];
  if (direction === 'either') return Math.abs(dot) > 0.05;
  return direction === 'front' ? dot > 0 : dot < 0;
}

function getFrontFacingMaterialName(
  intersections: THREE.Intersection<THREE.Object3D>[],
  materialNames: readonly SignMaterialName[],
  camera: THREE.Camera,
): string | null {
  const closestDistance = intersections[0]?.distance;
  if (typeof closestDistance !== 'number') return null;

  const hit = intersections.find((intersection) => {
    if (Math.abs(intersection.distance - closestDistance) > SURFACE_DISTANCE_EPSILON) return false;

    const materialName = getIntersectionMaterialName(intersection, materialNames);
    return materialName
      ? isFrontFacingIntersection(intersection, camera, materialName) &&
          isWithinInteractiveUv(intersection, materialName)
      : false;
  });

  return hit ? getIntersectionMaterialName(hit, materialNames) : null;
}

export default function SignalModel({ interactive }: { interactive: boolean }) {
  const group = useRef<THREE.Object3D | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const scroll = useRef(0);
  const scrollTarget = useRef(0);
  const shake = useRef(0);
  const shakeClock = useRef(0);
  const router = useRouter();
  const { camera: defaultCamera, gl, raycaster, set: stateSetCamera } = useThree();
  const { scene, animations } = useGLTF('/models/model.glb');
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animatedTexturesRef = useRef<AnimatedTexturesState | null>(null);
  const trafficLightsRef = useRef<TrafficLight[]>([]);

  const resetScroll = useCallback(() => {
    scroll.current = 0;
    scrollTarget.current = 0;
    shake.current = 0;
    shakeClock.current = 0;
    mixerRef.current?.setTime(0);
  }, []);

  usePointerScroll({ interactive, gl, scrollTarget, onReset: resetScroll });

  const prepared = useMemo(() => prepareSignalScene(scene), [scene]);
  const preparedScene = prepared.clone;
  const signMeshes = prepared.signMeshes;

  useEffect(() => {
    animatedTexturesRef.current = prepared.animatedTextures;
    trafficLightsRef.current = prepared.trafficLights;
  }, [prepared]);

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
      window.dispatchEvent(new CustomEvent(signalEvents.cursorEnter, { detail: { label, showArrow: true } }));
    } else {
      window.dispatchEvent(new CustomEvent(signalEvents.cursorLeave));
    }
  }, []);

  const getMaterialLabel = (materialName: string | null): string | null => {
    if (materialName === 'to_projects') return 'Projects';
    if (materialName === 'to_contact') return 'Contact';
    if (materialName === 'hiroto-profile') return 'About';
    return null;
  };

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
    const materialName = getFrontFacingMaterialName(
      event.intersections,
      ['hiroto-profile', 'to_projects', 'to_contact'],
      cameraRef.current ?? defaultCamera,
    );
    if (!materialName) return;
    if (materialName === 'hiroto-profile') router.push('/about');
    if (materialName === 'to_projects') router.push('/projects');
    if (materialName === 'to_contact') router.push('/contact');
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    if ((event.nativeEvent as PointerEvent).pointerType === 'touch') return;
    const materialName = getFrontFacingMaterialName(
      event.intersections,
      ['hiroto-profile', 'to_projects', 'to_contact'],
      cameraRef.current ?? defaultCamera,
    );
    if (!materialName) return;
    if (materialName === 'hiroto-profile') router.push('/about');
    if (materialName === 'to_projects') router.push('/projects');
    if (materialName === 'to_contact') router.push('/contact');
  };

  const handlePointerMissed = useCallback(() => {
    dispatchCursorLabel(null);
    window.dispatchEvent(new CustomEvent(signalEvents.resetCameraScroll));
  }, [dispatchCursorLabel]);

  useFrame((state, delta) => {
    if (interactive && isCanvasHovered.current) {
      const activeCamera = cameraRef.current ?? (state.camera as THREE.PerspectiveCamera);
      raycaster.setFromCamera(hoverPointer.current, activeCamera);
      const intersections = signMeshes.flatMap((mesh) => raycaster.intersectObject(mesh, false));
      intersections.sort((a, b) => a.distance - b.distance);
      const materialName = getFrontFacingMaterialName(
        intersections,
        ['hiroto-profile', 'to_projects', 'to_contact'],
        activeCamera,
      );
      dispatchCursorLabel(getMaterialLabel(materialName));
    }

    const animated = animatedTexturesRef.current;
    if (animated) {
      if (animated.contactSign?.ctx) {
        animated.contactTime += delta;
        drawContactTexture(
          animated.contactSign.ctx,
          animated.contactSign.canvas,
          animated.contactTime,
        );
        animated.contactSign.texture.needsUpdate = true;
      }
      if (animated.profileSign?.ctx) {
        animated.profileTime += delta;
        drawProfileTexture(
          animated.profileSign.ctx,
          animated.profileSign.canvas,
          animated.profileTime,
        );
        animated.profileSign.texture.needsUpdate = true;
      }
      const scrollWidth = animated.projectsSign?.scrollWidth ?? 0;
      if (animated.projectsSign?.ctx && scrollWidth > 0) {
        const step = Math.min(delta, 1 / 30);
        animated.projectsOffset = (animated.projectsOffset + 100 * step) % scrollWidth;
        animated.projectsSign.scrollWidth = drawProjectsTexture(
          animated.projectsSign.ctx,
          animated.projectsSign.canvas,
          animated.projectsOffset,
        );
        animated.projectsSign.texture.needsUpdate = true;
      }
    }

    const trafficLights = trafficLightsRef.current;
    if (trafficLights.length) {
      const cycle = 3.6;
      const lightTime = state.clock.elapsedTime % cycle;
      const activeIndex = Math.floor((lightTime / cycle) * trafficLights.length);
      const pulse =
        0.74 +
        0.26 *
          Math.sin(
            ((lightTime % (cycle / trafficLights.length)) / (cycle / trafficLights.length)) *
              Math.PI,
          );
      trafficLights.forEach((light, index) => {
        const active = index === activeIndex ? 1 : 0;
        light.material.color.copy(light.idleColor).lerp(light.activeColor, active);
        light.material.emissive.copy(light.idleColor).lerp(light.activeColor, active);
        light.material.emissiveIntensity = index === activeIndex ? 2.8 * pulse : 0.05;
      });
    }

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
    if (typeof window === 'undefined') return undefined;
    const cameraObject = preparedScene.getObjectByName('Camera');
    if (!(cameraObject as THREE.PerspectiveCamera | undefined)?.isPerspectiveCamera)
      return undefined;
    const camera = cameraObject as THREE.PerspectiveCamera;
    const baseFov = camera.userData.baseFov ?? camera.fov;
    camera.userData.baseFov = baseFov;
    const apply = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = window.matchMedia('(max-width: 620px)').matches
        ? Math.min(baseFov + 3, 72)
        : baseFov;
      camera.updateProjectionMatrix();
    };
    cameraRef.current = camera;
    stateSetCamera({ camera });
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      stateSetCamera({ camera: defaultCamera });
    };
  }, [defaultCamera, preparedScene, stateSetCamera]);

  useEffect(() => {
    const element = gl.domElement;

    const updateHoverPointer = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      hoverPointer.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
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
