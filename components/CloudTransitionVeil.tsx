'use client';

import type { RefObject } from 'react';

type CloudTransitionVeilProps = {
  veilRef?: RefObject<HTMLDivElement | null>;
};

export default function CloudTransitionVeil({ veilRef }: CloudTransitionVeilProps) {
  return (
    <div ref={veilRef} className="cloud-transition-veil" aria-hidden="true">
      <div className="cloud-transition-veil__wash" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--upper" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--middle" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--lower" />
      <div className="cloud-transition-veil__mist cloud-transition-veil__mist--left" />
      <div className="cloud-transition-veil__mist cloud-transition-veil__mist--right" />
    </div>
  );
}
