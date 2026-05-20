export const siteConfig = {
  name: "Alex Nguyễn - Chuyên gia Thiết kế Sản phẩm Cao cấp",
  title: "Alex Nguyễn - Senior Product Designer & Vibe Coding",
  url: "https://alexnguyen.design",
  locale: "vi-VN",
  description:
    "Tôi thiết kế các sản phẩm kỹ thuật số có tác động cao và chuyển đổi ý tưởng thành trải nghiệm thực tế vượt trội bằng Vibe Coding.",
  email: "hello@alexnguyen.design",
  linkedIn: "https://linkedin.com/in/alexnguyen",
  cvUrl: "/assets/alex-nguyen-cv.pdf",
  hero: {
    headline: "Thiết kế sản phẩm tác động lớn. Vận hành siêu tốc bằng Vibe Coding.",
    subheadline:
      "Chuyên gia thiết kế sản phẩm cao cấp, tập trung vào chiến lược sản phẩm, định hướng thiết kế và xây dựng nguyên mẫu nhanh hỗ trợ bởi AI."
  },
  home: {
    trustLabel: "Được tin cậy bởi các đội ngũ phát triển sản phẩm từ 0 đến 1 và mở rộng quy mô đến hàng triệu người dùng.",
    trustStats: [
      { value: "8+", label: "Năm kinh nghiệm thiết kế" },
      { value: "30+", label: "Sản phẩm đã bàn giao" },
      { value: "12+", label: "Nhóm liên chức năng đã dẫn dắt" }
    ],
    primaryCta: {
      label: "Đặt lịch thảo luận dự án",
      href: "/contact",
      eventName: "home_hero_primary_cta_click"
    },
    secondaryCta: {
      label: "Tải Hồ sơ Năng lực (CV)",
      href: "/assets/alex-nguyen-cv.pdf",
      eventName: "home_hero_secondary_cta_click"
    },
    sections: {
      work: {
        title: "Dự án Nổi bật",
        description:
          "Các nghiên cứu điển hình được tuyển chọn minh chứng cho sự kết hợp giữa chiến lược, tư duy sản phẩm và năng lực thực thi."
      },
      capabilities: {
        title: "Năng lực Cốt lõi",
        description:
          "Cách tôi đồng hành cùng các đội ngũ từ giai đoạn khám phá, thực thi đến định hướng thiết kế chiến lược."
      },
      insights: {
        title: "Góc chia sẻ & Thử nghiệm",
        description:
          "Những bài viết và thử nghiệm mới nhất về hệ thống thiết kế (Design Systems), quy trình AI và các quyết định sản phẩm."
      },
      finalCta: {
        title: "Sẵn sàng kiến tạo những giá trị ý nghĩa?",
        description:
          "Tôi luôn cởi mở với các cơ hội dẫn dắt thiết kế sản phẩm và những dự án hợp tác chọn lọc chất lượng cao."
      }
    },
    finalCta: {
      primary: {
        label: "Bắt đầu cuộc trò chuyện",
        href: "/contact",
        eventName: "home_final_primary_cta_click"
      },
      secondary: {
        label: "Khám phá tất cả dự án",
        href: "/work",
        eventName: "home_final_secondary_cta_click"
      }
    }
  },
  valuePillars: [
    {
      title: "Tư duy Sản phẩm (Product Thinking)",
      description:
        "Đi từ thấu hiểu vấn đề đến xác định thứ tự ưu tiên, liên kết chặt chẽ với kết quả kinh doanh và giá trị thực sự cho người dùng."
    },
    {
      title: "Định hướng Thiết kế (Design Leadership)",
      description:
        "Thúc đẩy cộng tác liên chức năng, nâng cao chất lượng quyết định thiết kế và xây dựng hệ thống thiết kế có khả năng mở rộng."
    },
    {
      title: "Vibe Coding & Thực thi nhanh",
      description:
        "Xây dựng nguyên mẫu thử nghiệm cực nhanh để xác thực các ý tưởng rủi ro trước khi bước vào giai đoạn phát triển tốn kém."
    }
  ],
  audiences: [
    "Quản lý tuyển dụng và Trưởng bộ phận sản phẩm",
    "Nhà sáng lập tìm kiếm giải pháp sản phẩm toàn diện từ đầu đến cuối",
    "Khách hàng dự án tự do đang tìm kiếm chiến lược + thực thi xuất sắc"
  ],
  navigation: [
    { label: "Dự án", href: "/work" },
    { label: "Thử nghiệm", href: "/experiments" },
    { label: "Bài viết", href: "/writing" },
    { label: "Giới thiệu", href: "/about" },
    { label: "Liên hệ", href: "/contact" }
  ]
} as const;
