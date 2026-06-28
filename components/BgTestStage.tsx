'use client';

import { useEffect, useRef, useState } from 'react';

const DESKTOP_SQUARE_SIZE = 160;
const MOBILE_MAX_SQUARE_SIZE = 120;
const MOBILE_MIN_SQUARE_SIZE = 72;
const MOBILE_SQUARE_VIEWPORT_RATIO = 0.22;
const GRID_GAP = 0.5;
const MOBILE_BREAKPOINT = 560;

function getSquareSize(width: number) {
  if (width > MOBILE_BREAKPOINT) return DESKTOP_SQUARE_SIZE;

  return Math.min(
    MOBILE_MAX_SQUARE_SIZE,
    Math.max(MOBILE_MIN_SQUARE_SIZE, width * MOBILE_SQUARE_VIEWPORT_RATIO),
  );
}

function getSquareCount(width: number, height: number) {
  const squareSize = getSquareSize(width);
  const trackSize = squareSize + GRID_GAP;
  const columns = Math.max(Math.floor((width + GRID_GAP) / trackSize), 1);
  const rows = Math.ceil((height + GRID_GAP) / trackSize) + 1;

  return Math.max(columns * rows, 1);
}

export default function BgTestStage() {
  const stageRef = useRef<HTMLElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const [squareCount, setSquareCount] = useState(24);

  useEffect(() => {
    const stage = stageRef.current;
    const circle = circleRef.current;
    if (!stage || !circle) return;

    const moveCircle = (x: number, y: number) => {
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      moveCircle(event.clientX - rect.left, event.clientY - rect.top);
    };

    const handlePointerLeave = () => {
      moveCircle(stage.clientWidth / 2, stage.clientHeight / 2 + 76);
    };

    handlePointerLeave();
    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handlePointerLeave);

    return () => {
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSquareCount = () => {
      setSquareCount(getSquareCount(stage.clientWidth, stage.clientHeight));
    };

    const resizeObserver = new ResizeObserver(updateSquareCount);

    updateSquareCount();
    resizeObserver.observe(stage);

    return () => resizeObserver.disconnect();
  }, []);

  const glassSquares = Array.from({ length: squareCount }, (_, index) => index);

  return (
    <main ref={stageRef} className="bg-test" aria-label="Liquid glass background test">
      <div ref={circleRef} className="bg-test__circle" aria-hidden="true" />
      <div className="bg-test__grid" aria-hidden="true">
        {glassSquares.map((square) => (
          <div key={square} className="bg-test__glass" />
        ))}
      </div>
    </main>
  );
}
