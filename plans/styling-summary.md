# Styling Summary — Portfolio Site (Pre-Refactor Baseline)

**Date:** baseline captured from current working tree
**Purpose:** Document the styling system exactly as it exists today, so the styling refactor has a verified inventory of rules, themes, fonts, tokens, and structural problems.
**Verification:** `npx next build` exits **0**. Compiled CSS was inspected in `.next/static/css/` to confirm every claim marked **[verified]**.

---

## 1. Executive Summary

The site is a **Next.js 14 App Router** project styling itself with **four parallel, overlapping systems** that were never reconciled:

| # | System | Mechanism | Status |
|---|--------|-----------|--------|
| 1 | Global CSS | `src/app/globals.css` (element selectors + 3 utility classes) | Active, but contains a specificity bug |
| 2 | CSS Modules | 19 `*.module.css` files, scoped per component/page | Active — primary system |
| 3 | Theme tokens | `src/app/theming.css` — 4 theme classes of CSS custom properties | Active, 5 of 12 tokens unused |
| 4 | Bootstrap | `src/bootstrap.min.css` (**v3.4.1**) + `bootstrap@5.3.2` in `package.json` | **Broken — version mismatch** |

### The five highest-impact findings

1. **Roboto is referenced 10× but is never loaded.** Only Oceanwide has `@font-face` rules. All body copy silently falls back to the browser default sans-serif. **[verified: only 2 `@font-face` declarations exist in compiled CSS, both Oceanwide]**
2. **Bootstrap v3.4.1 CSS is imported, but the code uses Bootstrap 5 class names.** `.d-flex`, `.mb-3`, `.mt-1`, `.justify-content-center`, and `.col-12` are used in JSX but **do not exist** in the compiled output — they are silent no-ops. **[verified]**
3. **`.container` from Bootstrap 3 forces a fixed `width: 750px` at `≥768px`** while the body's mobile padding kicks in at `≤768px` — guaranteeing horizontal overflow on tablets. **[verified]**
4. **Specificity bug in `globals.css`:** `*:not(p)` is emitted after `p, a, li, span, div`, so it wins the specificity tie and re-forces Oceanwide on every non-`<p>` element. **[verified in compiled CSS]**
5. **Massive duplication:** `app/design/[slug]/SpecificWork.module.css` and `app/dev/love-note-printer/SpecificWork.module.css` are ~95% identical (114 vs 115 lines). `WorkPreview.module.css` duplicates the same `imageContainer` block a third time.

### Dead code inventory

| Item | Detail |
|------|--------|
| `src/app/page.module.css` | **0 bytes**, imported by nothing |
| `src/components/Footer/Footer.tsx` | Imports `styles` but is **never rendered** — imported in `layout.tsx` line 11 and never used |
| `Footer.module.css` | Only consumer is the dead Footer |
| `public/icons/devicon.min.css` | 53 KB, never referenced — devicon loads from CDN instead |
| `.heroImage`, `.theater-icon` (Home) | Compiled but unused |
| `.cvContainer` (About) | Compiled but unused |
| `.iconsContainer` (Footer) | Never emitted, unused |
| `.right .proficiencyHeader h2:nth-of-type(2)` | Dead selector — `.right` doesn't exist in that module's scope |
| `.container` blocks in Home `.module.css` | Defined in the media query, never used (Home uses `heroContainer`) |

---

## 2. Styling File Inventory

### 2.1 Global / entry stylesheets

| File | Lines | Imported from | Role |
|------|-------|---------------|------|
| `src/app/globals.css` | 69 | `layout.tsx` line 3 | Element resets, typography defaults, 3 utility classes |
| `src/app/theming.css` | 56 | `layout.tsx` line 4 | 4 theme token sets + `:root` |
| `public/fonts/fonts.css` | 18 | `layout.tsx` line 5 | 2 `@font-face` rules (Oceanwide) |
| `src/bootstrap.min.css` | 1 (min) | `layout.tsx` line 10 | Bootstrap **v3.4.1** customizer build, 12.8 KB |
| `public/icons/devicon.min.css` | 1 (min) | **nothing** | Orphaned, 53 KB |

### 2.2 CSS Modules (all imported)

| Module | Lines | Consumed by |
|--------|-------|-------------|
| `app/Home.module.css` | 109 | `app/page.tsx` |
| `app/about/About.module.css` | 102 | `app/about/page.tsx` |
| `app/contact/Contact.module.css` | 86 | `app/contact/page.tsx` |
| `app/design/Art.module.css` | 35 | `app/design/page.tsx` |
| `app/design/[slug]/SpecificWork.module.css` | 115 | `app/design/[slug]/page.tsx` |
| `app/dev/Dev.module.css` | 35 | `app/dev/page.tsx` |
| `app/dev/love-note-printer/SpecificWork.module.css` | 114 | `app/dev/love-note-printer/page.tsx` |
| `app/tools/Tools.module.css` | 47 | `app/tools/page.tsx` |
| `app/tools/script-follow-along/ScriptFollowAlong.module.css` | 53 | matching page |
| `components/Button/Button.module.css` | 49 | `Button.tsx` |
| `components/Footer/Footer.module.css` | 21 | `Footer.tsx` *(dead)* |
| `components/Layout/MainContainer/MainContainer.module.css` | 3 | `MainContainer.tsx` |
| `components/Layout/TopContainer/TopContainer.module.css` | 6 | `TopContainer.tsx` |
| `components/NavBar/NavBar.module.css` | 77 | `NavBar.tsx` |
| `components/TechnologyIcon/TechnologyIcon.module.css` | 38 | `TechnologyIcon.tsx` |
| `components/TechnologyList/TechnologyList.module.css` | 29 | `TechnologyList.tsx` |
| `components/ThemeSwitch/ThemeSwitch.module.css` | 27 | `ThemeSwitch.tsx` |
| `components/WorkPreview/WorkPreview.module.css` | 85 | `WorkPreview.tsx` |
| `app/page.module.css` | **0** | **orphan** |

