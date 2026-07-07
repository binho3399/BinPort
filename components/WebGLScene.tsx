'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import SignalModel from './webgl/SignalModel';

const IDLE_RENDER_INTERVAL_MS = 1000 / 12;
const IDLE_RENDER_INTERVAL_MS_NON_INTERACTIVE = 1000 / 6;
const ACTIVE_RENDER_BURST_MS = 700;
const LOW_QUALITY_UPGRADE_DELAY_MS = 1800;

type WebGLSceneProps = {
  interactive: boolean;
};

function RenderScheduler({ interactive }: { interactive: boolean }) {
  const { gl, invalidate } = useThree();
  const glDomElement = gl.domElement;
  const activeUntil = useRef(0);
  const activeFrame = useRef<number | null>(null);
  const contextLost = useRef(false);

  useEffect(() => {
    const isVisible = () => document.visibilityState !== 'hidden';
    const invalidateIfVisible = () => {
      if (contextLost.current) return;
      if (isVisible()) invalidate();
    };
    const renderActiveFrame = () => {
      activeFrame.current = null;
      if (!isVisible()) return;
      if (contextLost.current) return;

      invalidate();
      if (performance.now() < activeUntil.current) {
        activeFrame.current = window.requestAnimationFrame(renderActiveFrame);
      }
    };
    const requestActiveRender = () => {
      activeUntil.current = performance.now() + ACTIVE_RENDER_BURST_MS;
      if (activeFrame.current === null) {
        activeFrame.current = window.requestAnimationFrame(renderActiveFrame);
      }
      invalidateIfVisible();
    };
    const handleVisibilityChange = () => {
      if (isVisible()) requestActiveRender();
    };

    const canvas = glDomElement;
    const interactiveEvents = [
      'wheel',
      'pointerenter',
      'pointermove',
      'pointerdown',
      'pointerup',
      'touchstart',
      'touchmove',
      'touchend',
    ];

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost.current = true;
      if (activeFrame.current !== null) {
        window.cancelAnimationFrame(activeFrame.current);
        activeFrame.current = null;
      }
      console.warn('[WebGLScene] context lost', { interactive, dpr: gl.getPixelRatio() });
    };
    const onContextRestored = () => {
      contextLost.current = false;
      requestActiveRender();
      console.info('[WebGLScene] context restored', { interactive });
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    const idleInterval = window.setInterval(
      invalidateIfVisible,
      interactive ? IDLE_RENDER_INTERVAL_MS : IDLE_RENDER_INTERVAL_MS_NON_INTERACTIVE,
    );
    window.addEventListener('resize', requestActiveRender);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (interactive) {
      interactiveEvents.forEach((eventName) => {
        canvas.addEventListener(eventName, requestActiveRender, { passive: true });
      });
    }

    requestActiveRender();

    return () => {
      window.clearInterval(idleInterval);
      if (activeFrame.current !== null) window.cancelAnimationFrame(activeFrame.current);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('resize', requestActiveRender);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interactive) {
        interactiveEvents.forEach((eventName) => {
          canvas.removeEventListener(eventName, requestActiveRender);
        });
      }
    };
  }, [gl, glDomElement, interactive, invalidate]);

  return null;
}

function useViewportCategory() {
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 620px)');
    const update = () => setIsNarrowViewport(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isNarrowViewport;
}

function useAdaptiveAutoUpgradeAllowed() {
  const [allowed] = useState(() => {
    const cores = navigator.hardwareConcurrency ?? 0;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;
    const weakDevice = (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);
    return !weakDevice;
  });

  return allowed;
}

function ProgressiveQualityGate({ onUpgrade }: { onUpgrade: () => void }) {
  const allowAutomaticUpgrade = useAdaptiveAutoUpgradeAllowed();
  useEffect(() => {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      onUpgrade();
    };
    const idleId = allowAutomaticUpgrade ? window.setTimeout(finish, LOW_QUALITY_UPGRADE_DELAY_MS) : null;
    const onInteraction = () => finish();
    const events = ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'keydown'];
    events.forEach((eventName) => window.addEventListener(eventName, onInteraction, { passive: true }));
    return () => {
      if (idleId) window.clearTimeout(idleId);
      events.forEach((eventName) => window.removeEventListener(eventName, onInteraction));
    };
  }, [allowAutomaticUpgrade, onUpgrade]);
  return null;
}

export default function WebGLScene({ interactive }: WebGLSceneProps) {
  const [highQuality, setHighQuality] = useState(false);
  const isMobile = useViewportCategory();
  const shadowMapSize = highQuality ? (isMobile ? 1024 : 2048) : isMobile ? 512 : 768;
  const ambientIntensity = highQuality ? 0.1 : 0.18;
  const hemisphereIntensity = highQuality ? 1.38 : 1.58;
  const directionalIntensity = highQuality ? 1.28 : 1.42;
  return (
    <div className="webgl-canvas-wrap">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={highQuality ? [1, 2] : [0.75, 1]}
        frameloop="demand"
        camera={{ position: [0.02, 0.12, 4.18], fov: 30 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.56;
        }}
      >
        <ProgressiveQualityGate onUpgrade={() => setHighQuality(true)} />
        <RenderScheduler interactive={interactive} />
        <ambientLight intensity={ambientIntensity} />
        <hemisphereLight color="#fffdf8" groundColor="#d8d0c7" intensity={hemisphereIntensity} />
        <directionalLight
          castShadow
          color="#fff7ed"
          position={[4.8, 6.2, 4.2]}
          intensity={directionalIntensity}
          shadow-bias={-0.00012}
          shadow-mapSize-height={shadowMapSize}
          shadow-mapSize-width={shadowMapSize}
        />
        <Suspense fallback={null}>
          <SignalModel interactive={interactive} highQuality={highQuality} />
        </Suspense>
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={highQuality ? 0.58 : 0.42} />
        </Suspense>
      </Canvas>
    </div>
  );
}
