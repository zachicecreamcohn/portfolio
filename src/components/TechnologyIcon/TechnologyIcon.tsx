import React from "react";
import styles from "./TechnologyIcon.module.css";

export interface TechnologyIconProps {
  children: React.ReactNode;
  labelText: string;
}

/**
 * A single technology glyph.
 *
 * The `spacer` prop is gone: it existed only to emit invisible icons that
 * pushed flex-wrap lines around, which CSS Grid now does properly (see
 * TechnologyList.module.css).
 */
export default function TechnologyIcon({
  children,
  labelText,
}: TechnologyIconProps) {
  return (
    <div className={styles.container} title={labelText}>
      <div className={styles.icon}>{children}</div>
    </div>
  );
}
