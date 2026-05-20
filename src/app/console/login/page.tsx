"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { portalService } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    portalService.getSession().then(({ data }) => {
      if (data?.session) {
        router.push("/console");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: loginError } = await portalService.login(email, password);

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else if (data?.session) {
      router.push("/console");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-panel p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-0.5 rounded">
            Khu vực Quản trị
          </span>
          <h1 className="text-2xl font-extrabold font-display text-gradient">Đăng nhập Bảng điều khiển</h1>
          <p className="text-slate-400 text-xs">Chỉ dành cho chủ sở hữu portfolio thiết kế.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Đăng nhập</label>
            <input
              type="email"
              placeholder="admin@alexnguyen.design"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-purple-500/60 text-sm text-white focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-purple-500/60 text-sm text-white focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 py-3 disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập Hệ thống"}
          </button>
        </form>

        {portalService.isMock && (
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Chế độ giả lập (Mock Mode)</span>
            <p>Hệ thống đang chạy giả lập vì chưa liên kết Supabase.</p>
            <p>• Email: <span className="text-slate-300 font-mono">admin@alexnguyen.design</span></p>
            <p>• Mật khẩu: <span className="text-slate-300 font-mono">admin</span></p>
          </div>
        )}
      </div>
    </main>
  );
}
