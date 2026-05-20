"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Branding & Quick Actions */}
      <header className="w-full py-6 px-6 max-w-6xl mx-auto flex justify-between items-center z-40 relative">
        <Link href="/" className="font-display font-bold text-base md:text-lg text-white tracking-tight hover:text-purple-400 transition-all duration-300">
          Alex Nguyễn
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link 
            href="/console" 
            className="text-xs px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-slate-400 hover:text-white hover:border-purple-500/40 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
          >
            Bảng điều khiển
          </Link>
        </div>
      </header>

      {/* Floating Navigation Dock (2026 Spatial UI style) */}
      <div className="nav-dock-wrapper">
        <nav className="nav-dock" aria-label="Menu chính">
          {siteConfig.navigation.map((item) => {
            const isActive = pathname === item.href || (pathname && pathname.startsWith(item.href) && (item.href as string) !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-dock-link ${isActive ? "nav-dock-link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
