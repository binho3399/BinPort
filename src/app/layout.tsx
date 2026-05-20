import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Nav } from "@/components/Nav";
import { siteConfig } from "@/config/site";
import "./globals.css";

const fontDisplay = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website"
  },
  alternates: { canonical: siteConfig.url }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Senior Product Designer",
    description: siteConfig.description,
    url: siteConfig.url,
    sameAs: [siteConfig.linkedIn]
  };

  return (
    <html lang="vi" className={`${fontSans.variable} ${fontDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="antialiased min-h-screen text-slate-100 pb-24" suppressHydrationWarning>
        {/* Animated background auroras */}
        <div className="aurora-container">
          <div className="aurora-blob-1"></div>
          <div className="aurora-blob-2"></div>
          <div className="aurora-blob-3"></div>
        </div>

        <Nav />
        {children}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
