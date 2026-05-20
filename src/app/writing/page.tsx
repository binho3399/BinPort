import type { Metadata } from "next";
import Link from "next/link";
import { getWritingPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Góc chia sẻ kiến thức",
  description: "Các bài viết về hệ thống thiết kế, tư duy sản phẩm và tối ưu hóa quy trình làm việc cùng AI."
};

export default function WritingPage() {
  const posts = getWritingPosts();
  
  return (
    <main className="max-w-4xl mx-auto px-6 pt-8 pb-20 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold font-display text-gradient">Góc chia sẻ & Bài viết</h1>
        <p className="text-slate-400 text-sm">Nơi tôi chia sẻ về hệ thống thiết kế (Design Systems), quy trình AI và các quyết định sản phẩm.</p>
      </div>

      <div className="space-y-4">
        {posts.map((item) => (
          <article 
            key={item.frontmatter.slug} 
            className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2 py-0.5 rounded">
                  {item.frontmatter.topic || "Chia sẻ"}
                </span>
                <span className="text-[10px] text-slate-500">{item.frontmatter.publishedAt}</span>
              </div>
              <h2 className="text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                <Link href={`/writing/${item.frontmatter.slug}`}>
                  {item.frontmatter.title}
                </Link>
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{item.frontmatter.summary}</p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between">
              <span className="text-[11px] text-slate-500 whitespace-nowrap">{item.readingMinutes} phút đọc</span>
              <Link 
                href={`/writing/${item.frontmatter.slug}`} 
                className="text-xs text-purple-400 font-bold hover:text-purple-300 flex items-center gap-1 group/btn"
              >
                Đọc bài
                <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