**Total CSS Modules: 19 files, 1,025 lines** (excluding Bootstrap, devicon, `fonts.css`). Plus 143 lines of global/theme/font CSS = **~1,168 lines of hand-written CSS**.

### 2.3 Load order (as compiled)

`layout.tsx` imports in this sequence, and Next.js preserves it:

1. `globals.css`
2. `theming.css`
3. `public/fonts/fonts.css`
4. `src/bootstrap.min.css`

**[verified]** In the compiled bundle, `globals.css` output begins at byte 0 and Bootstrap's `body{font-family:"Helvetica Neue"...}` appears at byte 4960. Because `globals.css` also sets `body` at the same specificity (0,0,1) and comes **first**, Bootstrap's `body` font-family **wins** by source order.

> **Consequence:** Bootstrap 3's `body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.42857143}` wins the cascade for `body` itself. Most visible text is then re-assigned by `globals.css` element rules (`p, a` → Roboto → *falls back to generic `sans-serif`*, since Roboto is never loaded), and every remaining non-`<p>` element is re-assigned to Oceanwide by `:not(p)`. Practical upshot: **the intended body font never renders anywhere**, and the `font-size: 14px` on `body` becomes the base for every `em` value in the modules. The `background-color` and `overflow-x` from `globals.css` are preserved (Bootstrap never redeclares them).

---

## 3. Design Tokens

All tokens live in `src/app/theming.css`. Themes are applied as a **class on `<html>`**.

### 3.1 Token matrix

| Token | theme1 (default) | theme2 | theme3 | theme4 |
|-------|------------------|--------|--------|--------|
| `--z-primary` | `#8c0800` crimson | `#0a8ece` blue | `#4c956c` green | `#ff7800` orange |
| `--z-secondary` | `#fe716a` salmon | `#0a8ece` → **`#181818`** | `#42835e` | `#e26b00` |
| `--text-shadow` | `#fac852` gold | `#0a8ece` | `#9191E9` | `#e26b00` |
| `--secondary-box-shadow` | `#8d08010f` | `#2020200f` | `#4c956c0f` | `#2020200f` |
| `--secondary-box-shadow-hover` | `#8d08011f` | `#2020201f` | `#4c956c1f` | `#2020201f` |
| `--z-third` | `#000000` | `#73d1ff` | `#000000` | `#000000` |
| `--z-gray` | `#a4a4a4` | `#a4a4a4` | `#a4a4a4` | `#a4a4a4` |
| `--z-gray-light` | `#c7c7c7` | `#c7c7c7` | `#c7c7c7` | `#c7c7c7` |
| `--z-icon` | `#fac852` | `#ffffff` | `#ffffff` | `#000000` |
| `--z-theme-button-background` | `#fac852` | `#0a8ece` | `#9191E9` | `#e26b00` |

Plus one non-theme token:

```css
:root { --light-border: #303436; }
```

### 3.2 Token issues

- **Bug: `--z-secondary` is declared twice in `.theme2`** (lines 16–17 of `theming.css`): first `#0a8ece`, then `#181818`. The second wins; the first is dead. The odd one out is that themes 1/3/4 have a meaningful `--z-secondary` used for button hover, while theme2's resolves to near-black `#181818`.
- **5 of 12 tokens are declared 4× and used 0×** (12 dead declarations): `--secondary-box-shadow`, `--secondary-box-shadow-hover`, `--z-third`, `--z-icon`, `--light-border`. **[verified]**
- Only **6 distinct tokens** are ever consumed:

| Token | Usage count |
|-------|-------------|
| `var(--z-primary)` | 10 |
| `var(--z-gray)` | 8 |
| `var(--z-gray-light)` | 2 |
| `var(--z-secondary)` | 1 (`Button.primary:hover`) |
| `var(--text-shadow)` | 1 (hero `.name`) |
| `var(--z-theme-button-background)` | 1 (`ThemeSwitch` hover) — written as `var( --z-...)` with a stray space |

### 3.3 Theme mechanism

- **SSR-safe blocking script** in `layout.tsx` `<head>` reads the `theme` cookie and applies it as `<html class>` before paint (prevents FOUC):
  ```js
  (function(){var t=document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);document.documentElement.className=t?t[1]:'theme1'})()
  ```
- `MainContainer.tsx` holds theme state (`useState(getCookieTheme)`), writes the class to `document.documentElement.className`, and persists to **both** a cookie (`max-age=1yr`) **and** `localStorage`. The `localStorage` write is never read back — dead redundancy.
- `ThemeSwitch.tsx` **cycles** themes 1→2→3→4→1 on click. There is no picker, no labels, no `aria-label`, and no non-hover affordance.
- Setting `document.documentElement.className = theme` **wipes any other classes on `<html>`**.

### 3.4 Hardcoded colors that bypass the token system

