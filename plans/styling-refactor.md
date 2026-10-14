# Refactor Plan — Styling System + Long-Form Content Pipeline

**Goal:** Replace the ad-hoc styling with a token-based system, add a Markdown/MDX long-form content pipeline with a Cloudflare Images-backed image layer, and remove the dead code and layout hacks — while keeping the site shippable and `next build`-clean after every phase.

**Companion document:** [styling-summary.md](styling-summary.md) — the verified pre-refactor inventory. Every finding referenced below as `[audit §N]` is documented and verified there.

**Baseline facts this plan is built on:**
- `next build` exits 0 today; 11 routes, 9 static
- 19 CSS Modules + 3 global stylesheets = ~1,168 lines of hand-written CSS
- 32 untokenized hex values; 18 font sizes across 5 units
- Roboto referenced 10×, loaded 0×
- Bootstrap **v3.4.1** imported while `package.json` has **5.3.2**; 10+ BS5 utility classes are silent no-ops
- 69/69 content images already on Cloudflare Images (`imagedelivery.net`), variant `public`
- `public/images/` is **206 MB**; 32 of 33 files are referenced by nothing (only `headshot.png` is used)
- `.git` is 221 MB — images are in history
- Branch `main`, single author, one uncommitted file (`plans/styling-summary.md`)

---

## 1. Target Architecture

```
portfolio/
├── content/
│   ├── posts/                          # NEW — long-form essays
│   │   └── 2026-01-15-lighting-a-musical.mdx
│   └── pages/                          # NEW — prose that used to be JSX
│       └── script-follow-along-privacy.mdx
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # REWRITE — real page frame, no magic offsets
│   │   ├── globals.css                 # REWRITE — tokens + reset + fluid type
│   │   ├── theming.css                 # REWRITE — split primary, contrast-fixed
│   │   ├── sitemap.ts                  # NEW
│   │   ├── robots.ts                   # NEW
│   │   ├── feed.xml/route.ts           # NEW — RSS
│   │   ├── page.tsx                    # MIGRATE to new shell
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── design/…                    # unchanged routes
│   │   ├── dev/page.tsx
│   │   ├── posts/                      # NEW
│   │   │   ├── page.tsx                # index
│   │   │   └── [slug]/page.tsx         # post
│   │   └── tools/…
│   ├── components/
│   │   ├── NavBar/                     # REWRITE — sticky, mobile menu, complete links
│   │   ├── SiteFooter/                 # NEW — replaces the never-rendered Footer
│   │   ├── Prose/                      # NEW — the long-form element stylesheet
│   │   ├── Figure/                     # NEW
│   │   ├── Gallery/                    # NEW
│   │   ├── Split/                      # NEW
│   │   ├── Bleed/                      # NEW
│   │   ├── Media/                      # NEW
│   │   └── Lightbox/                   # NEW — native <dialog>
│   ├── lib/
│   │   ├── images.ts                   # NEW — Cloudflare URL/srcset builder
│   │   ├── content.ts                  # NEW — MDX read + frontmatter parsing
│   │   └── mdx.ts                      # NEW — the 5-plugin MDX config
│   └── mdx-components.tsx              # NEW — component map for MDX
└── package.json                        # -bootstrap -next-fonts +mdx deps
```

**Stack stays the same:** Next.js 14 App Router, TypeScript, CSS Modules, static generation. No Tailwind, no CMS, no CSS-in-JS, no database. Cost remains $0.

---

## 2. Phase 0 — Baseline & Safety Net

**Ships:** nothing user-visible. **Risk:** none.

| # | Task | Detail |
|---|---|---|
| 0.1 | Commit current state | `plans/styling-summary.md` is untracked. Commit it as the pre-refactor baseline so the refactor diffs against something. |
| 0.2 | Capture a visual baseline | For each route, screenshot at 375 / 768 / 1440 px (browser devtools or Playwright). Store in `plans/baseline/`. **This is the only way to catch unintended visual regressions** across 5 phases. |
| 0.3 | Tag the baseline | `git tag pre-styling-refactor` |
| 0.4 | Confirm the build command | `npm run build` = `next build`; `vercel.json` is trivial. No change needed. |
| 0.5 | Branch | `git switch -c refactor/styling-and-content` |

