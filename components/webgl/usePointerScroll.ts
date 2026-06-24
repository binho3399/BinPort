import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import type * as THREE from 'three';
import { signalEvents } from '../../lib/events';

type TouchPoint = { x: number; y: number };

type UsePointerScrollOptions = {
  interactive: boolean;
  gl: THREE.WebGLRenderer;
  scrollTarget: MutableRefObject<number>;
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
      const dx = prev.x - next.x;
      const dy = prev.y - next.y;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      event.preventDefault();
      addDelta(delta, 1.9);
      touchPoint = next;
    };
    const reset = () => {
      touchPoint = null;
      onReset();
    };
    const element = gl.domElement;
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', reset);
    element.addEventListener('touchcancel', reset);
    window.addEventListener(signalEvents.resetCameraScroll, reset);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', reset);
      element.removeEventListener('touchcancel', reset);
      window.removeEventListener(signalEvents.resetCameraScroll, reset);
    };
  }, [gl, interactive, scrollTarget, onReset]);
}
