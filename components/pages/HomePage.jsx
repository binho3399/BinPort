import { homeContent, profile } from '../../lib/siteContent';

export default function HomePage() {
  return (
    <main className="experience-page experience-page--home">
      <section className="hero-section page-shell" aria-label={homeContent.ariaLabel}>
        <div className="home-profile" data-text-reveal>
          <p data-text-reveal-kicker>{profile.role}</p>
          <h1 data-text-reveal-heading>{profile.displayName}</h1>
        </div>
        <dl className="home-meta" aria-label="Home details" data-text-reveal>
          {homeContent.meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
