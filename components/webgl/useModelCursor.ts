'use client';

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { emitInteractionEvent } from '../../lib/interactions';

export function useModelCursor() {
  const activeLabel = useRef<string | null>(null);

  const dispatchCursorLabel = useCallback((label: string | null) => {
    if (activeLabel.current === label) return;
    activeLabel.current = label;
    document.body.style.cursor = label ? 'pointer' : '';
    if (label) {
      emitInteractionEvent(window, 'cursorEnter', { label, showArrow: true });
    } else {
      emitInteractionEvent(window, 'cursorLeave');
    }
  }, []);

  const hoverPointer = useRef(new THREE.Vector2());

  return { dispatchCursorLabel, hoverPointer };
}
