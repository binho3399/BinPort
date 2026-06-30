'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { EffectComposer, SMAA } from '@react-three/postprocessing';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import SignalModel from './webgl/SignalModel';
import SkyBackground from './SkyBackground';

const IDLE_RENDER_INTERVAL_MS = 1000 / 24;
const IDLE_RENDER_INTERVAL_MS_NON_INTERACTIVE = 1000 / 12;
const ACTIVE_RENDER_BURST_MS = 700;

type WebGLSceneProps = {
  interactive: boolean;
};

function RenderScheduler({ interactive }: { interactive: boolean }) {
  const { gl, invalidate } = useThree();
  const activeUntil = useRef(0);
  const activeFrame = useRef<number | null>(null);

  useEffect(() => {
    const isVisible = () => document.visibilityState !== 'hidden';
    const invalidateIfVisible = () => {
      if (isVisible()) invalidate();
    };
    const renderActiveFrame = () => {
      activeFrame.current = null;
      if (!isVisible()) return;

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

    const canvas = gl.domElement;
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

    const idleInterval = window.setInterval(invalidateIfVisible, interactive ? IDLE_RENDER_INTERVAL_MS : IDLE_RENDER_INTERVAL_MS_NON_INTERACTIVE);
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
      window.removeEventListener('resize', requestActiveRender);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interactive) {
        interactiveEvents.forEach((eventName) => {
          canvas.removeEventListener(eventName, requestActiveRender);
        });
      }
    };
  }, [gl.domElement, interactive, invalidate]);

  return null;
}

export default function WebGLScene({ interactive }: WebGLSceneProps) {
  const shadowMapSize = 2048;
  return (
    <div className="webgl-background" aria-hidden="true">
      <div className="sky-layer">
        <SkyBackground />
      </div>
      <div className="webgl-canvas-wrap">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          frameloop="demand"
          camera={{ position: [0.02, 0.12, 4.18], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 2.04;
          }}
        >
          <RenderScheduler interactive={interactive} />
          <ambientLight intensity={0.18} />
          <hemisphereLight color="#ffffff" groundColor="#ddd8cf" intensity={2.15} />
          <directionalLight
            castShadow
            color="#fff7ed"
            position={[4.8, 6.2, 4.2]}
            intensity={1.1}
            shadow-bias={-0.00012}
            shadow-mapSize-height={shadowMapSize}
            shadow-mapSize-width={shadowMapSize}
          />
          <Suspense fallback={null}>
            <SignalModel interactive={interactive} />
            <Environment preset="city" environmentIntensity={0.42} />
            <EffectComposer depthBuffer multisampling={8} resolutionScale={1}>
              <SMAA />
            </EffectComposer>
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