**Verify:** `git status` clean; screenshots exist for all 11 routes.

---

## 3. Phase 1 — Tokens, Type Scale, and the Fixes With No Design Decisions

**Ships:** visibly better contrast and type; nothing moves. **Risk:** low. **This is the highest value-per-hour phase.**

### 1.1 `globals.css` — full rewrite

Replace the 69-line file with a token layer + reset + fluid type scale + focus styles.

```css
:root {
  /* ---- type: one ramp, fluid, no breakpoints ---- */
  --step--1: clamp(0.875rem, 0.84rem + 0.18vw, 0.95rem);
  --step-0:  clamp(1.0625rem, 1.02rem + 0.22vw, 1.1875rem);
  --step-1:  clamp(1.25rem,  1.18rem + 0.35vw, 1.5rem);
  --step-2:  clamp(1.5rem,   1.36rem + 0.70vw, 1.9rem);
  --step-3:  clamp(1.9rem,   1.65rem + 1.25vw, 2.6rem);
  --step-4:  clamp(2.4rem,   1.95rem + 2.25vw, 3.6rem);

  --leading-tight: 1.15;   /* headings */
  --leading-body:  1.65;   /* long-form copy */
  --leading-ui:    1.35;   /* buttons, nav, labels */

  /* ---- space: 4px base ---- */
  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;    --space-5: 1.5rem;  --space-6: 2rem;
  --space-7: 3rem;    --space-8: 4rem;    --space-9: 6rem;

  /* ---- geometry ---- */
  --page-max: 76rem;
  --page-pad: clamp(1.25rem, 4vw, 4rem);
  --measure:  68ch;
  --nav-h:    4rem;

  --radius-sm: 0.375rem; --radius-md: 0.75rem; --radius-lg: 1rem; --radius-full: 9999px;

  /* ---- surfaces (dark) ---- */
  --bg: #181a1b;
  --surface-1: #1f2224;
  --surface-2: #26292b;
  --border: #303436;
  --text: #e8e8e8;        /* 14.25:1 on --bg — verified */
  --text-muted: #b9b9b9;  /*  8.90:1 on --bg — verified */
  --text-subtle: #8a8a8a;

  --z-nav: 100;
  --z-overlay: 200;
}

/* reset */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body, h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd { margin: 0; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: var(--step-0);
  line-height: var(--leading-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 { font-family: var(--font-display), system-ui, sans-serif;
                 line-height: var(--leading-tight); color: var(--text); }
h1 { font-size: var(--step-4); }
h2 { font-size: var(--step-3); }
h3 { font-size: var(--step-2); }
h4 { font-size: var(--step-1); }

a { color: var(--primary-text); text-decoration-thickness: 1px; text-underline-offset: 2px; }

/* the page frame — the ONLY thing that owns page geometry */
.page {
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--page-pad);
  padding-block: var(--space-7) var(--space-9);
}

/* focus: site-wide, was entirely absent */
:focus-visible {
  outline: 2px solid var(--primary-text);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Deleted from `globals.css`:** `*:not(p)` (the specificity bug `[audit §4.3]`), `p, a { line-height: 3rem }` (the 2.57 ratio `[audit §4.5]`), `body { padding: 3em 3em 20px }` and its media query, `body { overflow-x: hidden }`, `a { text-decoration: none !important }`.

**Kept, restyled:** `.animate-hover` becomes a proper `a` underline treatment (or is deleted if the new link styling supersedes it — decide in Phase 3).

### 1.2 `theming.css` — contrast fix

The single most impactful change. `--z-primary: #8c0800` scores **1.79:1** as text `[audit §3.1]`. Split the token:

```css
.theme1 {
  --primary:      #8c0800;  /* FILLS only — 6.85:1 with #d8d8d8 text */
  --primary-text: #e8604f;  /* TEXT/links/headings — 5.17:1 */
  --text-shadow:  #fac852;
}
.theme2 { --primary: #0a8ece; --primary-text: #4bb8ea; }  /* 4.80 -> 7.77 */
.theme3 { --primary: #4c956c; --primary-text: #7fbf9a; }  /* 4.84 -> 8.17 */
.theme4 { --primary: #ff7800; --primary-text: #ffa04d; }  /* 6.60 -> 8.64 */
```

