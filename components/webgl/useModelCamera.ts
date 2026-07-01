'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function isPerspectiveCamera(
  object: THREE.Object3D | null | undefined,
): object is THREE.PerspectiveCamera {
  return !!object && (object as THREE.PerspectiveCamera).isPerspectiveCamera === true;
}

export function useModelCamera(preparedScene: THREE.Object3D) {
  const { camera: defaultCamera, set: stateSetCamera } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const cameraObject = preparedScene.getObjectByName('Camera');
    if (!isPerspectiveCamera(cameraObject)) return undefined;
    const camera = cameraObject;
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

  return cameraRef;
}
