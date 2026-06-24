import { useEffect } from 'react';

export function usePointerScroll({ interactive, gl, scrollTarget, onReset }) {
  useEffect(() => {
    if (!interactive) return undefined;
    const addDelta = (delta, strength = 1) => {
      const viewportFactor = Math.max(window.innerHeight * 3, 1);
      scrollTarget.current += (delta / viewportFactor) * strength;
    };
    let touchPoint = null;
    const onWheel = (event) => {
      const mode = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta =
        (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * mode;
      event.preventDefault();
      addDelta(delta);
    };
    const touchStart = (event) => {
      const touch = event.touches[0];
      touchPoint = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const touchMove = (event) => {
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
    window.addEventListener('signal-pole:reset-camera-scroll', reset);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', reset);
      element.removeEventListener('touchcancel', reset);
      window.removeEventListener('signal-pole:reset-camera-scroll', reset);
    };
  }, [gl, interactive, scrollTarget, onReset]);
}