**32 distinct hex values** appear in hand-written CSS/TSX (excluding Bootstrap). These are **not** tokenized and will drift:

| Color | Count | Where |
|-------|-------|-------|
| `#d8d8d8` | 7 | globals (heading+text), Button primary text/border |
| `#a4a4a4` | 5 | NavBar link colors (should be `--z-gray`) |
| `#000000` | 5 | Contact inputs/textareas, SpecificWork/WorkPreview image backgrounds, theme tertiary |
| `#c7c7c7` | 4 | token only |
| `#0a8ece` | 4 | token only |
| `#181a1b` | 2 | body background **and** NavBar background — duplicated literal |
| `#b4b4b4`, `#c2c2c2`, `#f8f8f8`, `#f6f6f6`, `#111111`, `#070707`, `#393939`, `#303436`, `#0000001a` | 1 each | Button states, NavBar scrolled border, ThemeSwitch shadow |

Notable: **NavBar hardcodes `#a4a4a4` / `#d8d8d8` / `#393939` / `#181a1b` instead of using tokens**, so the nav does not respond to theme changes except for the active link.

<details>
<summary>Full list of the 32 unique hex values</summary>

`#000000` `#0000001a` `#070707` `#0a8ece` `#111111` `#181818` `#181a1b` `#2020200f` `#2020201f` `#303436` `#393939` `#42835e` `#4c956c` `#4c956c0f` `#4c956c1f` `#73d1ff` `#8c0800` `#8d08010f` `#8d08011f` `#9191E9` `#a4a4a4` `#b4b4b4` `#c2c2c2` `#c7c7c7` `#d8d8d8` `#e26b00` `#f6f6f6` `#f8f8f8` `#fac852` `#fe716a` `#ff7800` `#ffffff`

Note the inconsistent casing: `#9191E9` is the only uppercase hex in the codebase.

</details>

---

## 4. Typography

### 4.1 Font families

| Family | Declared | Actually loaded? |
|--------|----------|------------------|
| **Oceanwide** | 26 references | ✅ Yes — 2 `@font-face` (normal + italic), self-hosted |
| **Roboto** | 10 references | ❌ **No** — no `@font-face`, no `<link>`, no `next/font` |
| `serif` | fallback in `globals.css` h1–h6 | Suspicious — Oceanwide is a **sans-serif** |
| `sans-serif` | fallback in `globals.css:62` and modules | Used |
| `Helvetica Neue, Helvetica, Arial` | Bootstrap 3 `body` | ✅ Wins for body text **[verified]** |

**Detailed Roboto references** (all will fall back):
`globals.css:9`, `About.module.css:57`, `Art.module.css:29`, `Contact.module.css:29,37`, `SpecificWork.module.css:43` (both copies), `Tools.module.css:31`, `ScriptFollowAlong.module.css:36`, `WorkPreview.module.css:50`.
Style is inconsistent: `'Roboto', sans-serif` (quoted, 4×) vs `Roboto, sans-serif` (unquoted, 6×).

### 4.2 Font loading

- `public/fonts/fonts.css` defines Oceanwide at **weight 600 only**, both normal and italic, with `font-display: swap`.
- Next.js fingerprints and self-hosts the files: `/_next/static/media/Oceanwide-Semibold.*.woff2`. **[verified]**
- **No `next/font` usage anywhere.** No preload hint → the hero headline is the LCP element and its font is discovered late.
- Weight mismatch: only weight **600** exists, but the code requests `font-weight: bold` (9×) and `400` (7×). Browsers synthesize bold; **400 renders as 600**, so "regular" body text is semibold-weight Oceanwide wherever Oceanwide is applied.

### 4.3 The `*:not(p)` specificity bug **[verified]**

`globals.css` ends with:

```css
p, a, li, span, div { font-family: 'Roboto', sans-serif; color: #d8d8d8; }  /* line 8 */
...
*:not(p) { font-family: Oceanwide, sans-serif; }                            /* line 61 */
```

Compiled output (note the reordering and `*` removal):

```css
h1,h2,h3,h4,h5,h6{font-family:Oceanwide,serif;color:#d8d8d8}
a,div,li,p,span{font-family:Roboto,sans-serif;color:#d8d8d8}
...
:not(p){font-family:Oceanwide,sans-serif}
```

Specificity: `*:not(p)` = `(0,0,1)`; `div,span,li,p,a` = `(0,0,1)`. **Tie → later wins → `:not(p)` wins.** Result: **every non-`<p>` element gets Oceanwide**, regardless of the declared intent. Only `<p>` keeps the (unavailable) Roboto.

CSS Modules that set `font-family: Roboto` on a `p` do win (e.g. `.container p` = `(0,1,1)`), which is why *some* paragraphs render in the system fallback and others in Oceanwide — an inconsistency visible on the About, Dev, and Tools pages.

### 4.4 Type scale (there is no scale — 18 distinct sizes in 5 units)

