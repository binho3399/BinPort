import { createClient } from "@supabase/supabase-js";

const supabaseUrl = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const supabaseAnonKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-id") &&
  !supabaseUrl.includes("mock-project");

const rawClient = isConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// Mock database storage in memory / localStorage for stable development
const MOCK_CREDENTIALS = {
  email: "admin@alexnguyen.design",
  password: "admin"
};

const getMockSession = () => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("mock_admin_session");
  return session ? JSON.parse(session) : null;
};

// Expose unified service helper
export const portalService = {
  isMock: !isConfigured,

  // AUTHENTICATION
  async login(email: string, password: string) {
    if (!isConfigured) {
      // Mock validation
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        const session = { user: { email }, expires_at: Date.now() + 3600 * 1000 };
        localStorage.setItem("mock_admin_session", JSON.stringify(session));
        return { data: { session }, error: null };
      }
      return { data: { session: null }, error: new Error("Tài khoản hoặc mật khẩu không chính xác.") };
    }

    try {
      const { data, error } = await rawClient!.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async logout() {
    if (!isConfigured) {
      localStorage.removeItem("mock_admin_session");
      return { error: null };
    }
    const { error } = await rawClient!.auth.signOut();
    return { error };
  },

  async getSession() {
    if (!isConfigured) {
      return { data: { session: getMockSession() }, error: null };
    }
    const { data, error } = await rawClient!.auth.getSession();
    return { data, error };
  },

  // DATABASE / ANALYTICS
  async getAnalyticsData() {
    if (!isConfigured) {
      // Return high-quality pre-populated mock analytical data for Alex's portfolio
      return {
        data: {
          pageViews: [
            { date: "14/05", views: 240 },
            { date: "15/05", views: 290 },
            { date: "16/05", views: 340 },
            { date: "17/05", views: 310 },
            { date: "18/05", views: 420 },
            { date: "19/05", views: 490 },
            { date: "20/05", views: 580 }
          ],
          readDepth: [
            { slug: "ai-assistant-workflow", read50: 142, read75: 98, total: 210 },
            { slug: "fintech-onboarding-revamp", read50: 184, read75: 125, total: 250 },
            { slug: "saas-pricing-discovery", read50: 95, read75: 62, total: 140 }
          ],
          ctaClicks: [
            { label: "Đặt lịch thảo luận dự án", clicks: 84 },
            { label: "Tải Hồ sơ Năng lực (CV)", clicks: 125 },
            { label: "Bắt đầu cuộc trò chuyện", clicks: 36 }
          ],
          contacts: [
            { id: "1", sender: "Nguyễn Văn Minh", company: "FintechX", email: "minh.nv@fintechx.vn", message: "Chào Alex, chúng tôi đang cần tìm thiết kế trưởng cho quy trình KYC mới của sản phẩm. Rất mong được hợp tác cùng bạn.", date: "20/05/2026 14:32" },
            { id: "2", sender: "Trần Thị Lan", company: "TechGrowth", email: "lan.tt@techgrowth.io", message: "Đọc qua bài viết chiến lược định giá SaaS của bạn thấy rất ấn tượng. Công ty mình muốn làm việc cùng bạn.", date: "19/05/2026 10:15" },
            { id: "3", sender: "Steve Pham", company: "AI Gen Labs", email: "steve@aigen.ai", message: "Chào bạn, AI Gen Labs đang phát triển một phân hệ trợ lý thông minh. Rất mong được trao đổi sâu hơn với bạn.", date: "18/05/2026 09:04" }
          ]
        },
        error: null
      };
    }

    try {
      // In production, fetch analytics events table from Supabase
      const viewsRes = await rawClient!.from("page_views").select("*");
      const readRes = await rawClient!.from("read_depth").select("*");
      const ctaRes = await rawClient!.from("cta_clicks").select("*");
      const contactsRes = await rawClient!.from("contacts").select("*").order("created_at", { ascending: false });

      return {
        data: {
          pageViews: viewsRes.data || [],
          readDepth: readRes.data || [],
          ctaClicks: ctaRes.data || [],
          contacts: contactsRes.data || []
        },
        error: viewsRes.error || readRes.error || ctaRes.error || contactsRes.error
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
};
