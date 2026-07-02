'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import { setWavePath, waveClosedPath, waveMidPath, waveOpenPath } from './waveTransition';
import { emitInteractionEvent } from '../lib/interactions';

gsap.registerPlugin(ScrambleTextPlugin);

const loadingMessages = ['Loading...', 'Almost there...', 'Just a moment...'];
const scrambleChars = 'upperAndLowerCase0123456789<>!?_#*+';

let hasEnteredExperience = false;

export default function Preloader() {
  useGLTF.preload('/models/model.glb');
  const preloader = useRef<HTMLDivElement | null>(null);
  const text = useRef<HTMLSpanElement | null>(null);
  const wave = useRef<SVGPathElement | null>(null);
  const loadingLoop = useRef<gsap.core.Timeline | null>(null);
  const exitTimeline = useRef<gsap.core.Timeline | null>(null);
  const exitDelay = useRef<gsap.core.Tween | null>(null);
  const hardExitDelay = useRef<gsap.core.Tween | null>(null);
  const hasStartedExit = useRef(false);
  const skipPreloader = hasEnteredExperience;

  const finish = useCallback(() => {
    const root = preloader.current;
    loadingLoop.current?.kill();
    exitTimeline.current?.kill();
    exitDelay.current?.kill();
    hardExitDelay.current?.kill();
    loadingLoop.current = null;
    exitTimeline.current = null;
    exitDelay.current = null;
    hardExitDelay.current = null;
    setWavePath(wave.current, waveClosedPath);
    if (root) gsap.set(root, { autoAlpha: 0, display: 'none' });
    hasEnteredExperience = true;
    document.documentElement.classList.add('is-page-ready', 'is-page-surface-ready', 'is-entered');
    emitInteractionEvent(window, 'entered');
  }, []);

  const startExit = useCallback(() => {
    if (hasStartedExit.current) return;
    const root = preloader.current;
    const label = text.current;
    const wavePath = wave.current;
    if (!root || !label || !wavePath) {
      finish();
      return;
    }

    hasStartedExit.current = true;
    loadingLoop.current?.kill();
    loadingLoop.current = null;
    hardExitDelay.current = gsap.delayedCall(6.2, finish);

    const textTimeline = gsap.timeline();
    textTimeline
      .set(label, { autoAlpha: 1, opacity: 1, y: 0 })
      .to(label, {
        duration: 0.8,
        ease: 'power2.out',
        scrambleText: {
          chars: scrambleChars,
          revealDelay: 0.07,
          speed: 1.2,
          text: 'Thanks for waiting - all set.',
        },
      })
      .to({}, { duration: 0.38 })
      .to(label, {
        duration: 0.6,
        ease: 'power2.in',
        opacity: 0,
        scrambleText: { chars: scrambleChars, revealDelay: 0, speed: 0.82, text: '' },
      })
      .to(label, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' });

    exitDelay.current = gsap.delayedCall(1.15, () => {
      document.documentElement.classList.add('is-page-surface-ready');
      const pathState = { ...waveOpenPath };
      exitTimeline.current = gsap
        .timeline({ onComplete: finish })
        .to(pathState, {
          ...waveMidPath,
          duration: 1,
          ease: 'power3.inOut',
          onUpdate: () => setWavePath(wavePath, pathState),
        })
        .to(
          pathState,
          {
            ...waveClosedPath,
            duration: 1,
            ease: 'power3.out',
            onUpdate: () => setWavePath(wavePath, pathState),
          },
          '-=0.5',
        );
    });
  }, [finish]);

  useLayoutEffect(() => {
    if (skipPreloader) {
      finish();
      return;
    }

    const root = preloader.current;
    const label = text.current;
    if (!root || !label) return;

    const ctx = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1, display: 'grid' });
      gsap.set(label, { autoAlpha: 1, opacity: 0, textContent: '', y: 6 });
      setWavePath(wave.current, waveOpenPath);

      const loop = gsap.timeline({ repeat: -1 });
      loadingMessages.forEach((message) => {
        loop
          .to(label, {
            duration: 0.66,
            ease: 'power2.out',
            opacity: 1,
            y: 0,
            scrambleText: {
              chars: scrambleChars,
              revealDelay: 0.04,
              speed: 1.05,
              text: message,
            },
          })
          .to({}, { duration: 0.36 })
          .to(label, {
            duration: 0.54,
            ease: 'power2.in',
            opacity: 0.68,
            scrambleText: { chars: scrambleChars, revealDelay: 0, speed: 0.9, text: '' },
          })
          .set(label, { y: 0 });
      });
      loadingLoop.current = loop;
    }, root);

    exitDelay.current = gsap.delayedCall(4, startExit);

    return () => {
      loadingLoop.current?.kill();
      exitTimeline.current?.kill();
      exitDelay.current?.kill();
      hardExitDelay.current?.kill();
      gsap.killTweensOf(label);
      loadingLoop.current = null;
      exitTimeline.current = null;
      exitDelay.current = null;
      hardExitDelay.current = null;
      ctx.revert();
    };
  }, [finish, skipPreloader, startExit]);

  if (skipPreloader) return null;

  return (
    <div ref={preloader} className="preloader" aria-atomic="true" aria-live="polite">
      <svg className="preloader__wave" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice">
        <path ref={wave} fill="#050505" />
      </svg>
      <div className="preloader__inner">
        <span ref={text} className="preloader__text">
          Loading...
        </span>
      </div>
    </div>
  );
}
