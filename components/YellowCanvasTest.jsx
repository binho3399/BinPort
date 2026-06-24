'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  drawProfileTexture,
  getProfileTextFrame,
  PROFILE_CYCLE_DURATION,
} from './profileSignCanvas';

export default function YellowCanvasTest() {
  const fullCanvasRef = useRef(null);
  const signCanvasRef = useRef(null);
  const rafRef = useRef(0);
  const startedAtRef = useRef(0);
  const timeRef = useRef(0);
  const runningRef = useRef(true);
  const [running, setRunning] = useState(true);
  const [frame, setFrame] = useState(() => getProfileTextFrame(0));

  const config = useMemo(
    () => ({
      width: 1024,
      height: 1024,
    }),
    [],
  );

  useEffect(() => {
    const canvases = [fullCanvasRef.current, signCanvasRef.current].filter(Boolean);
    const contexts = canvases
      .map((canvas) => ({ canvas, ctx: canvas.getContext('2d') }))
      .filter((item) => item.ctx);
    if (!contexts.length) return undefined;

    const render = (now) => {
      if (!startedAtRef.current) startedAtRef.current = now - timeRef.current * 1000;
      if (runningRef.current) timeRef.current = (now - startedAtRef.current) / 1000;
      let nextFrame = getProfileTextFrame(timeRef.current);
      contexts.forEach(({ canvas, ctx }) => {
        nextFrame = drawProfileTexture(ctx, canvas, timeRef.current);
      });
      setFrame(nextFrame);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const toggle = () => {
    setRunning((value) => {
      runningRef.current = !value;
      if (!value) startedAtRef.current = performance.now() - timeRef.current * 1000;
      return !value;
    });
  };

  const reset = () => {
    startedAtRef.current = 0;
    timeRef.current = 0;
    setFrame(getProfileTextFrame(0));
    setRunning(true);
  };

  return (
    <main className="yellow-canvas-test">
      <section className="yellow-canvas-test__panel">
        <div className="yellow-canvas-test__toolbar">
          <button type="button" onClick={toggle}>
            {running ? 'Pause' : 'Resume'}
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
          <span>
            {frame.currentText} -&gt; {frame.nextText}
          </span>
          <span>{frame.progress.toFixed(3)}</span>
          <span>
            {Math.floor(frame.time % PROFILE_CYCLE_DURATION)
              .toString()
              .padStart(2, '0')}
            s
          </span>
        </div>
        <div className="yellow-canvas-test__preview yellow-canvas-test__preview--full">
          <canvas
            ref={fullCanvasRef}
            width={config.width}
            height={config.height}
            aria-label="Yellow canvas preview"
          />
        </div>
        <div className="yellow-canvas-test__preview yellow-canvas-test__preview--sign">
          <canvas
            ref={signCanvasRef}
            width={config.width}
            height={config.height}
            aria-hidden="true"
          />
        </div>
      </section>
    </main>
  );
}