Also: fix the duplicate `--z-secondary` in `.theme2` `[audit §3.2]`, delete the 5 dead tokens (`--secondary-box-shadow`, `--secondary-box-shadow-hover`, `--z-third`, `--z-icon`, `--light-border`), and keep `--z-primary`/`--z-gray` as **aliases** so the 18 existing `var()` call sites keep working during migration.

> ⚠️ **Load-order dependency — do not reorder the imports in `layout.tsx`.** `.theme1 { --primary-text: … }` must override `:root { --text: … }`. `.theme1` is `(0,1,0)` and `:root` is `(0,1,0)` — a **specificity tie**, so source order decides. `theming.css` is currently imported *after* `globals.css`, which is why this works. If the imports are ever swapped, every theme silently falls back to the `:root` defaults. Add a comment in both files noting the dependency.

> **Token naming note:** split by *role*, not by *theme*. `--primary` = fills/backgrounds; `--primary-text` = anything drawn as text, an icon, or a border. Today `var(--z-primary)` is used for both, which is exactly the bug. During Phase 1, leave the 10 existing `var(--z-primary)` call sites alone where they are **fills** (e.g. `Button.primary` background), and change only the ones that are **text** (NavBar active link, `.title`, `.section h2`, `.experienceSection h2`, WorkPreview title, hero `.color`, `.animate-hover:after`).

### 1.3 Font loading

```tsx
// layout.tsx
import { Inter } from "next/font/google";
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
```

Retire the last Roboto reference. Decide Oceanwide's role: **display/headings only**. Note weight 600 is the only weight — avoid `<strong>` inside prose (faux-bold) or add a second weight `[audit §4.2]`.

### 1.4 Layout shell (`layout.tsx` + `MainContainer`)

- `MainContainer` `margin-top: 6em` **deleted** — sticky nav reserves its own space `[audit §5.1]`
- `body` padding **deleted**; `.page` owns geometry
- Nav becomes `position: sticky; top: 0; height: var(--nav-h)`

### 1.5 Bootstrap decision

`npm uninstall bootstrap` and delete `src/bootstrap.min.css` (`[audit §2.1]`, `[audit §6]`). It's v3.4.1; the code uses v5 class names that don't exist. Only ~8 classes are actually in play (`container`, `row`, `col-sm-7`, `col-lg-6`, `col-xs-12`) plus the 10 no-ops. All are replaced by `.page` + simple flex/grid.

> ⚠️ **Do 1.5 last within this phase**, after 1.1–1.4, so there's a working fallback while the grid classes are still being replaced.

**Verify Phase 1:** `next build` clean; every route screenshots at 375/768/1440 and compares against `plans/baseline/`; theme1 links/headings visibly readable; no horizontal scrollbar at 320px.

---

## 4. Phase 2 — Navigation, Footer, Mobile

**Ships:** fixed navigation and mobile usability. **Risk:** low-medium (nav is the highest-traffic component).

| # | Task | Detail |
|---|---|---|
| 2.1 | NavBar rewrite | Sticky, `height: var(--nav-h)`. Brand/name on the left. Links: **Home, About, Design, Dev, Tools** — `/dev` and `/tools` exist and are **not linked today** `[audit §7.1]` |
| 2.2 | Mobile menu | The Contact CTA is `display: none` under 768px today `[audit §7.1]` — the primary CTA is unreachable on mobile. Replace with a real disclosure (`<details>` or a button + panel), all targets `min-height: 44px` |
| 2.3 | Contact CTA | Always visible in the nav; `min-height: 44px` |
| 2.4 | SiteFooter | The current `Footer` is imported in `layout.tsx` and **never rendered** `[audit §7.7]`. Build a real one, rendered in `layout.tsx` |
| 2.5 | Delete dead Footer | `git rm src/components/Footer/` and its module |
| 2.6 | `buttons` | Remove fixed `height: 55px` in favour of `min-height: 44px` + padding `[audit §7.2]` |
| 2.7 | Skip link | `<a href="#main" class="skip-link">` as the first focusable element |

**Verify:** keyboard-only tab through nav from the top — visible focus everywhere, skip link works, mobile menu opens/closes with Escape, no tap target under 44px.

