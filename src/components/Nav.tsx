import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Nav() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo">
          {siteConfig.name}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
