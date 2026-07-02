'use client';

import { useEffect } from 'react';
import type * as THREE from 'three';

type UseCanvasHoverPointerOptions = {
  element: HTMLElement;
  hoverPointer: React.MutableRefObject<THREE.Vector2>;
  hoverPointerDirty: React.MutableRefObject<boolean>;
  isCanvasHovered: React.MutableRefObject<boolean>;
  dispatchCursorLabel: (label: string | null) => void;
};

export function useCanvasHoverPointer({
  element,
  hoverPointer,
  hoverPointerDirty,
  isCanvasHovered,
  dispatchCursorLabel,
}: UseCanvasHoverPointerOptions) {
  useEffect(() => {
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
  }, [dispatchCursorLabel, element, hoverPointer, hoverPointerDirty, isCanvasHovered]);
}