---

## 5. Phase 3 — The Image Layer

**Ships:** nothing visible alone, but everything downstream depends on it. **Risk:** medium.

### 3.1 Cloudflare URL builder

```ts
// src/lib/images.ts
const ACCOUNT = "jz7aVQ2qyRcSQ0bsKclVwA";
const BASE = `https://imagedelivery.net/${ACCOUNT}`;

export const CF_WIDTHS = [480, 800, 1200, 1600] as const;

export const img = (id: string, variant = "public") => `${BASE}/${id}/${variant}`;

export const srcSet = (id: string, widths = CF_WIDTHS) =>
  widths.map((w) => `${BASE}/${id}/w=${w},q=82,format=auto ${w}w`).join(", ");

/** Proportional LQIP — Cloudflare can serve a tiny blurred placeholder. */
export const lqip = (id: string) => `${BASE}/${id}/w=32,blur=1000,format=auto`;
```

> **3.1a — Verify flexible variants first.** Open one known image ID with `?w=480` / `/w=480` in a browser and confirm it returns a resized image. Flexible variants may need enabling in the Cloudflare dashboard. If unavailable, fall back to creating 3–4 **named** variants (`card`, `wide`, `full`) and have `srcSet` compose those instead. **This is the one external unknown in the plan — resolve it before building components on top.**

### 3.2 Image delivery decision (important)

**Do not route Cloudflare URLs through `next/image`'s optimizer.** That double-optimizes: Cloudflare transforms, then Vercel transforms again and consumes the *metered* Vercel image quota. Cloudflare already does `format=auto` (WebP/AVIF) and resizing.

Use a plain `<img>` with explicit `srcSet`/`sizes`/`aspect-ratio` (optionally via a small `<SmartImage>` wrapper). Keep `next/image` for the handful of **local** assets (`/images/headshot.png`).

Also: `next.config.js` uses the deprecated `images.domains`. Replace with `remotePatterns` for `imagedelivery.net` and the DigitalOcean Spaces host `[audit §8.9]`. Note `sharp` is already a dependency, which benefits local optimization only.

### 3.3 `<Figure>` — the workhorse

```tsx
<Figure
  id="c0117235-b188-4fc9-4126-223407e79400"
  alt="Front elevation, week one"
  caption="Stardust, 92NY — front elevation after the first tech"
  ratio="16 / 9"
  priority
/>
```

Requirements: `srcSet` + `sizes` (default `(max-width: 768px) 100vw, 760px`), `width`/`height` **and** `aspect-ratio` to guarantee zero CLS, `loading="lazy"` unless `priority`, `decoding="async"`, LQIP background, `<figcaption>`.

**This is the fix for `[audit §5.3]`/`[audit §8.1]`:** the current hardcoded `600×350` / `350×219` containers letterbox every projection photo into one shape, and the raw `<img width={1000} height={1000}>` tags declare a square for every image regardless of true dimensions.

### 3.4 `Prose` image rules

```css
.prose img { display: block; width: 100%; height: auto;
             border-radius: var(--radius-md); margin-block: var(--space-6); }
