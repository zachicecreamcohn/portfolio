import React from "react";
import styles from "./Gallery.module.css";

export interface GalleryProps {
  children: React.ReactNode;
  /**
   * Minimum column width. Two columns is the practical maximum on a phone;
   * a 3+ column grid makes projection documentation illegible at that size.
   */
  min?: string;
  /** Set a uniform aspect-ratio for every item, to keep a series coherent. */
  ratio?: string;
  className?: string;
}

/**
 * A responsive grid for a series of images.
 *
 * Replaces the pre-refactor approach of emitting 8 hidden spacer elements per
 * grid (8 invisible <WorkPreview> cards on /design, 8 hidden <div>s on project
 * pages, and 5 hidden <TechnologyIcon>s per technology category) purely to
 * influence flex-wrap line breaking. CSS Grid does this natively.
 */
export default function Gallery({
  children,
  min = "18rem",
  ratio,
  className,
}: GalleryProps) {
  return (
    <div
      className={[styles.gallery, className].filter(Boolean).join(" ")}
      style={
        {
          "--gallery-min": min,
          ...(ratio ? { "--gallery-ratio": ratio } : {}),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
