import type { Metadata } from "next";
import { TrackLink } from "@/components/TrackLink";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Liên hệ làm việc",
  description: "Bắt đầu cuộc trò chuyện cùng Alex Nguyễn về dự án thiết kế sản phẩm tiếp theo của bạn."
};

export default function ContactPage() {
  return (
    <main className="max-w-xl mx-auto px-6 pt-8 pb-20 space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-4 text-center">
        <h1 className="text-3xl font-extrabold font-display text-gradient">Kết nối làm việc</h1>
        <p className="text-slate-400 text-sm">Hợp tác xây dựng sản phẩm chất lượng cao và giải pháp thiết kế đột phá.</p>
      </div>

      <section className="glass-panel p-8 space-y-6 relative overflow-hidden text-center flex flex-col items-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
          Tôi luôn sẵn sàng đón nhận các cơ hội làm việc toàn thời gian, vai trò tư vấn chiến lược và các dự án thiết kế sản phẩm chọn lọc.
        </p>

        <div className="flex flex-col gap-4 w-full pt-4">
          <TrackLink
            href={`mailto:${siteConfig.email}`}
            label={`Gửi thư: ${siteConfig.email}`}
            eventName="click_contact_email"
            variant="primary"
          />
          <TrackLink
            href={siteConfig.linkedIn}
            label="Hồ sơ LinkedIn cá nhân"
            eventName="click_contact_linkedin"
            variant="secondary"
          />
        </div>
        
        <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 w-full">
          Phản hồi trung bình trong vòng 24-48 giờ làm việc.
        </div>
      </section>
    </main>
  );
}
