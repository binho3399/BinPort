'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import SignalModel from './webgl/SignalModel';

export default function WebGLScene({ interactive }) {
  return (
    <div className="webgl-background" aria-hidden="true">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [0.02, 0.12, 4.18], fov: 30 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 2.04;
        }}
      >
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.18} />
        <hemisphereLight color="#ffffff" groundColor="#ddd8cf" intensity={2.15} />
        <directionalLight
          castShadow
          color="#fff7ed"
          position={[4.8, 6.2, 4.2]}
          intensity={1.1}
          shadow-bias={-0.00012}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <Suspense fallback={null}>
          <SignalModel interactive={interactive} />
          <Environment preset="city" environmentIntensity={0.42} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
