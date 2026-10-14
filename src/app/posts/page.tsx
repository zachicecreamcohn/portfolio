import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content";
import styles from "./Posts.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on projection design, lighting, and building tools.",
};

export default function PostsIndex() {
  const posts = getPosts();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Writing</h1>
        <p>
          Notes on projection design, lighting, and the software I build around
          them.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nothing published yet.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.item}>
              <Link
                href={`/posts/${post.slug}`}
                className={`link--headline ${styles.title}`}
              >
                {post.title}
              </Link>
              {post.description && (
                <p className={styles.description}>{post.description}</p>
              )}
              <p className={styles.meta}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.draft && <span className={styles.draft}>Draft</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
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
