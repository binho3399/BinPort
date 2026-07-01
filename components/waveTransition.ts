import gsap from 'gsap';

export const waveOpenPath = { bottomY: 100, closeY: 0, controlY: 100 };
export const waveMidPath = { bottomY: 50, closeY: 0, controlY: 100 };
export const waveClosedPath = { bottomY: 0, closeY: 0, controlY: 0 };

export type WavePath = typeof waveOpenPath;

export function setWavePath(path: SVGPathElement | null, values: WavePath) {
  if (!path) return;
  path.setAttribute(
    'd',
    `M 0 0 V ${values.bottomY} Q 50 ${values.controlY} 100 ${values.bottomY} V ${values.closeY} z`,
  );
}

export function buildRevealTimeline(
  path: SVGPathElement,
  svg: HTMLElement,
  onComplete: () => void,
): gsap.core.Timeline {
  const revealState = { ...waveOpenPath };
  setWavePath(path, revealState);
  return gsap
    .timeline({
      onComplete: () => {
        gsap.set(svg, { opacity: 0 });
        onComplete();
      },
    })
    .to(revealState, {
      ...waveMidPath,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: () => setWavePath(path, revealState),
    })
    .to(
      revealState,
      {
        ...waveClosedPath,
        duration: 1.0,
        ease: 'power3.out',
        onUpdate: () => setWavePath(path, revealState),
      },
      '-=0.5',
    );
}
