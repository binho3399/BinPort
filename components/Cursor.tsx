'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { signalEvents } from '../lib/events';

const DEFAULT_LABEL = 'Open';

type CursorEnterDetail = {
  label?: string;
  showArrow?: boolean;
};

function getLabel(target: HTMLElement) {
  const explicit = target.dataset.cursorStalkerLabel?.trim();
  if (explicit) return explicit;
  const aria = target.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  return target.textContent?.replace(/\s+/g, ' ').trim() || DEFAULT_LABEL;
}

export default function Cursor() {
  const root = useRef<HTMLDivElement | null>(null);
  const shape = useRef<SVGRectElement | null>(null);
  const label = useRef<SVGTextElement | null>(null);
  const arrow = useRef<SVGPathElement | null>(null);
  const activeTarget = useRef<HTMLElement | null>(null);
  const isExternal = useRef(false);
  const width = useRef(18);
  const height = useRef(18);

  useEffect(() => {
    const element = root.current;
    const rect = shape.current;
    const text = label.current;
    const arrowPath = arrow.current;
    if (!element || !rect || !text || !arrowPath) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) {
      gsap.set(element, { autoAlpha: 0 });
      return undefined;
    }

    const xTo = gsap.quickTo(element, 'x', { duration: 0.42, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.42, ease: 'power3.out' });
    let hasPointer = false;

    const updateShape = () => {
      const nextWidth = width.current;
      const nextHeight = height.current;
      const radius = nextHeight / 2;
      rect.setAttribute('x', '1');
      rect.setAttribute('y', '1');
      rect.setAttribute('width', String(Math.max(0, nextWidth - 2)));
      rect.setAttribute('height', String(Math.max(0, nextHeight - 2)));
      rect.setAttribute('rx', String(Math.max(0, radius - 1)));
      rect.setAttribute('ry', String(Math.max(0, radius - 1)));
    };

    const resize = (nextWidth: number, nextHeight: number) => {
      gsap.to(width, {
        current: nextWidth,
        duration: 0.48,
        ease: 'expo.out',
        overwrite: 'auto',
        onUpdate: updateShape,
      });
      gsap.to(height, {
        current: nextHeight,
        duration: 0.48,
        ease: 'expo.out',
        overwrite: 'auto',
        onUpdate: updateShape,
      });
      gsap.to(element, {
        width: nextWidth,
        height: nextHeight,
        duration: 0.48,
        ease: 'expo.out',
        overwrite: 'auto',
      });
    };

    const show = (nextLabel: string, showArrow = true) => {
      text.textContent = nextLabel;
      const nextWidth = Math.max(78, Math.min(280, Math.ceil(text.getComputedTextLength() + 58)));
      const nextHeight = 34;
      text.setAttribute('x', '15');
      text.setAttribute('text-anchor', 'start');
      resize(nextWidth, nextHeight);
      gsap.to(element, { autoAlpha: 1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(text, { autoAlpha: 1, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(arrowPath, {
        autoAlpha: showArrow ? 1 : 0,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      gsap.to(arrowPath, {
        x: nextWidth - 78,
        duration: 0.48,
        ease: 'expo.out',
        overwrite: 'auto',
      });
      gsap.to(element, {
        rotate: 0,
        scale: 1,
        duration: 0.36,
        ease: 'back.out(1.6)',
        overwrite: 'auto',
      });
    };

    const hide = () => {
      activeTarget.current = null;
      isExternal.current = false;
      resize(18, 18);
      gsap.to(element, { autoAlpha: 0, duration: 0.16, ease: 'power2.out', overwrite: 'auto' });
      gsap.to([text, arrowPath], {
        autoAlpha: 0,
        duration: 0.14,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      gsap.to(arrowPath, { x: 0, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(element, {
        rotate: -16,
        scale: 1,
        duration: 0.36,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const getPosition = (event: PointerEvent) => ({
      x: Math.max(
        8,
        Math.min(event.clientX - width.current / 2 - 3, window.innerWidth - width.current - 8),
      ),
      y: Math.max(
        8,
        Math.min(event.clientY - height.current - 1, window.innerHeight - height.current - 8),
      ),
    });

    const onMove = (event: PointerEvent) => {
      if (activeTarget.current && !activeTarget.current.isConnected) hide();
      const position = getPosition(event);
      if (hasPointer) {
        xTo(position.x);
        yTo(position.y);
      } else {
        hasPointer = true;
        gsap.set(element, position);
      }
    };

    const onOver = (event: PointerEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              '[data-cursor-stalker-label]:not([aria-disabled="true"])',
            )
          : null;
      if (target && activeTarget.current !== target) {
        if (!hasPointer) {
          hasPointer = true;
          gsap.set(element, getPosition(event));
        }
        activeTarget.current = target;
        isExternal.current = false;
        show(getLabel(target), true);
      }
    };

    const onOut = (event: PointerEvent) => {
      const target = activeTarget.current;
      if (!target) return;
      const related = event.relatedTarget;
      if (
        (related instanceof Node && target.contains(related)) ||
        !(event.target instanceof Node) ||
        !target.contains(event.target)
      )
        return;
      hide();
    };

    const onCursorEnter = (event: Event) => {
      const { label: nextLabel, showArrow = true } =
        (event as CustomEvent<CursorEnterDetail>).detail ?? {};
      activeTarget.current = null;
      isExternal.current = true;
      show(nextLabel?.trim() || DEFAULT_LABEL, showArrow);
    };

    const onCursorLeave = () => {
      if (isExternal.current) hide();
    };

    const onPointerLeave = () => {
      gsap.to(element, { autoAlpha: 0, duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      hide();
    };

    updateShape();
    gsap.set(element, { autoAlpha: 0, force3D: true, rotate: -16, xPercent: 0, yPercent: 0 });
    gsap.set([text, arrowPath], { autoAlpha: 0 });
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    window.addEventListener(signalEvents.cursorEnter, onCursorEnter);
    window.addEventListener(signalEvents.cursorLeave, onCursorLeave);
    window.addEventListener(signalEvents.cursorReset, hide);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      xTo.tween.kill();
      yTo.tween.kill();
      gsap.killTweensOf([element, text, arrowPath, width, height]);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener(signalEvents.cursorEnter, onCursorEnter);
      window.removeEventListener(signalEvents.cursorLeave, onCursorLeave);
      window.removeEventListener(signalEvents.cursorReset, hide);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div ref={root} className="mouse-stalker" aria-hidden="true">
      <svg className="mouse-stalker__svg" role="presentation">
        <rect ref={shape} className="mouse-stalker__shape" />
        <text
          ref={label}
          className="mouse-stalker__label"
          x="15"
          y="50%"
          dy="0.14em"
          dominantBaseline="middle"
        />
        <path ref={arrow} className="mouse-stalker__arrow" d="M58 11 L66 17 L58 23 M48 17 H65" />
      </svg>
    </div>
  );
}
