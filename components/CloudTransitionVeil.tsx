'use client';

export default function CloudTransitionVeil() {
  return (
    <div className="cloud-transition-veil" aria-hidden="true">
      <div className="cloud-transition-veil__wash" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--upper" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--middle" />
      <div className="cloud-transition-veil__band cloud-transition-veil__band--lower" />
      <div className="cloud-transition-veil__mist cloud-transition-veil__mist--left" />
      <div className="cloud-transition-veil__mist cloud-transition-veil__mist--right" />
    </div>
  );
}
