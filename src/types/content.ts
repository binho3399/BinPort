export type CollectionName = "case-studies" | "experiments" | "writing";

export type BaseFrontmatter = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  featured?: boolean;
  publishedAt: string;
};

export type CaseStudyFrontmatter = BaseFrontmatter & {
  role: string;
  timeline: string;
  impact: string;
  tools: string[];
  visibility: "public" | "private";
  domain: string;
  capabilityTags: string[];
};

export type ExperimentFrontmatter = BaseFrontmatter & {
  hypothesis: string;
  buildScope: string;
  techStack: string[];
  demoUrl: string;
  repoUrl: string;
};

export type WritingFrontmatter = BaseFrontmatter & {
  readingMinutes?: number;
  topic: string;
};

export type ContentItem<T extends BaseFrontmatter> = {
  frontmatter: T;
  body: string;
  path: string;
  readingMinutes: number;
};
