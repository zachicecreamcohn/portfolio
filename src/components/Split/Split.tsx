import React from "react";
import styles from "./Split.module.css";

/**
 * Two items side by side — before/after, cue sheet and stage photo, or a
 * comparison. Stacks on narrow screens rather than shrinking both.
 */
export default function Split({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.split, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