| Value | Count | Role |
|-------|-------|------|
| `15pt` | 7 | Body copy (modules) |
| `14pt` | 6 | `globals.css` `p, a`, button text, NavBar links |
| `calc(1.375rem + 1.5vw)` | 5 | Page `<h1>` on Dev/Tools/SpecificWork pages (a Bootstrap 5 RFS formula) |
| `16pt` | 5 | Section titles / `h2`, CV link |
| `18pt` | 1 | WorkPreview title |
| `20pt` | 1 | ScriptFollowAlong `h2` |
| `13pt` | 1 | ScriptFollowAlong `.updated` |
| `28pt` | 1 | Footer icon (dead) |
| `30pt` | 1 | TechnologyIcon glyph |
| `min(max(1.3rem, 3vw), 3.5rem)` | 1 | Contact alert |
| `min(max(2.3rem, 5vw), 6.5rem)` | 1 | Contact `<h1>` |
| `min(max(2.3rem, 5vw), 8.5rem)` | 1 | About `<h1>` |
| `min(max(2.3rem, 5vw), 11.5rem)` | 1 | Home hero `<h1>` |
| `4rem` | 1 | Home hero `<h1>` mobile override |

**Observations:**
- `pt` for on-screen type is a print unit; `15pt ≈ 20px` and `14pt ≈ 18.7px` — both oversized relative to Bootstrap's `14px` body.
- Three near-identical `min(max(2.3rem, 5vw), Xrem)` variants differ only in the ceiling — a fluid-scale primitive begging to be a single token.
- Bootstrap's `h1 { font-size: 2em }` and `font-size: 90%/80%/75%` rules also load, creating latent conflicts.

### 4.5 Line height & weight

| Property | Values | Issue |
|----------|--------|-------|
| `line-height` | `3rem` (globals `p, a`), `1.6` (4 modules), `1` (TechnologyIcon), plus Bootstrap's `1.42857143` | `3rem` = 48px on 18.7px text → **ratio of 2.57**, extremely loose. `1.6` for body copy elsewhere. |
| `font-weight` | `bold` (9×), `400` (7×) | Only 600 weight exists in the font |

---

## 5. Layout & Spacing

### 5.1 Page frame

| Layer | Rule | Notes |
|-------|------|-------|
| `body` | `padding: 3em 3em 20px` | Mixed units in one declaration |
| `body` (≤768px) | `padding: 3em 1em 20px` | |
| `body` | `overflow-x: hidden` | **Masks** overflow bugs rather than fixing them |
| `body` | `background-color: #181a1b` | Duplicated literal in NavBar |
| `MainContainer` | `margin-top: 6em` | |
| `TopContainer` | `min-height: calc(85vh - 5em); margin-top: 1rem` | |
| `NavBar` | `position: fixed; padding: 3.5em 3em 1em; z-index: 999` | |

**Compounding top offset:** body `padding-top: 3em` **+** MainContainer `margin-top: 6em` = **9em (~144px)** of dead space above content, on top of a fixed navbar that only occupies ~3.5em + content. The nav does not reserve space in flow; body padding is the de-facto offset, but the extra `6em` is unexplained.

**Bootstrap conflict:** Bootstrap 3's `.container` sets `width: 750px` at `≥768px` **[verified]**. Body padding is 1em at exactly 768px, so between 768–992px the container is 750px wide inside a viewport that may be only 768px minus 2em padding → overflow, hidden by `overflow-x: hidden`.

### 5.2 Spacing scale (no scale — 20+ distinct values)

`margin`/`padding`/`gap` values in active use: `0`, `.25rem`, `.5rem`, `.75rem`, `.8rem`, `1rem`, `1.25rem`, `1.35rem`, `1.5rem`, `1.75rem`, `2rem`, `2.5rem`, `3rem`, `3.5em`, `4rem`, `5rem`, `6em`, `8rem`, `10px`, `20px`, `15px`.

