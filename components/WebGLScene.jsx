'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Preload, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { scrambleText } from './profileSignCanvas';

const CONTACT_LABELS = ['コンタクト', 'CONTACT'];
const PROJECTS_TEXT = 'PROJECTS ARCHIVE / PROJECTS ARCHIVE / PROJECTS ARCHIVE / ';

function drawSignTexture(ctx, { width, height, background, color, text, font, rotate, tracking }) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rotate);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (tracking) {
    const chars = [...text];
    const widths = chars.map((char) => ctx.measureText(char).width);
    const total = widths.reduce((sum, item) => sum + item, 0) + tracking * (chars.length - 1);
    let x = -total / 2;
    chars.forEach((char, index) => {
      ctx.fillText(char, x + widths[index] / 2, 0);
      x += widths[index] + tracking;
    });
  } else {
    ctx.fillText(text, 0, 0, width * 0.9);
  }
  ctx.restore();
}

function makeAnimatedCanvasTexture(width = 1024, height = 1024) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { canvas, ctx, texture };
}

function drawTrackedText(ctx, text, { x, y, font, color, align = 'center', letterSpacing = 0, maxWidth = Infinity }) {
  ctx.save();
  ctx.font = font;
  const width = Array.from(text).reduce((sum, char, index) => sum + ctx.measureText(char).width + (index === text.length - 1 ? 0 : letterSpacing), 0);
  const scaleX = Number.isFinite(maxWidth) ? Math.min(1, maxWidth / Math.max(width, 1)) : 1;
  let cursor = align === 'center' ? -width / 2 : align === 'right' ? -width : 0;
  ctx.translate(x, y);
  ctx.scale(scaleX, 1);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  Array.from(text).forEach((char) => {
    ctx.fillText(char, cursor, 0);
    cursor += ctx.measureText(char).width + letterSpacing;
  });
  ctx.restore();
}

function drawContactTexture(ctx, canvas, time) {
  const step = Math.floor(time / 3.65);
  const progress = Math.min((time % 3.65) / 1.25, 1);
  const currentText = CONTACT_LABELS[step % CONTACT_LABELS.length];
  const nextText = CONTACT_LABELS[(step + 1) % CONTACT_LABELS.length];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTrackedText(ctx, scrambleText(currentText, nextText, progress, 53 * step + 21), {
    x: canvas.width / 2,
    y: 360,
    font: '700 172px/1 helvetica-neue-lt-pro, sans-serif',
    color: '#0047bd',
  });
  ctx.fillStyle = '#0047bd';
  for (let x = -560 - (118 * time) % 560; x < 1584; x += 560) {
    ctx.beginPath();
    ctx.moveTo(x, 664);
    ctx.lineTo(x + 160, 552);
    ctx.lineTo(x + 160, 628);
    ctx.lineTo(x + 530, 628);
    ctx.lineTo(x + 530, 700);
    ctx.lineTo(x + 160, 700);
    ctx.lineTo(x + 160, 776);
    ctx.closePath();
    ctx.fill();
  }
}

function drawProjectsTexture(ctx, canvas, offset) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#133afd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '400 72px/1 helvetica-neue-lt-pro, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f7f5ef';
  const width = Math.max(ctx.measureText(PROJECTS_TEXT).width, 1);
  for (let x = -offset; x < canvas.width + width; x += width) {
    ctx.fillText(PROJECTS_TEXT, x, canvas.height / 2);
  }
  return width;
}

function makeSignTexture({ width = 1024, height = 256, background, color = '#11110f', text, font = '800 92px Arial Narrow, Arial, sans-serif', rotate = 0, tracking = 0 }) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const config = { width, height, background, color, text, font, rotate, tracking };
  drawSignTexture(ctx, config);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  if (document.fonts && font.includes('gazzetta-variable')) {
    Promise.race([
      document.fonts.load(font, text),
      new Promise((resolve) => window.setTimeout(resolve, 5000)),
    ]).then(() => document.fonts.ready).then(() => {
      drawSignTexture(ctx, config);
      texture.needsUpdate = true;
    }).catch(() => {});
  }

  return texture;
}

