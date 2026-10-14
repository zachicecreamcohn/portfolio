import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import dbData from "../../public/data/db.json";

const BASE_URL = "https://zachwcohn.com";

/**
 * There was previously no sitemap at all. Routes are listed explicitly rather
 * than crawled, and blog posts and design project pages come from their own
 * data sources so new content appears automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/design", priority: 0.9 },
    { path: "/design/love-note-printer", priority: 0.5 },
    { path: "/tools", priority: 0.6 },
    { path: "/tools/script-follow-along", priority: 0.4 },
    { path: "/posts", priority: 0.8 },
    { path: "/contact", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  }));

  const posts = getPosts().map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.date ? new Date(`${post.date}T00:00:00Z`) : new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const projects = dbData.work
    .filter((project: { hidden?: boolean }) => !project.hidden)
    .map((project: { link: string }) => ({
      url: `${BASE_URL}${project.link}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...posts, ...projects];
}