```

So plain Markdown `![alt](url)` renders correctly with no component. Captions require `<Figure>` — Markdown has no caption syntax. Accept both; don't build a Markdown preprocessor.

### 3.5 Lightbox

Native `<dialog>` + `showModal()`, ~30 lines, zero dependencies, keyboard-accessible, free `::backdrop`. Avoid a lightbox package.

### 3.6 Repo cleanup — ⚠️ read this carefully

32 of 33 files in `public/images/` are unreferenced `[audit §2.1]`; the tree is 206 MB and `.git` is 221 MB.

**Recommended: forward-only deletion.**
```bash
git rm -r --cached public/images
rm -rf public/images
git checkout HEAD -- public/images/headshot.png   # the one file actually used
```
This reclaims the working tree and stops the bleed. History still carries ~206 MB.

**Optional and irreversible: history rewrite with `git filter-repo`.** This rewrites **every commit hash** on `main`. You're a single author on `main`, so the blast radius is small — but:
- **Back up first:** `git clone --mirror . ../portfolio-backup.git`
- Any open PR, fork, or external reference to a commit SHA breaks
- Vercel will do a full rebuild; if your project has "Ignored Build Step" or pinned SHAs configured, re-check it
- **Do it before ingesting more photos**, not after

I'd treat this as a **separate, deliberate task** with its own confirmation — not a sub-step of an image-component commit. Disk space is not currently a problem; a 221 MB `.git` is untidy but harmless.

**Verify Phase 3:** one image ID renders at 4 widths (inspect `srcset` in devtools, confirm Cloudflare serves WebP/AVIF); Lighthouse CLS = 0 on a page with images; `next build` clean.

---

## 6. Phase 4 — The Content Pipeline

**Ships:** long-form posts. **Risk:** medium (new dependencies).

### 4.1 Dependencies (keep this list short — every one is maintenance)

```
next-mdx-remote        # compile MDX in server components
gray-matter            # frontmatter
remark-gfm             # tables, task lists, autolinks
rehype-slug            # heading ids
rehype-autolink-headings
rehype-pretty-code + shiki   # build-time highlighting, zero client JS
```

**Pin the versions.** MDX/remark/rehype ecosystems churn; this is the one part of the stack with real upgrade risk `[audit §8.9]`. Add Dependabot with a monthly cadence and read changelogs before merging.

### 4.2 Content format

```mdx
---
title: "Projection mapping a 400-seat house on a budget"
slug: "projection-mapping-on-a-budget"
date: 2026-01-15
description: "What I learned mapping Stardust with two projectors and no budget."
tags: [projection, workflow]
draft: false
---

