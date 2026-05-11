import type { NextConfig } from "next";

const repoName = "BinPort";
const isProduction = process.env.NODE_ENV === "production";
// GitHub Pages project sites are served from /{repo}. Vercel (and previews) use the domain root.
const basePath =
  isProduction && !process.env.VERCEL ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
