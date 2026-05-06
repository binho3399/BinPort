import Link from "next/link";
import { getCaseStudies } from "@/lib/content";

export default function WorkPage() {
  const caseStudies = getCaseStudies();
  return (
    <main className="container stack">
      <h1>Work</h1>
      {caseStudies.map((item) => (
        <article key={item.frontmatter.slug} className="card stack">
          <Link href={`/case-studies/${item.frontmatter.slug}`}>
            <strong>{item.frontmatter.title}</strong>
          </Link>
          <p style={{ margin: 0 }}>{item.frontmatter.summary}</p>
          <small>
            {item.frontmatter.domain} - {item.frontmatter.impact}
          </small>
        </article>
      ))}
    </main>
  );
}
