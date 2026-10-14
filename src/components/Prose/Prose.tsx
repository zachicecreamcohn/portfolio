import React from "react";
import styles from "./Prose.module.css";

/**
 * The long-form reading container.
 *
 * Every text-heavy surface on the site renders through this — blog posts,
 * portfolio case studies, the privacy policy. One element stylesheet instead
 * of per-page modules, which is what the pre-refactor site had (four separate
 * modules each re-declaring their own heading sizes, measures, and line
 * heights).
 *
 * The measure is capped here rather than on each page, and centring happens
 * here too, which fixes the old long-form layout: text was left-aligned inside
 * a centred 1170px Bootstrap container, leaving a ~420px dead gutter.
 */
export default function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.prose, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
