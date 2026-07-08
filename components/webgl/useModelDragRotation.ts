'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type RotationOffset = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  hasDragged: boolean;
};

type UseModelDragRotationOptions = {
  element: HTMLCanvasElement;
  interactive: boolean;
  invalidate: () => void;
};

const DRAG_THRESHOLD = 6;
const DRAG_YAW_SENSITIVITY = 0.0022;
const WHEEL_YAW_SENSITIVITY = 0.00042;
const SETTLE_SPEED = 0.09;
const RETURN_SPEED = 0.035;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useModelDragRotation({
  element,
  interactive,
  invalidate,
}: UseModelDragRotationOptions): {
  rotationOffsetRef: MutableRefObject<RotationOffset>;
  shouldSuppressNavigation: () => boolean;
} {
  const rotationOffsetRef = useRef<RotationOffset>({ x: 0, y: 0 });
  const targetOffsetRef = useRef<RotationOffset>({ x: 0, y: 0 });
  const dragStateRef = useRef<DragState | null>(null);
  const suppressNavigationRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        targetOffsetRef.current = { x: 0, y: 0 };
        rotationOffsetRef.current = { x: 0, y: 0 };
        dragStateRef.current = null;
        suppressNavigationRef.current = false;
        invalidate();
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMotionPreferenceChange);
      return () => mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    }

    mediaQuery.addListener(handleMotionPreferenceChange);
    return () => mediaQuery.removeListener(handleMotionPreferenceChange);
  }, [invalidate]);

  useEffect(() => {
    if (!interactive || reducedMotionRef.current) {
      dragStateRef.current = null;
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!interactive || reducedMotionRef.current || !event.isPrimary || event.button > 0) return;

      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        hasDragged: false,
      };

      if (element.setPointerCapture) {
        try {
          element.setPointerCapture(event.pointerId);
        } catch {
          // The pointer can already be released on very fast taps; safe to ignore.
        }
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const totalDistance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      const dx = event.clientX - drag.lastX;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      if (!drag.hasDragged && totalDistance < DRAG_THRESHOLD) return;

      drag.hasDragged = true;
      suppressNavigationRef.current = true;
      targetOffsetRef.current.y += dx * DRAG_YAW_SENSITIVITY;
      event.preventDefault();
      invalidate();
    };

    const finishPointer = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.hasDragged) suppressNavigationRef.current = true;
      dragStateRef.current = null;

      if (element.releasePointerCapture) {
        try {
          element.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore browsers that release capture automatically.
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!interactive || reducedMotionRef.current) return;

      targetOffsetRef.current.y += event.deltaY * WHEEL_YAW_SENSITIVITY + event.deltaX * WHEEL_YAW_SENSITIVITY * 0.7;
      event.preventDefault();
      invalidate();
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove, { passive: false });
    element.addEventListener('pointerup', finishPointer);
    element.addEventListener('pointercancel', finishPointer);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', finishPointer);
      element.removeEventListener('pointercancel', finishPointer);
      element.removeEventListener('wheel', handleWheel);
      dragStateRef.current = null;
    };
  }, [element, interactive, invalidate]);

  useFrame(() => {
    const target = targetOffsetRef.current;
    const current = rotationOffsetRef.current;

    if (!interactive || reducedMotionRef.current) {
      target.x = THREE.MathUtils.lerp(target.x, 0, RETURN_SPEED * 2);
      target.y = THREE.MathUtils.lerp(target.y, 0, RETURN_SPEED * 2);
    } else if (!dragStateRef.current) {
      target.x = THREE.MathUtils.lerp(target.x, 0, RETURN_SPEED);
    }

    current.x = THREE.MathUtils.lerp(current.x, target.x, SETTLE_SPEED);
    current.y = THREE.MathUtils.lerp(current.y, target.y, SETTLE_SPEED);

    const isMoving = Math.abs(current.x) > 0.0002 || Math.abs(current.y) > 0.0002 || Math.abs(target.x) > 0.0002 || Math.abs(target.y) > 0.0002;
    if (isMoving) invalidate();
  });

  return {
    rotationOffsetRef,
    shouldSuppressNavigation: () => {
      if (!suppressNavigationRef.current) return false;
      suppressNavigationRef.current = false;
      return true;
    },
  };
}
