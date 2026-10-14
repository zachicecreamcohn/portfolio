"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { DEFAULT_THEME, THEMES, type Theme } from "@/lib/theme";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Advances to the next theme, wrapping around. */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(theme: Theme) {
  document.documentElement.className = theme;
  document.cookie = `theme=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * Owns theme state for the whole app.
 *
 * The theme is applied as a class on <html> by a blocking script in
 * RootLayout before paint, so the server-rendered markup must already carry
 * the right value. `initialTheme` is read from the cookie on the server and
 * passed in; this component keeps it in sync from then on.
 *
 * Note: types/constants live in `@/lib/theme` so that server components can
 * import them without crossing the client boundary.
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
    persist(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      persist(next);
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
