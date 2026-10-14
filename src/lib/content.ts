import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ContentKind = "posts" | "pages";

export interface ContentMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
}

export interface ContentEntry extends ContentMeta {
  /** Raw MDX body, without frontmatter. */
  body: string;
  kind: ContentKind;
}

/**
 * Content lives at the repository root, outside `src`, so posts never sit
 * next to route code. Everything is read at build/request time with `fs`;
 * the directory is part of the deployment artifact.
 */
const CONTENT_ROOT = path.join(process.cwd(), "content");

function dirFor(kind: ContentKind) {
  return path.join(CONTENT_ROOT, kind);
}

function normaliseDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

/** Reads and parses one MDX file. Returns null when the file is unreadable. */
function readEntry(kind: ContentKind, file: string): ContentEntry | null {
  const fullPath = path.join(dirFor(kind), file);
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    // Slug comes from frontmatter so that renaming a file never changes a URL.
    const slug =
      typeof data.slug === "string" && data.slug.length > 0
        ? data.slug
        : file.replace(/\.mdx?$/, "");

    return {
      kind,
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      date: normaliseDate(data.date),
      description: typeof data.description === "string" ? data.description : "",
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      draft: data.draft === true,
      body: content,
    };
  } catch {
    return null;
  }
}

/**
 * All entries of a kind, newest first.
 *
 * Drafts are excluded from production builds but visible in development, so
 * `npm run dev` shows work in progress without it ever shipping.
 */
export function getEntries(kind: ContentKind): ContentEntry[] {
  const dir = dirFor(kind);
  if (!fs.existsSync(dir)) return [];

  const includeDrafts = process.env.NODE_ENV !== "production";

  return fs
    .readdirSync(dir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => readEntry(kind, file))
    .filter((entry): entry is ContentEntry => entry !== null)
    .filter((entry) => includeDrafts || !entry.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getEntry(kind: ContentKind, slug: string): ContentEntry | null {
  return getEntries(kind).find((entry) => entry.slug === slug) ?? null;
}

export function getPosts(): ContentEntry[] {
  return getEntries("posts");
}

export function getPost(slug: string): ContentEntry | null {
  return getEntry("posts", slug);
}

/**
 * Unique tags across all posts, ignoring drafts.
 *
 * Uses Array.from rather than a spread because tsconfig targets ES5, where
 * iterating a Set requires --downlevelIteration.
 */
export function getPostTags(): string[] {
  const tags = new Set<string>();
  for (const post of getPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}
