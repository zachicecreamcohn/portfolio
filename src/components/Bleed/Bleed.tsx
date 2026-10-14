import React from "react";
import styles from "./Bleed.module.css";

/**
 * Escapes the prose measure so an image can run wider than the text column.
 *
 * This is the component that makes a writing-heavy page still read as a
 * portfolio: full-width imagery interspersed with a comfortable text measure.
 * It sizes to the page band (--page-max), so it stays aligned with the site
 * header rather than bleeding to the raw viewport edge.
 */
export default function Bleed({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.bleed, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
