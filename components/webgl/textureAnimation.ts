import { drawProfileTexture } from '../profileSignCanvas';
import { drawContactTexture, drawProjectsTexture } from './textures';
import type { AnimatedTexturesState, TrafficLight } from './types';

type TextureFrameTimes = { contact: number; profile: number; projects: number };

export function updateAnimatedTextures(
  animated: AnimatedTexturesState,
  frameTimes: TextureFrameTimes,
  elapsedTime: number,
  delta: number,
  textureInterval: number,
) {
  if (animated.contactSign?.ctx) {
    animated.contactTime += delta;
    if (elapsedTime - frameTimes.contact >= textureInterval) {
      frameTimes.contact = elapsedTime;
      drawContactTexture(
        animated.contactSign.ctx,
        animated.contactSign.canvas,
        animated.contactTime,
      );
      animated.contactSign.texture.needsUpdate = true;
    }
  }
  if (animated.profileSign?.ctx) {
    animated.profileTime += delta;
    if (elapsedTime - frameTimes.profile >= textureInterval) {
      frameTimes.profile = elapsedTime;
      drawProfileTexture(
        animated.profileSign.ctx,
        animated.profileSign.canvas,
        animated.profileTime,
      );
      animated.profileSign.texture.needsUpdate = true;
    }
  }
  const scrollWidth = animated.projectsSign?.scrollWidth ?? 0;
  if (animated.projectsSign?.ctx && scrollWidth > 0) {
    const step = Math.min(delta, 1 / 24);
    animated.projectsOffset = (animated.projectsOffset + 100 * step) % scrollWidth;
    if (elapsedTime - frameTimes.projects >= textureInterval) {
      frameTimes.projects = elapsedTime;
      animated.projectsSign.scrollWidth = drawProjectsTexture(
        animated.projectsSign.ctx,
        animated.projectsSign.canvas,
        animated.projectsOffset,
      );
      animated.projectsSign.texture.needsUpdate = true;
    }
  }
}

export function updateTrafficLights(trafficLights: TrafficLight[], elapsedTime: number) {
  if (!trafficLights.length) return;
  const cycle = 3.6;
  const lightTime = elapsedTime % cycle;
  const activeIndex = Math.floor((lightTime / cycle) * trafficLights.length);
  const pulse =
    0.74 +
    0.26 *
      Math.sin(
        ((lightTime % (cycle / trafficLights.length)) / (cycle / trafficLights.length)) * Math.PI,
      );
  trafficLights.forEach((light, index) => {
    const active = index === activeIndex ? 1 : 0;
    light.material.color.copy(light.idleColor).lerp(light.activeColor, active);
    light.material.emissive.copy(light.idleColor).lerp(light.activeColor, active);
    light.material.emissiveIntensity = index === activeIndex ? 2.8 * pulse : 0.05;
  });
}
