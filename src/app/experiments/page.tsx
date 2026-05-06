import Link from "next/link";
import { getExperiments } from "@/lib/content";

export default function ExperimentsPage() {
  const experiments = getExperiments();
  return (
    <main className="container stack">
      <h1>Experiments</h1>
      {experiments.map((item) => (
        <article key={item.frontmatter.slug} className="card stack">
          <Link href={`/experiments/${item.frontmatter.slug}`}>
            <strong>{item.frontmatter.title}</strong>
          </Link>
          <p style={{ margin: 0 }}>{item.frontmatter.summary}</p>
          <small>{item.frontmatter.hypothesis}</small>
        </article>
      ))}
    </main>
  );
}
