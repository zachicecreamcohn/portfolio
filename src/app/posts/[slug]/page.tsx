import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MdxContent from "@/components/MdxContent/MdxContent";
import { getPost, getPosts } from "@/lib/content";
import styles from "./Post.module.css";

interface Params {
  params: { slug: string };
}

/**
 * Enumerates posts at build time so the route is a known set of URLs rather
 * than an open-ended dynamic segment.
 */
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    /* Drafts must not be indexed even when previewing. */
    robots: post.draft ? { index: false, follow: false } : undefined,
  };
}

export default function PostPage({ params }: Params) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <article>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        {post.description && (
          <p className={styles.description}>{post.description}</p>
        )}
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.tags.length > 0 && (
            <span className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </span>
          )}
        </p>
      </header>

      <MdxContent source={post.body} />
    </article>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
