'use client';

import { useEffect } from 'react';
import type * as THREE from 'three';

type UseCanvasHoverPointerOptions = {
  element: HTMLElement;
  hoverPointer: React.MutableRefObject<THREE.Vector2>;
  hoverPointerDirty: React.MutableRefObject<boolean>;
  isCanvasHovered: React.MutableRefObject<boolean>;
  dispatchCursorLabel: (label: string | null) => void;
  invalidate: () => void;
};

export function useCanvasHoverPointer({
  element,
  hoverPointer,
  hoverPointerDirty,
  isCanvasHovered,
  dispatchCursorLabel,
  invalidate,
}: UseCanvasHoverPointerOptions) {
  useEffect(() => {
    let bounds: DOMRect | null = null;
    let lastPointer: { clientX: number; clientY: number } | null = null;

    const refreshBounds = () => {
      bounds = element.getBoundingClientRect();
    };

    const updateHoverPointer = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
      if (!bounds) refreshBounds();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return;

      hoverPointer.current.set(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      hoverPointerDirty.current = true;
      invalidate();
    };

    const clearHoverState = () => {
      isCanvasHovered.current = false;
      hoverPointerDirty.current = false;
      lastPointer = null;
      bounds = null;
      dispatchCursorLabel(null);
    };

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      isCanvasHovered.current = true;
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      refreshBounds();
      updateHoverPointer(lastPointer);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (!bounds) refreshBounds();
      if (
        !bounds ||
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        clearHoverState();
        return;
      }

      isCanvasHovered.current = true;
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      updateHoverPointer(lastPointer);
    };

    const handlePointerLeave = () => clearHoverState();

    const handleResize = () => {
      if (!isCanvasHovered.current) {
        bounds = null;
        return;
      }
      refreshBounds();
      if (lastPointer) updateHoverPointer(lastPointer);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) clearHoverState();
    };

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('pointercancel', handlePointerLeave);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearHoverState();
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('pointercancel', handlePointerLeave);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatchCursorLabel, element, hoverPointer, hoverPointerDirty, invalidate, isCanvasHovered]);
}
