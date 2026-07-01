'use client';

export default function FilmGrain() {
  return (
    <>
      <style>{`
        @keyframes film-grain-shift {
          0% { background-position: 0 0; }
          10% { background-position: -5% -5%; }
          20% { background-position: -10% 5%; }
          30% { background-position: 5% -10%; }
          40% { background-position: -5% 10%; }
          50% { background-position: -10% -5%; }
          60% { background-position: 10% 5%; }
          70% { background-position: 0 -10%; }
          80% { background-position: -10% 0; }
          90% { background-position: 5% 5%; }
          100% { background-position: 0 0; }
        }
        .film-grain {
          animation: film-grain-shift 0.83s steps(10) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .film-grain { animation: none; }
        }
      `}</style>
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
