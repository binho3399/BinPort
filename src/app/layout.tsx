import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { siteConfig } from "@/config/site";
import "./globals.css";

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
    <html lang="en">
      <body>
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
