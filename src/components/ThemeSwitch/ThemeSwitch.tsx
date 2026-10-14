"use client";

import React from "react";
import Image from "next/image";
import styles from "./ThemeSwitch.module.css";
import { useTheme } from "@/components/ThemeProvider/ThemeProvider";

/**
 * Cycles the site palette. Lives in the NavBar.
 *
 * The icon is a fixed white-stroke SVG, so no filter is applied — the previous
 * implementation inverted it (`filter: invert(100%)`), which made the glyph
 * nearly invisible in the dark palettes.
 */
export default function ThemeSwitch() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={styles.button}
      title="Change colour theme"
    >
      <Image
        src="/icons/paint-icon.svg"
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
      />
      <span className="sr-only">Change colour theme (current: {theme})</span>
    </button>
  );
}
