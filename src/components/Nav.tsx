import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Nav() {
  return (
    <header className="container">
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16
        }}
      >
        <Link href="/" style={{ textDecoration: "none", fontWeight: 700 }}>
          {siteConfig.name}
        </Link>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
