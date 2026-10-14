/**
 * Theme constants and guards.
 *
 * Deliberately NOT in ThemeProvider.tsx: that file is marked "use client", and
 * a server component (RootLayout) importing a plain function from a client
 * module receives a client-reference stub rather than the function itself —
 * calling it throws "is not a function" at runtime while typechecking cleanly.
 * Pure values and predicates must therefore live in a server-safe module.
 */

export const THEMES = ["theme1", "theme2", "theme3", "theme4"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "theme1";

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" && (THEMES as readonly string[]).includes(value)
  );
}
