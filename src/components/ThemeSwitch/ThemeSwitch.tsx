"use client";

import React from "react";
import Image from "next/image";
import styles from "./ThemeSwitch.module.css";
import { useTheme } from "@/components/ThemeProvider/ThemeProvider";

/**
 * Cycles the site palette. Lives in the NavBar.
 *
 * The control shows the CURRENT theme at rest: the ring and icon take
 * --primary-text for the active palette, and the fill takes
 * --theme-button-background on hover. Previously it was transparent until
 * hovered, so it gave no indication of which theme was active — and because
 * the palettes differ mainly in an accent colour, clicking it on a page with
 * few accent elements looked like nothing had happened.
 *
 * The icon is a fixed white-stroke SVG, so it is rendered as a CSS mask and
 * painted with the theme colour instead of being inverted or tinted. That
 * keeps one colour that is known to pass contrast: --primary-text is 5.17:1 or
 * better on --bg in every theme.
 */
export default function ThemeSwitch() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={styles.button}
      aria-label={`Change colour theme. Current theme: ${theme}`}
    >
      <span
        className={styles.icon}
        style={
          {
            "--icon-src": "url(/icons/paint-icon.svg)",
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
      {/* Announced to screen readers when the theme changes. */}
      <span className="sr-only" aria-live="polite">
        {theme}
      </span>
    </button>
  );
}
