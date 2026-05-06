import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReadDepthTracker } from "@/components/ReadDepthTracker";
import { TrackLink } from "@/components/TrackLink";
import {
  getCaseStudies,
  getContentBySlug,
  getExperiments,
  getWritingPosts
} from "@/lib/content";
import type { CollectionName } from "@/types/content";

type Params = { collection: CollectionName; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [
    ...getCaseStudies().map((item) => ({
      collection: "case-studies" as const,
      slug: item.frontmatter.slug
    })),
    ...getExperiments().map((item) => ({
      collection: "experiments" as const,
      slug: item.frontmatter.slug
    })),
    ...getWritingPosts().map((item) => ({
      collection: "writing" as const,
      slug: item.frontmatter.slug
    }))
  ];
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { collection, slug } = await params;
  const item = getContentBySlug(collection, slug);
  if (!item) {
    return { title: "Not found" };
  }
  return {
    title: item.frontmatter.title,
    description: item.frontmatter.summary,
    openGraph: {
      title: item.frontmatter.title,
      description: item.frontmatter.summary,
      type: "article"
    }
  };
}

export default async function ContentDetailPage({
  params
}: {
  params: Promise<Params>;
}) {
  const { collection, slug } = await params;
  const item = getContentBySlug(collection, slug);

  if (!item) {
    notFound();
  }
  const frontmatter = item.frontmatter as Record<string, unknown>;
  const demoUrl =
    typeof frontmatter.demoUrl === "string" ? frontmatter.demoUrl : undefined;
  const repoUrl =
    typeof frontmatter.repoUrl === "string" ? frontmatter.repoUrl : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.frontmatter.title,
    datePublished: item.frontmatter.publishedAt,
    description: item.frontmatter.summary
  };

  return (
    <main className="container stack">
      <article className="card stack">
        <h1 style={{ margin: 0 }}>{item.frontmatter.title}</h1>
        <p style={{ margin: 0 }}>{item.frontmatter.summary}</p>
        <small>{item.readingMinutes} min read</small>
        {demoUrl ? (
          <TrackLink href={demoUrl} label="Open demo" eventName="open_project_demo" />
        ) : null}
        {repoUrl ? <a href={repoUrl}>View repository</a> : null}
      </article>
      <article className="card">
        {item.body.split("\n").map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ReadDepthTracker slug={item.frontmatter.slug} />
    </main>
  );
}
