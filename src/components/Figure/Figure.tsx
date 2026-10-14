import React from "react";
import styles from "./Figure.module.css";
import { img, lqip, resolveId, srcSet } from "@/lib/images";

export interface FigureProps {
  /**
   * A Cloudflare Images id (`c0117235-b188-…`) OR a full imagedelivery.net URL
   * OR a local path such as `/images/headshot.png`.
   */
  src: string;
  alt: string;
  caption?: React.ReactNode;
  /**
   * CSS aspect-ratio, e.g. "3 / 2" or "16 / 9". Strongly recommended: without
   * it the browser cannot reserve space and the page shifts as images land,
   * which is the single worst thing you can do to a photography-heavy site.
   */
  ratio?: string;
  /** Fallback intrinsic size, used to derive height when `ratio` is absent. */
  width?: number;
  height?: number;
  /** Above-the-fold images should pass this so they are not lazy-loaded. */
  priority?: boolean;
  /** `sizes` attribute. Defaults to the prose measure. */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = "(max-width: 48rem) 100vw, 46rem";

export default function Figure({
  src,
  alt,
  caption,
  ratio,
  width = 1600,
  height,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}: FigureProps) {
  const cfId = resolveId(src);
  const resolvedHeight = height ?? Math.round(width / ratioToNumber(ratio));

  const classes = [styles.figure, className].filter(Boolean).join(" ");
  const frameClasses = [styles.frame, ratio ? styles.hasRatio : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={classes}>
      <div
        className={frameClasses}
        style={ratio ? ({ "--ratio": ratio } as React.CSSProperties) : undefined}
      >
        {cfId ? (
          <img
            className={styles.image}
            src={img(cfId)}
            srcSet={srcSet(cfId)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={resolvedHeight}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...(priority ? { fetchPriority: "high" as const } : undefined)}
            style={
              lqip(cfId)
                ? { backgroundImage: `url(${lqip(cfId)})` }
                : undefined
            }
          />
        ) : (
          /* Local assets are not on Cloudflare; render them directly rather
             than routing through the image CDN. */
          <img
            className={styles.image}
            src={src}
            sizes={sizes}
            alt={alt}
            width={width}
            height={resolvedHeight}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

/** "16 / 9" -> 1.777…; tolerates "16/9" and bare numbers. Returns 1.5 as a fallback. */
function ratioToNumber(ratio?: string): number {
  if (!ratio) return 1.5;
  const parts = ratio.split("/").map((part) => Number.parseFloat(part.trim()));
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 1.5;
  return parts[0] / parts[1];
}
