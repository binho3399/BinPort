import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { Nav } from "@/components/Nav";
import { siteConfig } from "@/config/site";
import "./globals.css";

const fontDisplay = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap"
});

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body suppressHydrationWarning>
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
