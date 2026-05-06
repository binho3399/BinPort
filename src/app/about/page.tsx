import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <main className="container stack">
      <h1>About</h1>
      <section className="card stack">
        <h2 style={{ margin: 0 }}>What I do now</h2>
        <p style={{ margin: 0 }}>
          I lead product design initiatives from problem framing to shipped outcomes,
          while using vibe coding to validate risky ideas earlier.
        </p>
      </section>
      <section className="card stack">
        <h2 style={{ margin: 0 }}>How I work</h2>
        <p style={{ margin: 0 }}>
          I combine discovery, design systems, and rapid prototyping to align teams and
          accelerate decisions.
        </p>
      </section>
      <section className="card stack">
        <h2 style={{ margin: 0 }}>Who I work with</h2>
        {siteConfig.audiences.map((audience) => (
          <p key={audience} style={{ margin: 0 }}>
            - {audience}
          </p>
        ))}
      </section>
    </main>
  );
}
