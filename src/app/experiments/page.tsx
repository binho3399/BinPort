import type { Metadata } from "next";
import Link from "next/link";
import { getExperiments } from "@/lib/content";

export const metadata: Metadata = {
  title: "Thử nghiệm Nguyên mẫu",
  description: "Các ứng dụng và nguyên mẫu lập trình nhanh nhằm xác thực ý tưởng sản phẩm."
};

export default function ExperimentsPage() {
  const experiments = getExperiments();
  
  return (
    <main className="max-w-4xl mx-auto px-6 pt-8 pb-20 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold font-display text-gradient-emerald">Thử nghiệm & Nguyên mẫu</h1>
        <p className="text-slate-400 text-sm">Các sản phẩm lập trình nhanh ứng dụng AI, thiết kế tương tác và tối ưu hóa chuyển đổi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiments.map((item) => (
          <article 
            key={item.frontmatter.slug} 
            className="glass-panel glass-panel--accent p-6 flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  {item.frontmatter.techStack?.slice(0, 2).join(" + ") || "Prototype"}
                </span>
                <span className="text-[10px] text-slate-500">{item.frontmatter.publishedAt}</span>
              </div>
              <h2 className="text-lg font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                <Link href={`/experiments/${item.frontmatter.slug}`}>
                  {item.frontmatter.title}
                </Link>
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{item.frontmatter.summary}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Giả thuyết xác thực</span>
                <p className="text-slate-300 text-xs italic leading-snug line-clamp-2">"{item.frontmatter.hypothesis}"</p>
              </div>
              <Link 
                href={`/experiments/${item.frontmatter.slug}`} 
                className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 group/btn pt-1"
              >
                Xem chi tiết kỹ thuật
                <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
