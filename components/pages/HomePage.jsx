export default function HomePage() {
  return (
    <main className="experience-page experience-page--home">
      <section className="hero-section page-shell" aria-label="Signal Pole">
        <div className="home-profile" data-text-reveal>
          <p data-text-reveal-kicker>Product Developer</p>
          <h1 data-text-reveal-heading>HO BINH</h1>
        </div>
        <dl className="home-meta" aria-label="Home details" data-text-reveal>
          <div>
            <dt>Base</dt>
            <dd>Tokyo, Japan</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Creative development / Motion / 3D modeling</dd>
          </div>
          <div>
            <dt>Index</dt>
            <dd>Portfolio 2026</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
