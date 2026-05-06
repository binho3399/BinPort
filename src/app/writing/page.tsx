import Link from "next/link";
import { getWritingPosts } from "@/lib/content";

export default function WritingPage() {
  const posts = getWritingPosts();
  return (
    <main className="container stack">
      <h1>Writing</h1>
      {posts.map((item) => (
        <article key={item.frontmatter.slug} className="card stack">
          <Link href={`/writing/${item.frontmatter.slug}`}>
            <strong>{item.frontmatter.title}</strong>
          </Link>
          <p style={{ margin: 0 }}>{item.frontmatter.summary}</p>
          <small>{item.readingMinutes} min read</small>
        </article>
      ))}
    </main>
  );
}
