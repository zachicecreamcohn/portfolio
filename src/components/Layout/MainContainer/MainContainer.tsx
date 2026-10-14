import React from "react";

/**
 * Layout wrapper for the site chrome.
 *
 * This used to be a client component holding the theme state and rendering a
 * floating ThemeSwitch button. The theme control now lives in the NavBar (a
 * more discoverable location than a floating bubble), and the theme state
 * moved to RootLayout. That leaves this as a pure wrapper — and, because it no
 * longer needs state, the whole layout tree can stay a server component.
 */
export default function MainContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