function makeVideoTexture(src) {
  if (typeof document === 'undefined') return null;
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.play().catch(() => {});

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function fitTextureToUv(texture, { minU, maxU, minV, maxV }, { flipX = false, flipY = false } = {}) {
  if (!texture) return texture;
  const repeatX = 1 / (maxU - minU);
  const repeatY = 1 / (maxV - minV);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(flipX ? -repeatX : repeatX, flipY ? -repeatY : repeatY);
  texture.offset.set(flipX ? 1 + minU * repeatX : -minU * repeatX, flipY ? 1 + minV * repeatY : -minV * repeatY);
  texture.needsUpdate = true;
  return texture;
}

function makeShowreelTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#c8f7fb');
  gradient.addColorStop(0.52, '#f7f0c4');
  gradient.addColorStop(1, '#587f65');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = 'rgba(255, 244, 177, 0.55)';
  ctx.fillRect(0, 615, 1024, 270);
  ctx.strokeStyle = '#9c463f';
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(120, 385);
  ctx.bezierCurveTo(350, 225, 620, 270, 880, 155);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function SignalModel({ interactive }) {
  const group = useRef(null);
  const cameraRef = useRef(null);
  const scroll = useRef(0);
  const scrollTarget = useRef(0);
  const touchPoint = useRef(null);
  const shake = useRef(0);
  const shakeClock = useRef(0);
  const router = useRouter();
  const { camera: defaultCamera, gl, set: stateSetCamera } = useThree();
  const { scene, animations } = useGLTF('/models/model.glb');
  const actionRef = useRef(null);
  const mixerRef = useRef(null);
  const animatedTexturesRef = useRef(null);
  const trafficLightsRef = useRef([]);

  useEffect(() => {
    if (!interactive) return undefined;
    const addDelta = (delta, strength = 1) => {
      const viewportFactor = Math.max(window.innerHeight * 3, 1);
      scrollTarget.current += (delta / viewportFactor) * strength;
    };
    const onWheel = (event) => {
      const mode = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * mode;
      event.preventDefault();
      addDelta(delta);
    };
    const touchStart = (event) => {
      const touch = event.touches[0];
      touchPoint.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const touchMove = (event) => {
      const touch = event.touches[0];
      const next = touch ? { x: touch.clientX, y: touch.clientY } : null;
      const prev = touchPoint.current;
      if (!next || !prev) {
        touchPoint.current = next;
        return;
      }
      const dx = prev.x - next.x;
      const dy = prev.y - next.y;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      event.preventDefault();
      addDelta(delta, 1.9);
      touchPoint.current = next;
    };
    const reset = () => {
      scroll.current = 0;
      scrollTarget.current = 0;
      touchPoint.current = null;
      shake.current = 0;
      shakeClock.current = 0;
      mixerRef.current?.setTime(0);
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
  }, [gl, interactive]);

  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);
    const projectsSign = makeAnimatedCanvasTexture();
    const contactSign = makeAnimatedCanvasTexture();
    const showreel = makeVideoTexture('/videos/hirotos_showreel.mp4') || makeShowreelTexture();
    const trafficLights = [];
    const objectsToRemove = [];

    if (projectsSign?.ctx) projectsSign.scrollWidth = drawProjectsTexture(projectsSign.ctx, projectsSign.canvas, 0);
    if (contactSign?.ctx) drawContactTexture(contactSign.ctx, contactSign.canvas, 0);

    clone.traverse((object) => {
      if ((object.name || '').toLowerCase().includes('text')) {
        objectsToRemove.push(object);
        return;
      }
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;

      if (Array.isArray(object.material)) {
        const profileMaterialIndexes = new Set(
          object.material.map((material, index) => (material?.name === 'hiroto-profile' ? index : -1)).filter((index) => index >= 0),
        );
        if (profileMaterialIndexes.size > 0) {
          const geometry = object.geometry.clone();
          geometry.clearGroups();
          object.geometry.groups.forEach((group) => {
            if (!profileMaterialIndexes.has(group.materialIndex)) {
              geometry.addGroup(group.start, group.count, group.materialIndex);
            }
          });
          object.geometry = geometry;
        }
      } else {
        if (object.material?.name === 'hiroto-profile') {
          objectsToRemove.push(object);
          return;
        }
      }

      const name = object.material?.name;
      if (name === 'to_projects') {
        object.material = object.material.clone();
        object.material.map = projectsSign?.texture || object.material.map;
        object.material.emissiveMap = projectsSign?.texture || object.material.emissiveMap;
        object.material.color.set('#ffffff');
        object.material.emissive.set('#ffffff');
        object.material.emissiveIntensity = 0.68;
        object.material.metalness = 0;
        object.material.roughness = 0.48;
        object.material.toneMapped = false;
        object.material.side = THREE.DoubleSide;
        object.material.needsUpdate = true;
        object.material.name = name;
      }
      if (name === 'to_contact') {
        object.material = object.material.clone();
        object.material.map = contactSign?.texture || object.material.map;
        object.material.emissiveMap = contactSign?.texture || object.material.emissiveMap;
        object.material.color.set('#ffffff');
        object.material.emissive.set('#ffffff');
        object.material.emissiveIntensity = 0.86;
        object.material.metalness = 0;
        object.material.roughness = 0.5;
        object.material.toneMapped = false;
        object.material.side = THREE.DoubleSide;
        object.material.needsUpdate = true;
        object.material.name = name;
      }
      if (name === 'hirotos_showreel') {
        object.material = object.material.clone();
        object.material.map = showreel;
        object.material.emissiveMap = showreel;
        object.material.color.set('#ffffff');
        object.material.emissive.set('#ffffff');
        object.material.emissiveIntensity = 0.56;
        object.material.roughness = 0.62;
        object.material.metalness = 0;
        object.material.toneMapped = false;
        object.material.side = THREE.DoubleSide;
        object.material.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      vec3 showreelColor = diffuseColor.rgb;
      float showreelLuma = dot(showreelColor, vec3(0.299, 0.587, 0.114));
      showreelColor = mix(vec3(showreelLuma), showreelColor, 1.04);
      showreelColor = (showreelColor - 0.5) * 1.16 + 0.5;
      diffuseColor.rgb = clamp(showreelColor, 0.0, 0.88);
    `);
        };
        object.material.customProgramCacheKey = () => 'showreel-1.16-1.04';
        object.material.needsUpdate = true;
        object.material.name = name;
      }
      if (['light1', 'light2', 'light3'].includes(name)) {
        object.material = object.material.clone();
        object.material.color.set('#050505');
        object.material.emissive.set('#050505');
        object.material.emissiveIntensity = 0.05;
        object.material.toneMapped = false;
        object.material.needsUpdate = true;
        trafficLights.push({
          material: object.material,
          idleColor: new THREE.Color('#050505'),
          activeColor: new THREE.Color(name === 'light1' ? '#ff2b1f' : name === 'light2' ? '#ffd21f' : '#12d7a8'),
        });
      }
    });
    objectsToRemove.forEach((object) => object.parent?.remove(object));
    animatedTexturesRef.current = { projectsSign, contactSign, projectsOffset: 0, contactTime: 0 };
    trafficLightsRef.current = trafficLights;
    return clone;
  }, [scene]);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(preparedScene);
    const clip = animations.find((item) => item.name === 'CameraAction');
    const action = clip ? mixer.clipAction(clip, preparedScene) : null;
    if (action) {
      action.enabled = true;
      action.reset().play();
    }
    mixerRef.current = mixer;
    actionRef.current = action;
    return () => {
      actionRef.current = null;
      mixerRef.current = null;
      mixer.stopAllAction();
      mixer.uncacheRoot(preparedScene);
    };
  }, [animations, preparedScene]);

  const handlePointerLabel = (event) => {
    if (!interactive) return;
    const materialName = event.object?.material?.name;
    const label = materialName === 'to_projects' ? 'Projects' : materialName === 'to_contact' ? 'Contact' : null;
    if (label) document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  const handleClick = (event) => {
    if (!interactive) return;
    const materialName = event.object?.material?.name;
    if (materialName === 'to_projects') router.push('/projects');
    if (materialName === 'to_contact') router.push('/contact');
  };

  useFrame((state, delta) => {
    const animated = animatedTexturesRef.current;
    if (animated) {
      if (animated.contactSign?.ctx) {
        animated.contactTime += delta;
        drawContactTexture(animated.contactSign.ctx, animated.contactSign.canvas, animated.contactTime);
        animated.contactSign.texture.needsUpdate = true;
      }
      if (animated.projectsSign?.ctx && animated.projectsSign.scrollWidth > 0) {
        const step = Math.min(delta, 1 / 30);
        animated.projectsOffset = (animated.projectsOffset + 100 * step) % animated.projectsSign.scrollWidth;
        animated.projectsSign.scrollWidth = drawProjectsTexture(animated.projectsSign.ctx, animated.projectsSign.canvas, animated.projectsOffset);
        animated.projectsSign.texture.needsUpdate = true;
      }
    }

    const trafficLights = trafficLightsRef.current;
    if (trafficLights.length) {
      const cycle = 3.6;
      const lightTime = state.clock.elapsedTime % cycle;
      const activeIndex = Math.floor((lightTime / cycle) * trafficLights.length);
      const pulse = 0.74 + 0.26 * Math.sin((lightTime % (cycle / trafficLights.length)) / (cycle / trafficLights.length) * Math.PI);
      trafficLights.forEach((light, index) => {
        const active = index === activeIndex ? 1 : 0;
        light.material.color.copy(light.idleColor).lerp(light.activeColor, active);
        light.material.emissive.copy(light.idleColor).lerp(light.activeColor, active);
        light.material.emissiveIntensity = index === activeIndex ? 2.8 * pulse : 0.05;
      });
    }

    const action = actionRef.current;
    const mixer = mixerRef.current;
    if (!action) {
      mixer?.update(0);
      return;
    }
    const duration = action.getClip().duration || 1;
    const smoothing = 1 - Math.exp(-delta / 0.14);
    scroll.current += (scrollTarget.current - scroll.current) * smoothing;
    if (Math.abs(scroll.current) > 1000) {
      const whole = Math.trunc(scroll.current);
      scroll.current -= whole;
      scrollTarget.current -= whole;
    }
    mixer.setTime((((scroll.current % 1) + 1) % 1) * duration);
    const camera = cameraRef.current;
    if (camera && shake.current > 0.0001) {
      const step = Math.min(delta, 1 / 30);
      shakeClock.current += 52 * step;
      camera.position.x += Math.sin(1.6 * shakeClock.current) * shake.current * 0.0026;
      camera.position.y += Math.cos(2.1 * shakeClock.current) * shake.current * 0.0026 * 0.35;
      shake.current *= Math.exp(-14 * step);
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const camera = preparedScene.getObjectByName('Camera');
    if (!camera?.isPerspectiveCamera) return undefined;
    const baseFov = camera.userData.baseFov ?? camera.fov;
    camera.userData.baseFov = baseFov;
    const apply = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = window.matchMedia('(max-width: 620px)').matches ? Math.min(baseFov + 3, 72) : baseFov;
      camera.updateProjectionMatrix();
    };
    cameraRef.current = camera;
    stateSetCamera({ camera });
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      stateSetCamera({ camera: defaultCamera });
    };
  }, [defaultCamera, preparedScene, stateSetCamera]);

  return (
    <primitive
      ref={group}
      object={preparedScene}
      onClick={handleClick}
      onPointerMove={handlePointerLabel}
      onPointerOut={handlePointerOut}
    />
  );
}

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
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.18} />
        <hemisphereLight color="#ffffff" groundColor="#ddd8cf" intensity={2.15} />
        <directionalLight castShadow color="#fff7ed" position={[4.8, 6.2, 4.2]} intensity={1.1} shadow-bias={-0.00012} shadow-mapSize-height={2048} shadow-mapSize-width={2048} />
        <Suspense fallback={null}>
          <SignalModel interactive={interactive} />
          <Environment preset="city" environmentIntensity={0.42} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/model.glb');
