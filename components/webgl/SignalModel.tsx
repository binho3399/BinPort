'use client';

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { prepareSignalScene } from './prepareScene';
import { drawContactTexture, drawProjectsTexture } from './textures';
import type { AnimatedTexturesState, TrafficLight } from './types';
import { usePointerScroll } from './usePointerScroll';

function getObjectMaterialName(object: THREE.Object3D) {
  const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  if (!mesh.isMesh || Array.isArray(mesh.material)) return null;
  return mesh.material.name;
}

export default function SignalModel({ interactive }: { interactive: boolean }) {
  const group = useRef<THREE.Object3D | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const scroll = useRef(0);
  const scrollTarget = useRef(0);
  const shake = useRef(0);
  const shakeClock = useRef(0);
  const router = useRouter();
  const { camera: defaultCamera, gl, set: stateSetCamera } = useThree();
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

  const handlePointerLabel = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    const materialName = getObjectMaterialName(event.object);
    const label =
      materialName === 'to_projects'
        ? 'Projects'
        : materialName === 'to_contact'
          ? 'Contact'
          : null;
    if (label) document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    const materialName = getObjectMaterialName(event.object);
    if (materialName === 'to_projects') router.push('/projects');
    if (materialName === 'to_contact') router.push('/contact');
  };

  useFrame((state, delta) => {
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

  return (
    <primitive
      ref={group}
      object={preparedScene}
      onClick={handleClick}
      onPointerMove={handlePointerLabel}
      onPointerOut={handlePointerOut}
    />
  );
}

useGLTF.preload('/models/model.glb');
