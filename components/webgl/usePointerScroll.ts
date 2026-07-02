import { useEffect } from 'react';
import type { RefObject } from 'react';
import type * as THREE from 'three';
import { onInteractionEvent, offInteractionEvent } from '../../lib/interactions';

type TouchPoint = { x: number; y: number };

type UsePointerScrollOptions = {
  interactive: boolean;
  gl: THREE.WebGLRenderer;
  scrollTarget: RefObject<number>;
  onReset: () => void;
};

export function usePointerScroll({
  interactive,
  gl,
  scrollTarget,
  onReset,
}: UsePointerScrollOptions) {
  useEffect(() => {
    if (!interactive) return undefined;
    const addDelta = (delta: number, strength = 1) => {
      const viewportFactor = Math.max(window.innerHeight * 3, 1);
      scrollTarget.current += (delta / viewportFactor) * strength;
    };
    let touchPoint: TouchPoint | null = null;
    let dragPoint: TouchPoint | null = null;
    const onWheel = (event: WheelEvent) => {
      const mode = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta =
        (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * mode;
      event.preventDefault();
      addDelta(delta);
    };
    const touchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchPoint = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const touchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      const next = touch ? { x: touch.clientX, y: touch.clientY } : null;
      const prev = touchPoint;
      if (!next || !prev) {
        touchPoint = next;
        return;
      }
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      event.preventDefault();
      addDelta(delta, 1.9);
      touchPoint = next;
    };
    const touchEnd = () => {
      touchPoint = null;
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      dragPoint = { x: event.clientX, y: event.clientY };
      element.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragPoint || event.pointerType === 'touch') return;
      const dx = event.clientX - dragPoint.x;
      const dy = event.clientY - dragPoint.y;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      addDelta(delta, 1.4);
      dragPoint = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      dragPoint = null;
      element.releasePointerCapture(event.pointerId);
    };
    const reset = () => {
      touchPoint = null;
      dragPoint = null;
      onReset();
    };
    const element = gl.domElement;
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd);
    element.addEventListener('touchcancel', touchEnd);
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove);
    element.addEventListener('pointerup', pointerUp);
    onInteractionEvent(window, 'resetCameraScroll', reset);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
      element.removeEventListener('touchcancel', touchEnd);
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerUp);
      offInteractionEvent(window, 'resetCameraScroll', reset);
    };
  }, [gl, interactive, scrollTarget, onReset]);
}
