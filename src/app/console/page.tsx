"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { portalService } from "@/lib/supabase";

type AnalyticsData = {
  pageViews: { date: string; views: number }[];
  readDepth: { slug: string; read50: number; read75: number; total: number }[];
  ctaClicks: { label: string; clicks: number }[];
  contacts: { id: string; sender: string; company: string; email: string; message: string; date: string }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "contacts">("analytics");

  useEffect(() => {
    // Authenticate and load data
    portalService.getSession().then(({ data: authData }) => {
      if (!authData?.session) {
        router.push("/console/login");
      } else {
        portalService.getAnalyticsData().then(({ data: analyticsData, error: dbError }) => {
          if (dbError) {
            setError(dbError.message);
          } else if (analyticsData) {
            setData(analyticsData as AnalyticsData);
          }
          setLoading(false);
        });
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await portalService.logout();
    router.push("/console/login");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-xs">Đang nạp dữ liệu quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 pt-8 pb-24 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-display text-gradient">Bảng Điều Khiển Hệ Thống</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded">
              Đã kết nối {portalService.isMock ? "(Giả lập)" : "(Supabase)"}
            </span>
          </div>
          <p className="text-slate-400 text-xs">Theo dõi tương tác, xem dữ liệu đọc bài và tin nhắn liên hệ mới.</p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary py-2 text-xs"
        >
          Đăng xuất hệ thống
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-medium">
          ⚠️ Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "analytics"
              ? "bg-purple-500/20 border border-purple-500/30 text-white shadow-[0_0_10px_rgba(139,92,246,0.15)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📊 Phân tích & Tương tác
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === "contacts"
              ? "bg-purple-500/20 border border-purple-500/30 text-white shadow-[0_0_10px_rgba(139,92,246,0.15)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          ✉️ Tin nhắn Liên hệ
          {data && data.contacts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
          )}
        </button>
      </div>

      {data && (
        <div className="space-y-8">
          {activeTab === "analytics" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Views Chart & CTA Clicks */}
              <div className="lg:col-span-2 space-y-6">
                {/* Page Views Chart Panel */}
                <section className="glass-panel p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white font-display">Lượt xem trang trong tuần (Page Views)</h3>
                  <div className="h-48 flex items-end justify-between gap-2 pt-6">
                    {data.pageViews.map((day) => {
                      const maxViews = Math.max(...data.pageViews.map(d => d.views));
                      const heightPercent = (day.views / maxViews) * 100;
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="text-[10px] text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {day.views}
                          </div>
                          <div
                            style={{ height: `${heightPercent * 0.8}%` }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-purple-600/40 to-purple-500 hover:to-purple-400 transition-all duration-300 relative"
                          >
                            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity rounded-t-lg"></div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">{day.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Case Study Read Depth Panel */}
                <section className="glass-panel p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white font-display">Chiều sâu đọc Nghiên cứu Điển hình (Read Depth)</h3>
                  <div className="space-y-4">
                    {data.readDepth.map((study) => {
                      const percent50 = Math.round((study.read50 / study.total) * 100);
                      const percent75 = Math.round((study.read75 / study.total) * 100);
                      return (
                        <div key={study.slug} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white font-mono">{study.slug}</span>
                            <span className="text-[10px] text-slate-500">Tổng lượt xem: {study.total}</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {/* Read 50% */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Đọc trên 50%</span>
                                <span className="font-semibold text-purple-400">{percent50}% ({study.read50})</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div style={{ width: `${percent50}%` }} className="h-full bg-purple-500 rounded-full"></div>
                              </div>
                            </div>

                            {/* Read 75% */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Đọc trên 75%</span>
                                <span className="font-semibold text-emerald-400">{percent75}% ({study.read75})</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div style={{ width: `${percent75}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Right Column: CTA Click Performance */}
              <div className="lg:col-span-1">
                <section className="glass-panel p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-display">Tương tác Nút kêu gọi (CTA Clicks)</h3>
                    <div className="space-y-3">
                      {data.ctaClicks.map((cta) => (
                        <div key={cta.label} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-300 max-w-[180px] font-medium leading-normal">{cta.label}</span>
                          <span className="text-sm font-bold font-display text-gradient-emerald bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">
                            {cta.clicks} nhấp
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[10px] text-slate-500 text-center leading-relaxed mt-6">
                    Sự kiện được gửi ẩn danh và thu thập định kỳ thông qua bộ theo dõi TrackLink của ứng dụng.
                  </div>
                </section>
              </div>
            </div>
          ) : (
            /* Tab: Contacts List */
            <section className="space-y-4">
              {data.contacts.length === 0 ? (
                <div className="glass-panel p-12 text-center text-slate-500 text-xs">
                  Chưa có tin nhắn liên hệ nào được gửi tới hệ thống.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {data.contacts.map((contact) => (
                    <article key={contact.id} className="glass-panel p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white">{contact.sender}</span>
                            {contact.company && (
                              <span className="text-[10px] font-bold text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2 py-0.5 rounded">
                                {contact.company}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block font-mono">{contact.email}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">{contact.date}</span>
                      </div>

                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 font-medium">
                        "{contact.message}"
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
