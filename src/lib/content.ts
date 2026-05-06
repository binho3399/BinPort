import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type {
  BaseFrontmatter,
  CaseStudyFrontmatter,
  CollectionName,
  ContentItem,
  ExperimentFrontmatter,
  WritingFrontmatter
} from "@/types/content";

const contentRoot = path.join(process.cwd(), "src/content");

function getCollectionDir(collection: CollectionName) {
  return path.join(contentRoot, collection);
}

function readMarkdownFiles(collection: CollectionName) {
  const dir = getCollectionDir(collection);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
}

function toContentItem<T extends BaseFrontmatter>(
  fullPath: string,
  fileName: string
): ContentItem<T> {
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as T,
    body: content.trim(),
    path: fileName.replace(".md", ""),
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes))
  };
}

export function getCollection<T extends BaseFrontmatter>(
  collection: CollectionName
): ContentItem<T>[] {
  return readMarkdownFiles(collection)
    .map((fileName) =>
      toContentItem<T>(path.join(getCollectionDir(collection), fileName), fileName)
    )
    .sort((a, b) =>
      a.frontmatter.publishedAt < b.frontmatter.publishedAt ? 1 : -1
    );
}

export function getCaseStudies() {
  return getCollection<CaseStudyFrontmatter>("case-studies");
}

export function getExperiments() {
  return getCollection<ExperimentFrontmatter>("experiments");
}

export function getWritingPosts() {
  return getCollection<WritingFrontmatter>("writing");
}

export function getContentBySlug(
  collection: CollectionName,
  slug: string
): ContentItem<BaseFrontmatter> | null {
  const items = getCollection<BaseFrontmatter>(collection);
  return items.find((item) => item.frontmatter.slug === slug) ?? null;
}