- Mixes **`rem`, `em`, `px`, `pt`, `vw`, `vh`** freely and inconsistently.
- Frequently asymmetric (e.g. `.cvLink { padding: 0 3rem 2rem }`).
- `rem` throughout the modules depends on the root font size, but `body` is styled in `em` (relative to Bootstrap's `14px` body font) — so `em` and `rem` here do **not** agree (an `em` is 14px, a `rem` is 16px). This is a real source of unpredictable spacing.

### 5.3 Fixed dimensions (not responsive)

| Selector | Value |
|----------|-------|
| `WorkPreview .imageContainer` | `600px × 350px` → `350px × 219px` at ≤768px |
| `SpecificWork .imageContainer` | `600px × 350px` → `350px × 219px` at ≤768px |
| `SpecificWork .hidden` | `width: 600px` |
| `WorkPreview p` | `width: 600px` → `350px` |
| `WorkPreview .container` | `max-width: 800px` |
| `About .imageContainer` | `max-height: 600px`, img `max-height: 500px` |
| `Hero .heroImage` | `max-width: 800px` *(unused)* |
| `SpecificWork .videoContainer` | `max-width: 1000px; width: 60vw; height: 62vh` |
| `About .right .aboutContainer` | `max-width: 1000px` |
| `Contact .contact form` | `max-width: 500px` |
| `Tools .list` / `ScriptFollowAlong .section` | `max-width: 720px` |
| `SpecificWork p, i` | `max-width: 650px` |

Three different content measure widths (`650px`, `720px`, `1000px`) across otherwise similar text pages.

### 5.4 Breakpoints — single, hardcoded

| Breakpoint | Count | Notes |
|------------|-------|-------|
| `@media (max-width: 768px)` | 10 | The only mobile breakpoint; used everywhere |
| `@media (max-width: 708px)` | 2 | **Orphan** — one-off for `.videoContainer`, nearly identical to 768px |
| Bootstrap `min-width: 768px / 992px / 1200px` | 2 each | Inherited, used only for `.container` width |

Everything is `max-width` (**desktop-first**), while the Bootstrap grid in the same bundle is `min-width` (**mobile-first**) — the two philosophies coexist.

Breakpoint values are hardcoded 12×, never a token or mixin. No `prefers-color-scheme`, `prefers-reduced-motion`, `hover`, or `pointer` media queries exist anywhere.

### 5.5 Grid usage

Bootstrap grid classes are used in only 3 places:
- `app/page.tsx:18` — `col-xs-12` (Bootstrap **3**-only class)
- `app/about/page.tsx:25` — `col-12 col-sm-7 col-lg-6` (**Bootstrap 5** syntax; `.col-12` **does not exist** in the v3 bundle) **[verified: `.col-12` ABSENT]**
- `app/dev/page.tsx:25` — `col-12` (also absent)

Elsewhere layout is done with hand-rolled `display: flex` inside modules. There is no consistent grid strategy.

---

## 6. Global Utility Classes

Only three exist, all in `globals.css`:

| Class | Definition | Used by |
|-------|-----------|---------|
| `.animate-hover` | `position: relative; display: inline-block`; `:after` = 2px underline in `var(--z-primary)`, `scaleX(0)` → `scaleX(1)` on hover, `transition: all .3s ease-in-out 0s` | `WorkPreview`, `design/page.tsx`, `tools/page.tsx`, `script-follow-along/page.tsx` |
| `.no-margin` | `margin: 0 !important` | `NavBar.tsx` (passed as string prop) |
| `a { text-decoration: none !important }` | Global `<a>` reset | everywhere |

**Bootstrap utility classes actually used in JSX** (many broken):

| Class | Used | Exists in bundle? |
|-------|------|-------------------|
| `container` | 19 | ✅ v3 (fixed widths) |
| `row` | 1 | ✅ |
| `col-sm-7`, `col-lg-6`, `col-xs-12` | 1 each | ✅ v3 |
| `d-flex` | 4 | ❌ **no-op** |
| `flex-column` | 3 | ❌ **no-op** |
| `mb-3` | 3 | ❌ **no-op** |
| `mt-1` | 3 | ❌ **no-op** |
| `justify-content-center` | 1 | ❌ **no-op** |
| `col-12` | 2 | ❌ **no-op** |
| `m-0 p-0` | 2 | ❌ **no-op** (Footer, dead) |
| `justify-content-center` | 1 | ❌ **no-op** |

**10+ Bootstrap 5 utility usages are silent no-ops.** The contact form relies on `d-flex flex-column mb-3` for its entire vertical layout and gets nothing.

---

## 7. Component-by-Component Styling Reference

### 7.1 `NavBar` — `NavBar.module.css` (77 lines)
- `position: fixed; top/left/right: 0; z-index: 999`, background `#181a1b` (hardcoded).
- `.scrolled` toggles `border-bottom-color: #393939` via React scroll listener.
- Links: `#a4a4a4` → `#d8d8d8` on hover; `.active` → `var(--z-primary)`.
- **Duplicate `.container .left a` block** (lines 33–36 and 47–56) — same selector declared twice.
- Mobile: left links center and full width; `.right` (Contact button) is `display: none` — **the Contact CTA is unreachable on mobile**.
- Uses `styles.active` on a `Link`; the class is applied but `active` appears in the CSS as `.container .left a.active`.

### 7.2 `Button` — `Button.module.css` (49 lines)
- Base: `padding: 1.35rem 1.75rem; border-radius: 0.5rem; font-size: 14pt; height: 55px; font-weight: bold`.
- `.primary`: `background: var(--z-primary)`, `border: 1px solid #d8d8d8`, text `#d8d8d8`; hover → `var(--z-secondary)`.
- `.secondary`: `background: #d8d8d8`, text `#000000`, border `#c2c2c2`; hover `#f8f8f8`; active `#f6f6f6`.
- **Only component with `:hover`/`:active` states** (besides `.animate-hover` and the nav).
- Uses `:has(a)` (`.button:has(a)`) — modern selector, no fallback.
- Fixed `height: 55px` **and** vertical padding — redundant; text size changes will clip.
- The secondary variant's gray palette (`#d8d8d8`/`#c2c2c2`/`#f8f8f8`) is entirely untokenized and ignores themes.

### 7.3 `ThemeSwitch` — `ThemeSwitch.module.css` (27 lines)
- Fixed bottom-right (`2.5rem`), `z-index: 99999` (highest on the site).
- 60×60 circle, transparent by default, `box-shadow: 0 0 15px 3px #0000001a`, fills with `var(--z-theme-button-background)` on **container hover**.
- `svg { filter: invert(100%) }` with a `-webkit-` prefix comment ("safari 6.0 - 9.0").
- **No `:focus-visible` style, no `aria-label`** — the only theme control is hover-dependent and screen-reader silent.

### 7.4 `WorkPreview` — `WorkPreview.module.css` (85 lines)
- Card: `margin: 3rem`, `max-width: 800px`, flex column.
- `.imageContainer`: `600×350`, black background, `border-radius: 0.75rem`, `object-fit: contain !important`.
- Title link: `18pt`, bold, `var(--z-primary)`, hover underline via global `.animate-hover`.
- `p`: `15pt`, `var(--z-gray)`, `width: 600px` (hardcoded, not responsive until ≤768px).
- `.hidden`: `opacity: 0; height: 0` — used with 8 filler cards on the design page to force flex-wrap row balancing (a **layout hack**).
- Mobile: `350×219` images, `16pt`/`14pt` text.

### 7.5 `TechnologyIcon` / `TechnologyList`
- Icon: 60×60 white circle, `border-radius: 50%`, `padding: 7px`, `transition: all .25s ease-in-out`, `z-index: 99`; hover adds `1px solid rgba(0,0,0,0.16)`. Glyph at `30pt`.
- `.spacer`: `opacity: 0; height: 0 !important; pointer-events: none` — 5 spacer icons appended per category to balance flex-wrap rows (another **layout hack**).
- `TechnologyList` `.right .proficiencyHeader h2:nth-of-type(2) { opacity: 0 }` — **dead selector**, `.right` isn't in that module; the proficiency-label feature it relates to is commented out in the TSX (known TODO).

### 7.6 `TopContainer` / `MainContainer`
- `TopContainer`: `min-height: calc(85vh - 5em); margin-top: 1rem; display: flex; align-items: center`. **Only used on Home and About** — Dev, Tools, Design, Contact don't use it.
- `MainContainer`: `margin-top: 6em` and hosts `ThemeSwitch`.

### 7.7 `Footer` — **dead code**
- Imported in `layout.tsx` but **never rendered**.
- Would have rendered a `<head>` inside `<body>` (invalid; produces a Next.js lint warning **[verified in build output]**) to load devicon from CDN.
- `.icon`: `28pt`, `opacity: .2`, `filter: contrast(0)` → `opacity: 1; filter: contrast(1)` on hover.

### 7.8 `Video` — **zero styling**
- Renders `<video controls width="100%">` with inline `width` attribute. No module. Unused by any page (both `SpecificWork` pages and the love-note page use raw `<iframe>`/`<img>` instead).

### 7.9 Duplicated `SpecificWork` modules — the largest duplication

`app/design/[slug]/SpecificWork.module.css` (115 lines) and `app/dev/love-note-printer/SpecificWork.module.css` (114 lines) share **every class** with near-identical bodies. The only differences:

1. Design version styles `.container p, .container i`; dev version styles `.container p` only (missing italic intro support).
2. Design version has 8 `.hidden` spacer divs; dev version has 1 image.
3. Trivial whitespace.

Both independently define: `.container h1`, `.container`, `.container .hidden`, `.container .imageContainer`, `.container .imageContainer img`, `.container p`, `.works`, `.videoContainer`, `.videoContainer iframe`, plus the `708px` and `768px` media queries. `WorkPreview.module.css` duplicates the `.imageContainer` block a **third** time.

---

## 8. Cross-Cutting Patterns & Anti-Patterns

### 8.1 `!important` — 13 uses in hand-written CSS

| Declaration | Count | Location |
|-------------|-------|----------|
| `object-fit: contain !important` | 3 | WorkPreview + both SpecificWork |
| `height: 0 !important` | 3 | `.hidden` / `.spacer` hacks |
| `width: 100% !important` | 2 | Home heroImage, About img |
| `height: 100% !important` | 1 | About img |
| `width: auto !important` | 1 | About img |
| `margin: 10px !important` | 1 | Footer icon |
| `margin: 0 !important` | 1 | `.no-margin` |
| `margin-top/bottom: 0 !important` | 2 | `.hidden` classes |
| `text-decoration: none !important` | 1 | global `a` |
| `flex-direction: column !important` | 1 | Home mobile buttonContainer |

The `!important` on image sizing exists to fight Next.js `<Image>`'s inline `style` attribute (which `!important` can beat but plain CSS cannot) — a structural conflict, not a styling choice.

### 8.2 Layout hacks that should be grid/flex rules

1. **Spacer elements**: 8 hidden `WorkPreview` cards on the design page + 8 hidden `imageContainer` divs on project pages + 5 hidden `TechnologyIcon`s per tech category — all to influence flex-wrap line breaking.
2. **`opacity: 0` + `height: 0`** to hide them, rather than `display: none` or proper grid.
3. **`overflow-x: hidden` on `body`** to suppress the resulting overflow.

### 8.3 Inline styles

Minimal — the only `style=` attributes in JSX are the `style` **prop** on `<Button>` (`"primary"`/`"secondary"`), not CSS. Good baseline.

`<Image>` components inject inline `style` for `layout="responsive"` (About page), which is why `!important` was needed.

### 8.4 Transitions & animation — 4 total, no easing standard

| Selector | Value |
|----------|-------|
| `.animate-hover:after` | `all .3s ease-in-out 0s` (+ `-webkit-` duplicate) |
| `TechnologyIcon .icon` | `all .25s ease-in-out` |
| `NavBar .container` | `all 0.3s` (no easing specified) |

No `prefers-reduced-motion` handling. `transition: all` is used 3× (performance-risky).

### 8.5 Stacking contexts — three ad-hoc z-indexes

`TechnologyIcon .icon` → `99`, `NavBar` → `999`, `ThemeSwitch` → `99999`. No scale or tokens.

### 8.6 Border radius — two values + circles

`0.5rem` (Button), `0.75rem` (5× image containers), `50%` (icon, theme switch). Note `.75rem` vs `0.75rem` inconsistency. Git history shows a commit "tone down border-radius".

### 8.7 Browser-prefix leftovers

`-webkit-transform`, `-webkit-transition` (globals), `-webkit-filter` with a "safari 6.0 - 9.0" comment (ThemeSwitch). Dead for any supported browser; no autoprefixer/postcss config exists (`package.json` has no `postcss.config.js`).

### 8.8 Missing accessibility / robustness styling

- **No `:focus-visible` / focus styles anywhere.** Keyboard focus is invisible on nav links, buttons, the theme switch, and form inputs.
- Inputs/textarea: `border: none; background: black` — no visible boundary, no focus ring, placeholder color unset.
- `filter: contrast(0)` on footer icons depends on the icon being non-monochrome.
- No print stylesheet anywhere — relevant given the site serves resume PDFs.

### 8.9 PostCSS / tooling

- **No `postcss.config.js`.** Next.js supplies defaults (autoprefixer via its built-in pipeline) but there is no custom config, no Sass, no Tailwind, no CSS-in-JS.
- No CSS variables for spacing/radius/type — only the 12 theme colors.
- No stylelint / CSS linting. `.eslintrc.json` is `{ "extends": "next/core-web-vitals" }` only.
- `next.config.js` uses the deprecated `next-fonts` plugin and `images.domains` (deprecated in favor of `remotePatterns`).

---

## 9. Build Warnings Relevant to Styling

From `npx next build` (exit 0):

```
src/app/design/[slug]/page.tsx:66:45   Warning: Using `<img>` … consider `<Image />`
src/app/dev/love-note-printer/page.tsx:25:29  Warning: Using `<img>` … consider `<Image />`
src/components/WorkPreview/WorkPreview.tsx:24:11  Warning: Using `<img>` … consider `<Image />`
src/components/Footer/Footer.tsx:10:13  Warning: Do not use `<head>` element
```

The `<img>` warnings matter for the refactor: those raw `<img>` tags are precisely the ones targeted by `object-fit/width/height !important` rules.

---

## 10. Refactor Roadmap (derived from the findings)

Ordered by risk-reduction-per-effort:

### Phase 0 — Fix outright bugs (no design decisions needed)
1. Load Roboto (or delete all 10 references and commit to a system stack). Decide on one.
2. Resolve the Bootstrap mismatch: either import Bootstrap 5 CSS (and drop the v3 file) or remove the broken BS5 utility classes. Do not leave both.
3. Fix `.theme2`'s duplicate `--z-secondary`.
4. Remove `*:not(p)` from `globals.css` — replace with explicit element rules or inherit properly.
5. Delete `src/app/page.module.css` (empty), the dead `Footer` + its module, and `public/icons/devicon.min.css`.

### Phase 1 — Establish a token layer
6. Promote spacing, radius, type-size, colour, breakpoint, shadow, and z-index values into tokens (one `:root` + theme overrides). Replace the 33 hardcoded hexes and 20+ spacing values.
7. Replace the 18 font sizes with a 6–8 step scale; move `pt` → `rem`/`clamp`.
8. Normalise `line-height` (currently 3rem vs 1.6 vs 1.428).
9. Fix the `em`/`rem` mismatch in `body` — pick one root-relative unit.

### Phase 2 — De-duplicate
10. Merge the two `SpecificWork.module.css` files into one shared module (and decide whether `WorkPreview`'s image container joins it).
11. Merge per-page `<h1>` fluid sizes (`2.3rem, 5vw, Xrem`) into one token.
12. Consolidate the repeated `.container h1 { font-size: calc(1.375rem + 1.5vw) }` into a shared page-header component/module.

### Phase 3 — Layout correctness
13. Replace the 8-card / 8-div / 5-icon spacer hacks with CSS grid (`repeat(auto-fill,minmax(…))`).
14. Remove `overflow-x: hidden` and fix the real overflow (notably the BS3 `.container` 750px at 768px).
15. Replace the `9em` compound top offset with a single navbar-height variable.
16. Unify breakpoints to one set; adopt mobile-first consistently; delete the orphan `708px`.
17. Resolve the `col-xs-12` / `col-12` Bootstrap migration.

### Phase 4 — Component polish
18. Add `:focus-visible` styles site-wide.
19. Add `prefers-reduced-motion` guards around the 3 transitions.
20. Make Contact reachable on mobile (currently `display: none`).
21. Add a theme picker with labels/`aria` instead of a blind cycle; read back the `localStorage` value or delete the write.
22. Replace `transition: all` with explicit properties.

### Phase 5 — Tooling
23. Add `postcss.config.js` (autoprefixer explicitly) and remove leftover `-webkit-` prefixes.
24. Consider bringing `devicon.min.css` in-package instead of a CDN `<link>` in a dead component.
25. Add stylelint to prevent regressions in the new token system.

---

## Appendix A — Complete Selector Inventory

### `globals.css`
`h1,h2,h3,h4,h5,h6` · `p,a,li,span,div` · `body` · `p,a` · `.animate-hover` · `.animate-hover:after` · `.animate-hover:hover:after` · `.no-margin` · `a` · `*:not(p)` · `@media (max-width:768px) body`

### `theming.css`
`.theme1` · `.theme2` · `.theme3` · `.theme4` · `:root`

### `Home.module.css`
`.heroContainer` · `.heroContainer .hero h1` · `…h1 .name` · `…h1 .color` · `…hero p` · `…buttonContainer` · `…buttonContainer > div` · `.heroImage`† · `.right` · `.theater-icon`† · `@768: .container`† · `.left` · `.left .hero h1` · `.left .hero p` · `.left a` · `.right` · `.buttonContainer` · `.buttonContainer button` · `.buttonContainer > div` · `> div button` · `> div a` · `> div a:nth-of-type(1)`

### `About.module.css`
`.container` · `.container > div` · `.container .left` · `.container h1` · `.container .imageContainer` · `…img` · `.container .right .aboutContainer` · `… p` · `.cvContainer`† · `.cvContainer a`† · `@768: .container` · `.container .imageContainer` · `.container > div` · `.right .aboutContainer`

### `Contact.module.css`
`.container` · `.container h1` · `.container .contact` · `.contact label` · `.contact input` · `.contact textarea` · `.contact form` · `.contact form > div` · `.customButton` · `.contactContainer` · `.alert` · `.contactInfo` · `.contactInfo a`

### `Art.module.css`
`.container` · `.works` · `@768: .container, .works` · `.cvLink`

### `design/[slug]/SpecificWork.module.css`
`.container h1` · `.container` · `.container .hidden` · `.container .imageContainer` · `… img` · `.container p, .container i` · `.works` · `.videoContainer` · `.videoContainer iframe` · `@708: .videoContainer` · `@768: .container, .works, .container .imageContainer, .container h1, .container p`

### `Dev.module.css`
`.container` · `.container h1` · `.container .right` · `.left .experienceSection` · `… h2` · `.left .intro`

### `dev/love-note-printer/SpecificWork.module.css`
Same as design `SpecificWork` except `.container p` (no `i`) — see §7.9

### `Tools.module.css`
`.container` · `.container h1` · `.list` · `.row` · `.title` · `.subtitle` · `@768: .container h1, .subtitle`

### `ScriptFollowAlong.module.css`
`.container` · `.container h1` · `.section` · `.section h2` · `.section .updated` · `.section h3` · `.section p` · `@768: .container h1, .section p`

### `Button.module.css`
`.button` · `.button:has(a)` · `.button.primary` · `.button.primary:hover` · `.button.secondary` · `.button.secondary:hover` · `.button.secondary:active`

### `NavBar.module.css`
`.container` · `.container.scrolled` · `.container .left` · `.container .right` · `.container .left a` (×2) · `… a:hover` · `… a.active` · `@768: .container, .container .left, .container .left a, .container .right`

### `WorkPreview.module.css`
`.container` · `.container.hidden` · `.container .imageContainer` · `… img` · `.container .titleContainer a` · `.container p` · `@768: .container, .container .imageContainer, .container .titleContainer a, .container p`

### `TechnologyIcon.module.css`
`.container` · `.container.spacer` · `.container .icon` · `.container:hover .icon` · `.container i`

### `TechnologyList.module.css`
`.right .proficiencyHeader h2:nth-of-type(2)`† · `.right .technologySection` · `.technologySection .title` · `.technologySection .technologyIcons`

### `ThemeSwitch.module.css`
`.container` · `.container button` · `.container:hover button` · `.container svg`

### `Footer.module.css` (dead)
`.container` · `.icon` · `.iconsContainer`† · `.icon:hover`

### `MainContainer.module.css`
`.container`

### `TopContainer.module.css`
`.container`

† = never rendered / dead selector

---

## Appendix B — Token Usage Ledger

| Token | theme1 | theme2 | theme3 | theme4 | Consumed by |
|-------|--------|--------|--------|--------|-------------|
| `--z-primary` | `#8c0800` | `#0a8ece` | `#4c956c` | `#ff7800` | 10 sites (1 dead): `.animate-hover:after` bg, Home hero `.color`, NavBar `.active`, WorkPreview title, Dev `.experienceSection h2`, TechnologyList `.title`, Tools `.title`, ScriptFollowAlong `.section h2`, Button.primary bg, About `.cvContainer a`† |
| `--z-secondary` | `#fe716a` | `#181818` ⚠ | `#42835e` | `#e26b00` | 1 site: `Button.primary:hover` bg |
| `--text-shadow` | `#fac852` | `#0a8ece` | `#9191E9` | `#e26b00` | 1 site: hero `.name` |
| `--z-gray` | `#a4a4a4` | `#a4a4a4` | `#a4a4a4` | `#a4a4a4` | 8 sites: hero `p`, About `p`, Art `.cvLink`, SpecificWork `p/i`, Tools `.subtitle`, ScriptFollowAlong `p` |
| `--z-gray-light` | `#c7c7c7` | `#c7c7c7` | `#c7c7c7` | `#c7c7c7` | 2 sites: ScriptFollowAlong `.updated` + `h3` |
| `--z-theme-button-background` | `#fac852` | `#0a8ece` | `#9191E9` | `#e26b00` | 1 site: `ThemeSwitch:hover` bg |
| `--z-third` | `#000000` | `#73d1ff` | `#000000` | `#000000` | **0 — dead** |
| `--z-icon` | `#fac852` | `#ffffff` | `#ffffff` | `#000000` | **0 — dead** |
| `--secondary-box-shadow` | `#8d08010f` | `#2020200f` | `#4c956c0f` | `#2020200f` | **0 — dead** |
| `--secondary-box-shadow-hover` | `#8d08011f` | `#2020201f` | `#4c956c1f` | `#2020201f` | **0 — dead** |
| `--light-border` (`:root`) | `#303436` | — | — | — | **0 — dead** |