Two projectors, one [MadMapper](https://madmapper.com) license, and a venue
that wouldn't let me hang anything from the grid.

## The constraint that shaped everything

<Figure id="..." alt="..." caption="Front elevation, week one" ratio="16 / 9" />

<Bleed><Figure id="..." alt="..." ratio="21 / 9" /></Bleed>
```

Slugs come from **frontmatter**, not filenames — so renaming a file never changes a URL.

### 4.3 Types — two content types, deliberately separate

```ts
// Gallery-shaped: images are primary
export type Project = { /* existing shape, unchanged */ };

// Prose-shaped: text is primary, media supplementary
export type Post = {
  slug: string; title: string; date: string;
  description: string; tags: string[]; draft?: boolean;
  body: string;
};
```

Do **not** merge these. A gallery item and an essay want different layouts, metadata, and index pages `[audit §7.9]`.

### 4.4 Routes

| Route | Notes |
|---|---|
| `/posts` | Index, sorted by `date` desc, `draft` filtered at build |
| `/posts/[slug]` | `generateStaticParams` from `fs.readdirSync(content/posts)`; `generateMetadata` from frontmatter; body inside `<Prose>` |
| `/dev` | Existing page unchanged this phase |

`fs` reads are fine — everything is statically generated at build, so the content directory (part of the build artifact) is available at both build and request time.

### 4.5 The unification move

Convert `src/app/tools/script-follow-along/page.tsx` (54 lines of JSX prose) into `content/pages/script-follow-along-privacy.mdx` rendered through the same `<Prose>` component, **keeping the same URL**. This is the proof-of-concept on real content and de-risks everything downstream before you commit to the format.

### 4.6 SEO plumbing (currently entirely absent)

`[audit §9]` — no `sitemap.ts`, no `robots.ts`, no RSS, no per-page metadata; every page inherits one site-wide title.

| File | Purpose |
|---|---|
| `src/app/sitemap.ts` | All routes incl. posts and design slugs |
| `src/app/robots.ts` | Allow all, point at sitemap |
| `src/app/feed.xml/route.ts` | RSS from `content/posts` |
| per-route `generateMetadata` | `title`, `description`, `openGraph` from frontmatter |

**Verify Phase 4:** `next build` reports the new static routes; `/posts` lists the post; the post renders with working links and `<Figure>`s; RSS validates; `<title>` differs per page.

---

## 7. Phase 5 — Remaining Layout Components & De-duplication

**Ships:** the visual polish. **Risk:** low.

| # | Task |
|---|---|
| 5.1 | `<Gallery>` — grid with a `ratio` prop for series coherence; **2 columns max on mobile**; `object-fit: cover` for grids, `contain` only for screenshots/diagrams |
| 5.2 | `<Bleed>` — escapes the text measure: `width: min(100vw - 2rem, 72rem); margin-inline: calc(50% - min(50vw - 1rem, 36rem))` |
| 5.3 | `<Split>` — side-by-side comparisons |
| 5.4 | `<Media>` — video/GIF for projections work; replaces the styling-free `<Video>` (`[audit §7.8]`) |
| 5.5 | **Merge the two `SpecificWork.module.css`** (114 + 115 lines, ~95% identical) into one shared module `[audit §7.9]` |
| 5.6 | Replace **spacer hacks** with Grid: 8 hidden `WorkPreview` cards, 8 hidden `imageContainer` divs, 5 hidden `TechnologyIcon`s per category `[audit §8.2]` |
| 5.7 | Delete remaining `!important` by dropping them or setting dimensions via props `[audit §8.1]` |
| 5.8 | Remove `@media (max-width: 708px)` orphan `[audit §5.4]` |
| 5.9 | Consolidate the 5× `calc(1.375rem + 1.5vw)` page `<h1>` into the shared scale |
| 5.10 | Delete `src/app/page.module.css` (0 bytes) and remaining dead classes: `.heroImage`, `.theater-icon`, `.cvContainer`, `.iconsContainer`, `.right .proficiencyHeader h2:nth-of-type(2)` `[audit §2.2]` |

**Verify:** the design grid and project pages match the baseline screenshots (minus intended changes); no `!important` remains in hand-written CSS; `npx stylelint` (if added) clean.

---

## 8. Phase 6 — Optional: Migrate the Portfolio to Markdown

**Ships:** richer case studies. **Risk:** medium. **Explicitly optional and separable.**

The 16 projects live in `public/data/db.json` with **2,363 characters of prose total** (`paragraphs` empty on 13 of 16). That schema is a gallery: an images array plus a one-sentence caption. There's nowhere to put a long-form case study.

Migrate `db.json` → `content/work/*.mdx` (frontmatter keeps `link`, `title`, `blurb`, `images`; body becomes real prose with `<Figure>`/`<Gallery>`).

**Keep `/design/<slug>` URLs identical** — they're indexed and may be linked externally. Only the data source and richness change.

**Gate:** don't start this until `/posts` has been live with real content for a while. It's only worth doing if you actually want case studies. The blog works without it.

---

## 9. File Disposition Map

| Current file | Action |
|---|---|
| `src/app/globals.css` | **Rewrite** (Phase 1) |
| `src/app/theming.css` | **Rewrite** (Phase 1) — split primary, drop 5 dead tokens |
| `src/bootstrap.min.css` | **Delete** (Phase 1.5) |
| `src/app/layout.tsx` | **Rewrite** (Phase 1.4, 2.4) |
| `src/components/Layout/MainContainer/*` | **Simplify** — drop `margin-top: 6em` (Phase 1.4) |
| `src/components/Layout/TopContainer/*` | **Keep** — used by Home + About only |
| `src/components/NavBar/*` | **Rewrite** (Phase 2.1–2.2) |
| `src/components/Footer/*` | **Delete** (Phase 2.5) |
| `src/components/SiteFooter/` | **New** (Phase 2.4) |
| `src/components/Button/*` | **Edit** — `min-height` (Phase 2.6) |
| `src/lib/images.ts` | **New** (Phase 3.1) |
| `src/components/Prose/*` | **New** (Phase 3.4, 4.5) |
| `src/components/Figure/*` | **New** (Phase 3.3) |
| `src/components/Lightbox/*` | **New** (Phase 3.5) |
| `src/components/Gallery|Split|Bleed|Media/*` | **New** (Phase 5) |
| `src/lib/content.ts`, `src/lib/mdx.ts`, `src/mdx-components.tsx` | **New** (Phase 4) |
| `src/app/posts/` | **New** (Phase 4.4) |
| `src/app/sitemap.ts`, `robots.ts`, `feed.xml/` | **New** (Phase 4.6) |
| `src/app/tools/script-follow-along/page.tsx` | **Convert to MDX** (Phase 4.5), same URL |
| `src/app/page.module.css` | **Delete** (0 bytes, Phase 5.10) |
| `src/app/Home.module.css` | **Edit** — drop `.heroImage`, `.theater-icon`, unused `.container` (Phase 5.10) |
| `src/app/about/About.module.css` | **Edit** — drop `.cvContainer` (Phase 5.10) |
| `src/app/design/[slug]/SpecificWork.module.css` | **Merge** with the dev copy (Phase 5.5) |
| `src/app/dev/love-note-printer/SpecificWork.module.css` | **Delete** after merge (Phase 5.5) |
| `src/components/WorkPreview/*` | **Edit** — Grid instead of spacers (Phase 5.6) |
| `src/components/TechnologyList|Icon/*` | **Edit** — drop spacer hack (Phase 5.6) |
| `src/components/Video/Video.tsx` | **Delete** — unused, replaced by `<Media>` |
| `src/components/ThemeSwitch/*` | **Edit** — add `aria-label`, focus style (Phase 2) |
| `public/icons/devicon.min.css` | **Delete** — 53 KB, never referenced |
| `public/images/` (32 of 33 files) | **Delete** (Phase 3.6) |
| `public/data/db.json` | **Keep** (Phase 6 migrates it, optionally) |
| `next.config.js` | **Edit** — `remotePatterns`, drop deprecated `next-fonts` `[audit §8.9]` |
| `package.json` | **Edit** — `-bootstrap`, `-next-fonts`, `+` 6 content deps |

---

## 10. Verification Protocol

Run after **every** phase — this is what keeps the site shippable:

1. `npx next build` → **exit 0**, no new warnings
2. Screenshot all routes at **375 / 768 / 1440 px**, diff against `plans/baseline/`
3. **No horizontal scrollbar at 320px** (check `document.documentElement.scrollWidth <= clientWidth`)
4. **Keyboard-only tab pass** — visible focus on every interactive element
5. Lighthouse: CLS **0**, LCP < 2.5s on `/` and a post
6. `grep -r '!important' src/ --include=*.css` → decreasing to zero
7. No `var(--…)` reference without a definition

---

## 11. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| **Cloudflare flexible variants may be disabled** | Task 3.1a verifies a real URL before anything is built on it. Fallback: named variants. **The only external unknown.** |
| `git filter-repo` rewrites all history | Treated as a separate, deliberate task with a `--mirror` backup. Deferred out of the main path. |
| MDX/remark dependency churn | 6 pinned deps, Dependabot monthly, changelogs read before merge. |
| Phase 1 changes every page at once | Baseline screenshots + Phase 1 is additive (aliases keep old `var()` names working). |
| Bootstrap removal breaks a layout | Only ~8 real classes in play; do 1.5 last within Phase 1. |
| NavBar rewrite regresses navigation | Highest-traffic component; explicit keyboard + mobile verification. |

**Open questions to resolve as we go:**
- Does `.animate-hover` survive, or does the new link styling replace it? (Phase 1/3)
- Add a second Oceanwide weight, or avoid `<strong>` in prose? (Phase 1.3)
- Should `/dev` become Markdown content rather than a hand-written page? (Phase 4/6)
- Light mode — deferred to a possible Phase 7; long-form in a dark theme is harder to read outdoors, but it's not a Phase 1 concern.

---

## 12. Sequencing Summary

| Phase | Ships | Risk | Depends on |
|---|---|---|---|
| **0** Baseline & safety net | — | none | — |
| **1** Tokens, type scale, contrast, Bootstrap out | Immediate readability + contrast | low | 0 |
| **2** Nav, footer, mobile | Working mobile navigation | low-med | 1 |
| **3** Image layer | (enables 4–5) | med | 1 |
| **4** Content pipeline + SEO | **Long-form posts** | med | 3 |
| **5** Layout components, de-dup, dead code | Visual polish | low | 3, 4 |
| **6** Portfolio → Markdown *(optional)* | Richer case studies | med | 4 |

Phases 1 and 3 are fully independent and can be done in either order or in parallel (Phase 3 touches only new files plus `next.config.js`). Phase 2 depends on 1. Phase 4 depends on 3. Phase 5 depends on 3 and 4. Phase 6 depends on 4. **The site is shippable at the end of every phase.**
