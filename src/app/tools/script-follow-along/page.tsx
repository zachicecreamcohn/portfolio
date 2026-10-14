import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MdxContent from "@/components/MdxContent/MdxContent";
import { getEntry } from "@/lib/content";
import styles from "./ScriptFollowAlong.module.css";

const SLUG = "script-follow-along-privacy";
const KIND = "pages" as const;

export const metadata: Metadata = {
  title: "Script Follow-Along",
  description:
    "Script Follow-Along is an iPad and Mac app that syncs your script with lighting, video, and sound cues.",
};

/**
 * This page used to be 52 lines of hand-written JSX prose styled by a
 * page-specific module. The prose is now an .mdx file rendered through the
 * shared <Prose> pipeline — which is the point of the content refactor:
 * long-form text is content, not component code.
 *
 * The module below now holds only the page chrome (the back link), not the
 * text styles. The public URL is unchanged.
 */
export default function ScriptFollowAlongPage() {
  const entry = getEntry(KIND, SLUG);
  const body = entry?.body ?? FALLBACK_BODY;

  return (
    <article>
      <p className={styles.backLink}>
        <Link href="/tools">← Tools</Link>
      </p>
      <h1>Script Follow-Along</h1>
      <MdxContent source={body} />
    </article>
  );
}

/* If the content file goes missing, say so rather than rendering nothing. */
const FALLBACK_BODY = `## Privacy Policy

The privacy policy content could not be loaded.`;

