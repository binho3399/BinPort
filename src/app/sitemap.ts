import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCaseStudies, getExperiments, getWritingPosts } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/experiments", "/writing", "/about", "/contact"];
  const now = new Date();

  const contentRoutes = [
    ...getCaseStudies().map((item) => `/case-studies/${item.frontmatter.slug}`),
    ...getExperiments().map((item) => `/experiments/${item.frontmatter.slug}`),
    ...getWritingPosts().map((item) => `/writing/${item.frontmatter.slug}`)
  ];

  return [...staticRoutes, ...contentRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
