import "./globals.css";
import "./theming.css";
import "../../public/fonts/fonts.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import MainContainer from "@/components/Layout/MainContainer/MainContainer";
import NavBar from "@/components/NavBar/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { DEFAULT_THEME, isTheme } from "@/lib/theme";
import { getPosts } from "@/lib/content";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: {
    default: "Zach Cohn — Lighting & Projections Designer",
    template: "%s — Zach Cohn",
  },
  description:
    "Zach Cohn is an NYC-based lighting and projections designer for theatre and dance, and a software engineer.",
  metadataBase: new URL("https://zachwcohn.com"),
};

/**
 * Render everything on demand.
 *
 * This layout reads the theme cookie, which is a dynamic data source, so no
 * route in this app can actually be static — Next would otherwise pre-render
 * some routes and then throw DYNAMIC_SERVER_USAGE the moment an unlisted param
 * arrived (e.g. an unknown blog slug), returning a 500 instead of a 404.
 *
 * Declaring it explicitly makes the whole app consistent: every route renders
 * per request, and notFound() behaves correctly. The alternative is to stop
 * reading cookies here and let the blocking script set the theme client-side,
 * which restores static rendering at the cost of a brief flash of the default
 * palette. See the phase 3/4 notes in plans/styling-refactor.md.
 */
export const dynamic = "force-dynamic";

/**
 * The theme is applied as a class on <html> by the blocking script below,
 * BEFORE paint, to avoid a flash of the wrong palette. Reading the cookie here
 * too means the server-rendered markup already carries the right theme, so
 * there is nothing for React to correct on hydration.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieTheme = cookies().get("theme")?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  /*
   * Whether to show the Writing nav item. getPosts() applies the draft filter,
   * so in a production build this is false while every post is a draft — which
   * keeps an empty blog from advertising itself with a dead link. It has to be
   * resolved here because NavBar is a client component and cannot read the
   * filesystem.
   */
  const hasPosts = getPosts().length > 0;

  return (
    <html lang="en" className={initialTheme} suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=document.cookie.match(/(?:^|;\\s*)theme=([^;]*)/);if(t)document.documentElement.className=t[1]})()`,
          }}
        />
        <script
          defer
          src="https://umami.zachwcohn.com/script.js"
          data-website-id="ab92de79-1741-4644-a1f8-11a7cfc9bfd9"
        ></script>
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ThemeProvider initialTheme={initialTheme}>
          <MainContainer>
            <NavBar hasPosts={hasPosts} />
            <main id="main" className="page">
              {children}
            </main>
          </MainContainer>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-PPDRH7FT49" />
      </body>
    </html>
  );
}
