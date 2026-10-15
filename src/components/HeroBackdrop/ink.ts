/**
 * ink.ts — the page's own text and fills, rasterised into a silhouette.
 *
 * The artwork's premise is that the foreground blocks the light. Doing that
 * with rectangles taken from element or word boxes gives rectangular shadows,
 * which reads as a rendering bug rather than as light: the eye expects a shadow
 * to have the shape of the thing casting it.
 *
 * So the silhouette is rasterised properly. Every glyph is drawn into an
 * offscreen canvas at its own measured position. Nothing about line breaking,
 * kerning, letter-spacing or font metrics is reimplemented here — the DOM
 * supplies the position of each character, and the browser's own text engine
 * supplies the glyph. That matters: the headline carries -1.63px letter-spacing
 * and the browser's line breaks, and drawing per character at its measured left
 * edge inherits both for free.
 *
 * Two channels come out of it:
 *
 *   R  crisp glyph coverage, used for the shadow ray march, so the shadows have
 *      letterform edges
 *   G  the same silhouette dilated by HALO_CSS, used as a protective margin.
 *      A fragment inside the halo is treated as blocked, which keeps the
 *      surface immediately around the copy dark and the copy legible. Without
 *      it, glyph-accurate shadows would light the surface right up to the
 *      strokes and quietly undo the site's contrast work.
 *
 * Verified before building this: the rect from a character Range is the font's
 * CONTENT box (ascent + descent), not the line box. For the hero headline that
 * is 82px against a 85.68px line-height. So the baseline sits at rect.top plus
 * the font's ascent fraction of that height, which is what BOUNDING_BOX_FALLBACK
 * stands in for on engines that do not report the metrics.
 */

/** Silhouette resolution relative to CSS pixels. */
const INK_SCALE = 0.5;

/** Cap on silhouette width, so a very wide window does not cost more than it must. */
const INK_MAX_WIDTH = 1024;

/** How far the protective halo extends beyond the glyphs, in CSS pixels. */
const HALO_CSS = 3;

/**
 * Ceiling on rasterised glyphs. Each one costs a layout read, so a pathological
 * page could otherwise stall a resize; this keeps it bounded.
 */
const MAX_GLYPHS = 1500;

/** Roboto's ascent share of its content box, used when metrics are unavailable. */
const BOUNDING_BOX_FALLBACK = 0.76;

export interface InkMask {
  /** Packed source: R crisp coverage, G dilated coverage. */
  source: HTMLCanvasElement;
  width: number;
  height: number;
}

interface Glyph {
  ch: string;
  x: number;
  baseline: number;
  font: string;
}

export function rasteriseInk(
  viewportWidth: number,
  viewportHeight: number
): InkMask | null {
  const main = document.getElementById("main");
  if (!main || viewportWidth < 1 || viewportHeight < 1) return null;

  const scale = Math.min(INK_SCALE, INK_MAX_WIDTH / viewportWidth);
  const width = Math.max(1, Math.round(viewportWidth * scale));
  const height = Math.max(1, Math.round(viewportHeight * scale));

  const glyphs = collectGlyphs(main);
  if (glyphs.length === 0) return null;

  const crisp = document.createElement("canvas");
  crisp.width = width;
  crisp.height = height;
  const crispCtx = crisp.getContext("2d");
  if (!crispCtx) return null;

  const halo = document.createElement("canvas");
  halo.width = width;
  halo.height = height;
  const haloCtx = halo.getContext("2d");
  if (!haloCtx) return null;

  // Draw in CSS pixels and let the transform downscale, so the DOM's measured
  // coordinates can be used directly.
  crispCtx.scale(scale, scale);
  haloCtx.scale(scale, scale);

  for (const ctx of [crispCtx, haloCtx]) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // The halo is the same glyphs stroked as well as filled: a stroke of width
  // 2r dilates the outline by r. Cheaper and crisper than blurring the mask,
  // and it gives an exact, tunable margin.
  haloCtx.lineWidth = HALO_CSS * 2;
  haloCtx.lineJoin = "round";

  let currentFont = "";
  for (const glyph of glyphs) {
    if (glyph.font !== currentFont) {
      crispCtx.font = glyph.font;
      haloCtx.font = glyph.font;
      currentFont = glyph.font;
    }
    crispCtx.fillText(glyph.ch, glyph.x, glyph.baseline);
    haloCtx.fillText(glyph.ch, glyph.x, glyph.baseline);
    haloCtx.strokeText(glyph.ch, glyph.x, glyph.baseline);
  }

  // Solid fills occlude as shapes rather than as their labels, so the hero
  // buttons block light as pills instead of as two words.
  const solids = main.querySelectorAll("a, button");
  for (let i = 0; i < solids.length; i++) {
    const element = solids[i];
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const radius = parseFloat(getComputedStyle(element).borderRadius) || 0;
    for (const ctx of [crispCtx, haloCtx]) {
      roundedRect(ctx, rect.left, rect.top, rect.width, rect.height, radius);
      ctx.fill();
    }
  }

  return pack(crispCtx, haloCtx, width, height);
}

/** Every glyph inside `root`, positioned from the browser's own layout. */
function collectGlyphs(root: HTMLElement): Glyph[] {
  const glyphs: Glyph[] = [];
  const range = document.createRange();
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return glyphs;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node = walker.nextNode();
  while (node && glyphs.length < MAX_GLYPHS) {
    const text = node.nodeValue;
    const element = node.parentElement;

    if (text && element) {
      const computed = getComputedStyle(element);
      const font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;

      measure.font = font;
      const metrics = measure.measureText("Hq");
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      const ascentFraction =
        typeof ascent === "number" &&
        typeof descent === "number" &&
        ascent + descent > 0
          ? ascent / (ascent + descent)
          : BOUNDING_BOX_FALLBACK;

      for (let i = 0; i < text.length && glyphs.length < MAX_GLYPHS; i++) {
        const ch = text[i];
        // Whitespace is positioning, not ink.
        if (ch === " " || ch === "\n" || ch === "\t" || ch === "\u00a0") {
          continue;
        }

        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        // Collapsed or clipped out of the box tree: nothing to draw.
        if (rect.width < 0.5 || rect.height < 0.5) continue;

        glyphs.push({
          ch,
          x: rect.left,
          baseline: rect.top + rect.height * ascentFraction,
          font,
        });
      }
    }

    node = walker.nextNode();
  }

  return glyphs;
}

/** Interleave the crisp and dilated silhouettes into one RGBA source. */
function pack(
  crispCtx: CanvasRenderingContext2D,
  haloCtx: CanvasRenderingContext2D,
  width: number,
  height: number
): InkMask | null {
  const crisp = crispCtx.getImageData(0, 0, width, height).data;
  const halo = haloCtx.getImageData(0, 0, width, height).data;

  const packed = new ImageData(width, height);
  for (let i = 0; i < packed.data.length; i += 4) {
    packed.data[i] = crisp[i];
    packed.data[i + 1] = halo[i];
    packed.data[i + 2] = 0;
    // Opaque everywhere, so nothing depends on premultiplied alpha.
    packed.data[i + 3] = 255;
  }

  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const ctx = source.getContext("2d");
  if (!ctx) return null;
  ctx.putImageData(packed, 0, 0);

  return { source, width, height };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
