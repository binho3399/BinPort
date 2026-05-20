import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dự án Nổi bật",
  description: "Các dự án thiết kế sản phẩm có tác động lớn thực hiện bởi Alex Nguyễn."
};

export default function WorkPage() {
  const caseStudies = getCaseStudies();
  
  return (
    <main className="max-w-4xl mx-auto px-6 pt-8 pb-20 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold font-display text-gradient">Dự án đã thực hiện</h1>
        <p className="text-slate-400 text-sm">Tổng hợp các nghiên cứu điển hình từ chiến lược đến bàn giao sản phẩm thực tế.</p>
      </div>

      <div className="space-y-6">
        {caseStudies.map((item) => (
          <article 
            key={item.frontmatter.slug} 
            className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-0.5 rounded">
                  {item.frontmatter.domain}
                </span>
                <span className="text-[10px] text-slate-500">{item.frontmatter.timeline}</span>
              </div>
              <h2 className="text-xl font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                <Link href={`/case-studies/${item.frontmatter.slug}`}>
                  {item.frontmatter.title}
                </Link>
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{item.frontmatter.summary}</p>
            </div>

            <div className="flex flex-col items-start md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Tác động thực chứng</span>
                <span className="text-xs font-semibold text-emerald-400 block">{item.frontmatter.impact}</span>
              </div>
              <Link 
                href={`/case-studies/${item.frontmatter.slug}`} 
                className="text-xs text-purple-400 font-bold hover:text-purple-300 flex items-center gap-1 group/btn"
              >
                Đọc bài viết
                <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
