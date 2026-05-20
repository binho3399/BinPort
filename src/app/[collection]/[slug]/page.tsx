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
    return { title: "Không tìm thấy trang" };
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

  // Simple and robust markdown parser for headers and lists
  const renderContentBody = () => {
    return item.body.split("\n").map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg md:text-xl font-bold font-display text-white mt-6 mb-3 border-b border-slate-800/80 pb-2">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith("- ")) {
        return (
          <li key={index} className="text-slate-300 text-xs md:text-sm ml-6 my-1.5 list-disc">
            {trimmed.slice(2)}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={index} className="h-2"></div>;
      }
      return (
        <p key={index} className="text-slate-300 text-xs md:text-sm leading-relaxed my-2">
          {line}
        </p>
      );
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-8 pb-20 space-y-8">
      {/* Header Bento Glass Panel */}
      <article className="glass-panel p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-0.5 rounded">
              {collection === "case-studies" ? "Nghiên cứu điển hình" : collection === "experiments" ? "Thử nghiệm" : "Bài viết"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{item.frontmatter.publishedAt}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{item.readingMinutes} phút đọc</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold font-display leading-tight text-white">
            {item.frontmatter.title}
          </h1>

          <p className="text-slate-400 text-xs md:text-sm leading-relaxed border-l-2 border-purple-500/40 pl-4 py-1">
            {item.frontmatter.summary}
          </p>
        </div>

        {/* Dynamic Project Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          {typeof frontmatter.role === "string" && (
            <div>
              <span className="text-slate-500 block font-semibold uppercase text-[9px] tracking-wider">Vai trò</span>
              <span className="text-slate-300">{frontmatter.role}</span>
            </div>
          )}
          {typeof frontmatter.timeline === "string" && (
            <div>
              <span className="text-slate-500 block font-semibold uppercase text-[9px] tracking-wider">Thời gian</span>
              <span className="text-slate-300">{frontmatter.timeline}</span>
            </div>
          )}
          {typeof frontmatter.impact === "string" && (
            <div>
              <span className="text-slate-500 block font-semibold uppercase text-[9px] tracking-wider">Tác động</span>
              <span className="text-emerald-400 font-medium">{frontmatter.impact}</span>
            </div>
          )}
          {typeof frontmatter.hypothesis === "string" && (
            <div className="col-span-2">
              <span className="text-slate-500 block font-semibold uppercase text-[9px] tracking-wider">Giả thuyết</span>
              <span className="text-slate-300 italic">"{frontmatter.hypothesis}"</span>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        {(demoUrl || repoUrl) && (
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {demoUrl && (
              <TrackLink
                href={demoUrl}
                label="Xem Bản thử nghiệm (Demo)"
                eventName="open_project_demo"
                variant="primary"
              />
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                </svg>
                Kho mã nguồn (Repository)
              </a>
            )}
          </div>
        )}
      </article>

      {/* Main Content Body Glass Panel */}
      <article className="glass-panel p-8 md:p-10 space-y-4">
        {renderContentBody()}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ReadDepthTracker slug={item.frontmatter.slug} />
    </main>
  );
}
