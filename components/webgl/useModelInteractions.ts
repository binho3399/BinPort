'use client';

import { useCallback, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getInteractiveCanvasHit, SIGN_MATERIAL_NAMES } from './hitTest';
import type { InteractiveSignSurface } from './types';

type UseModelInteractionsOptions = {
  interactive: boolean;
  navigateToMaterial: (materialName: string) => void;
  dispatchCursorLabel: (label: string | null) => void;
  raycaster: THREE.Raycaster;
  raycastTargets: readonly THREE.Object3D[];
  signSurfaces: readonly InteractiveSignSurface[];
};

export function useModelInteractions({
  interactive,
  navigateToMaterial,
  dispatchCursorLabel,
  raycaster,
  raycastTargets,
  signSurfaces,
}: UseModelInteractionsOptions) {
  const touchStart = useRef<{ id: number; x: number; y: number } | null>(null);

  const getInteractiveMaterialNameFromRay = useCallback(
    (ray: THREE.Ray) => {
      raycaster.ray.copy(ray);
      const intersections = raycaster.intersectObjects([...raycastTargets], true);
      intersections.sort((a, b) => a.distance - b.distance);
      return getInteractiveCanvasHit(intersections, SIGN_MATERIAL_NAMES, signSurfaces, raycaster.ray)
        ?.materialName;
    },
    [raycastTargets, raycaster, signSurfaces],
  );

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!interactive) return;
      if (event.nativeEvent.pointerType !== 'touch') return;
      touchStart.current = {
        id: event.nativeEvent.pointerId,
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      };
    },
    [interactive],
  );

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
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
    },
    [getInteractiveMaterialNameFromRay, interactive, navigateToMaterial],
  );

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!interactive) return;
      if ((event.nativeEvent as PointerEvent).pointerType === 'touch') return;
      const materialName = getInteractiveMaterialNameFromRay(event.ray);
      if (!materialName) return;
      navigateToMaterial(materialName);
    },
    [getInteractiveMaterialNameFromRay, interactive, navigateToMaterial],
  );

  const handlePointerMissed = useCallback(() => {
    dispatchCursorLabel(null);
  }, [dispatchCursorLabel]);

  return { handlePointerDown, handlePointerUp, handleClick, handlePointerMissed };
}
