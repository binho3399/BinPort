'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { emitInteractionEvent, offInteractionEvent, onInteractionEvent } from '../../lib/interactions';

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

  useEffect(() => {
    const resetActiveLabel = () => {
      activeLabel.current = null;
      document.body.style.cursor = '';
    };

    onInteractionEvent(window, 'cursorReset', resetActiveLabel);
    return () => {
      offInteractionEvent(window, 'cursorReset', resetActiveLabel);
      if (activeLabel.current !== null) emitInteractionEvent(window, 'cursorLeave');
      resetActiveLabel();
    };
  }, []);

  const hoverPointer = useRef(new THREE.Vector2());

  return { dispatchCursorLabel, hoverPointer };
}
