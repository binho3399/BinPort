import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Giới thiệu bản thân",
  description: "Tìm hiểu thêm về hành trình, kinh nghiệm và triết lý thiết kế của Alex Nguyễn."
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 pt-8 pb-20 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold font-display text-gradient">Về bản thân tôi</h1>
        <p className="text-slate-400 text-sm">Hành trình thiết kế sản phẩm kỹ thuật số, định hình trải nghiệm và ứng dụng công nghệ.</p>
      </div>

      <div className="space-y-6">
        {/* Card 1 */}
        <section className="glass-panel p-6 space-y-3">
          <h2 className="text-lg font-bold font-display text-purple-300">Công việc hiện tại</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tôi dẫn dắt các sáng kiến thiết kế sản phẩm từ định hình vấn đề (problem framing) đến kết quả thực tế bàn giao cho người dùng,
            đồng thời kết hợp phương pháp Vibe Coding để nhanh chóng xác thực các ý tưởng rủi ro ở giai đoạn sớm nhất.
          </p>
        </section>

        {/* Card 2 */}
        <section className="glass-panel p-6 space-y-3">
          <h2 className="text-lg font-bold font-display text-emerald-300">Phương pháp làm việc</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tôi kết hợp hài hòa giữa nghiên cứu khám phá (discovery), xây dựng hệ thống thiết kế có tính mở rộng cao (Design Systems) và thiết lập nguyên mẫu nhanh để thống nhất ý kiến trong nội bộ nhóm, giúp rút ngắn tối đa thời gian đưa ra quyết định sản phẩm quan trọng.
          </p>
        </section>

        {/* Card 3 */}
        <section className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-bold font-display text-white">Đối tượng hợp tác lý tưởng</h2>
          <div className="grid grid-cols-1 gap-3">
            {siteConfig.audiences.map((audience) => (
              <div 
                key={audience} 
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs mt-0.5 shrink-0 font-bold">
                  ✓
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{audience}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
