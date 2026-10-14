"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export const THEMES = ["theme1", "theme2", "theme3", "theme4"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "theme1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Advances to the next theme, wrapping around. */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/**
 * Owns theme state for the whole app.
 *
 * The theme is applied as a class on <html> by a blocking script in
 * RootLayout before paint, so the server-rendered markup must already carry
 * the right value. `initialTheme` is read from the cookie on the server and
 * passed in; this component keeps it in sync from then on.
 */
export function ThemeProvider({
  initialTheme = DEFAULT_THEME,
  children,
}: {
  initialTheme?: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.className = next;
    document.cookie = `theme=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      document.documentElement.className = next;
      document.cookie = `theme=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
