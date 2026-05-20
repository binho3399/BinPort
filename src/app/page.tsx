import type { Metadata } from "next";
import Link from "next/link";
import { TrackLink } from "@/components/TrackLink";
import { siteConfig } from "@/config/site";
import { getCaseStudies, getExperiments, getWritingPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Alex Nguyễn - Chuyên gia Thiết kế Sản phẩm Cao cấp",
  description:
    "Portfolio của Alex Nguyễn, tập trung vào chiến lược sản phẩm, định hướng thiết kế và xây dựng nguyên mẫu hỗ trợ bởi AI."
};

export default function HomePage() {
  const featuredCaseStudies = getCaseStudies()
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);
  const featuredExperiments = getExperiments()
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);
  const latestPosts = getWritingPosts().slice(0, 4);

  return (
    <main className="max-w-6xl mx-auto px-6 pt-8 pb-20 space-y-12">
      {/* SECTION 1: HERO & STATS (BENTO LAYOUT) */}
      <div className="bento-grid">
        {/* Hero Cell (Large Glass Bento Panel) */}
        <section className="col-span-8 glass-panel p-8 md:p-12 flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              Senior Product Designer
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-gradient">
              {siteConfig.hero.headline}
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
              {siteConfig.hero.subheadline}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <TrackLink
              href={siteConfig.home.primaryCta.href}
              label={siteConfig.home.primaryCta.label}
              eventName={siteConfig.home.primaryCta.eventName}
              variant="primary"
            />
            <TrackLink
              href={siteConfig.home.secondaryCta.href}
              label={siteConfig.home.secondaryCta.label}
              eventName={siteConfig.home.secondaryCta.eventName}
              variant="secondary"
            />
          </div>
        </section>

        {/* Quick Stats Cell (Medium Glass Bento Panel) */}
        <section className="col-span-4 glass-panel glass-panel--accent p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Độ uy tín & Thực chứng
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {siteConfig.home.trustLabel}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {siteConfig.home.trustStats.map((stat, idx) => (
              <article key={stat.label} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center gap-4">
                <div className="text-2xl font-bold font-display text-gradient-emerald">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {stat.label}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 2: FEATURED WORK (DỰ ÁN NỔI BẬT) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-gradient">
              {siteConfig.home.sections.work.title}
            </h2>
            <p className="text-slate-400 text-sm">
              {siteConfig.home.sections.work.description}
            </p>
          </div>
          <Link href="/work" className="text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1 group">
            Xem tất cả dự án
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCaseStudies.map((item) => (
            <article key={item.frontmatter.slug} className="glass-panel p-6 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400 bg-purple-950/30 border border-purple-500/20 px-2 py-0.5 rounded">
                    {item.frontmatter.domain}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.frontmatter.timeline}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                  <Link href={`/case-studies/${item.frontmatter.slug}`}>
                    {item.frontmatter.title}
                  </Link>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {item.frontmatter.summary}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/60">
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {item.frontmatter.impact}
                </div>
                <Link href={`/case-studies/${item.frontmatter.slug}`} className="text-xs text-slate-300 font-semibold group-hover:text-white flex items-center gap-1">
                  Đọc nghiên cứu điển hình
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: CORE CAPABILITIES (NĂNG LỰC CỐT LÕI) */}
      <section className="glass-panel p-8 md:p-10 space-y-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-gradient">
            {siteConfig.home.sections.capabilities.title}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            {siteConfig.home.sections.capabilities.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {siteConfig.valuePillars.map((pillar, idx) => (
            <article key={pillar.title} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                0{idx + 1}
              </div>
              <h3 className="text-base font-bold text-white font-display">
                {pillar.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 4: INSIGHTS & EXPERIMENTS (CHIA SẺ & THỬ NGHIỆM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Bento: Thử nghiệm (Experiments) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-800/80 pb-4">
            <h2 className="text-xl font-bold font-display text-gradient-emerald">
              Thử nghiệm Nguyên mẫu
            </h2>
            <Link href="/experiments" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {featuredExperiments.map((item) => (
              <article key={item.frontmatter.slug} className="glass-panel p-5 space-y-3 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Thử nghiệm
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.frontmatter.publishedAt}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white hover:text-emerald-300 transition-colors">
                  <Link href={`/experiments/${item.frontmatter.slug}`}>
                    {item.frontmatter.title}
                  </Link>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {item.frontmatter.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Right Bento: Bài chia sẻ (Writing) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-800/80 pb-4">
            <h2 className="text-xl font-bold font-display text-gradient-purple">
              Bài viết mới nhất
            </h2>
            <Link href="/writing" className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {latestPosts.slice(0, 3).map((item) => (
              <article key={item.frontmatter.slug} className="glass-panel p-5 space-y-3 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2 py-0.5 rounded">
                    {item.frontmatter.topic || "Chia sẻ"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.readingMinutes} phút đọc
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white hover:text-purple-300 transition-colors">
                  <Link href={`/writing/${item.frontmatter.slug}`}>
                    {item.frontmatter.title}
                  </Link>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {item.frontmatter.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 5: FINAL CTA */}
      <section className="glass-panel p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-gradient leading-tight">
            {siteConfig.home.sections.finalCta.title}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {siteConfig.home.sections.finalCta.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2 w-full max-w-md mx-auto">
          <TrackLink
            href={siteConfig.home.finalCta.primary.href}
            label={siteConfig.home.finalCta.primary.label}
            eventName={siteConfig.home.finalCta.primary.eventName}
            variant="primary"
          />
          <TrackLink
            href={siteConfig.home.finalCta.secondary.href}
            label={siteConfig.home.finalCta.secondary.label}
            eventName={siteConfig.home.finalCta.secondary.eventName}
            variant="secondary"
          />
        </div>
      </section>
    </main>
  );
}
