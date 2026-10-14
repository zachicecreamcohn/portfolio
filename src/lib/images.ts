/**
 * Cloudflare Images URL builder.
 *
 * ─── FINDING (verified, 2026) ────────────────────────────────────────────────
 * FLEXIBLE VARIANTS ARE DISABLED on this account. Measured against the live CDN:
 *
 *   /<id>/public                       -> 200, 491,438 bytes (image/png)
 *   /<id>/w=480                        -> 403
 *   /<id>/w=480,q=82,format=auto       -> 403
 *   /<id>/public?w=480                 -> 200, 491,438 bytes (param ignored)
 *
 * So the `/w=…,q=…,format=auto` URLs sketched in the refactor plan do NOT
 * work. Named variants are the supported path, and they are the better
 * fit anyway: fixed, cacheable, predictable URLs.
 *
 * ─── ACTION REQUIRED (one-time, Cloudflare dashboard) ────────────────────────
 * Create these four variants under Images -> Variants. Recommended settings,
 * tuned for this site's layout (see `sizes` below):
 *
 *   name    fit   width   metadata
 *   ------  ----  ------  ---------------------------
 *   thumb   scale 400     format auto
 *   card    scale 800     format auto
 *   wide    scale 1200    format auto
 *   full    scale 1600    format auto
 *
 * `format: auto` is what recovers the performance win: 4 of the 16 portfolio
 * images are currently served as PNG at 280-480 KB, and several are
 * photographic. Auto-format will serve WebP/AVIF where supported.
 *
 * Once created, set ACTIVE_VARIANT below to "card" — that is the only change
 * needed, and `srcSetFor` will emit all four.
 *
 * ─── Fallback ────────────────────────────────────────────────────────────────
 * Until then this stays on "public" (the original, unoptimised asset), which
 * WORKS today. It is correct but heavy — no broken images, just slow ones.
 */

/** Account hash. Already public in this repository's db.json. */
export const CF_ACCOUNT = "jz7aVQ2qyRcSQ0bsKclVwA";

const BASE = `https://imagedelivery.net/${CF_ACCOUNT}`;

/** The named variant in use. Change to "card" once the variants exist. */
export const ACTIVE_VARIANT = "public" as const;

/** Named variants to emit in `srcset`, smallest first. */
export const VARIANTS = ["thumb", "card", "wide", "full"] as const;
export type VariantName = (typeof VARIANTS)[number];

/** Intrinsic width of each named variant, used for the `srcset` width hint. */
export const VARIANT_WIDTHS: Record<string, number> = {
  thumb: 400,
  card: 800,
  wide: 1200,
  full: 1600,
  public: 1600,
};

/** True once the named variants have been created in Cloudflare. */
export const VARIANTS_CONFIGURED = ACTIVE_VARIANT !== "public";

/** URL for a single image id at a given variant. */
export function img(id: string, variant: string = ACTIVE_VARIANT): string {
  return `${BASE}/${id}/${variant}`;
}

/**
 * Builds a `srcset` from named variants.
 *
 * With only one variant configured (the current `public` fallback) there is no
 * srcset to build — the browser has no alternatives to choose from. Emitting
 * one anyway would just make every entry point at the same bytes.
 */
export function srcSet(id: string, variants: readonly string[] = VARIANTS): string | undefined {
  if (!VARIANTS_CONFIGURED) return undefined;
  return variants
    .map((v) => `${img(id, v)} ${VARIANT_WIDTHS[v] ?? 1600}w`)
    .join(", ");
}

/**
 * Tiny blurred placeholder for progressive loading.
 * Also uses a named variant, so it is a no-op until variants exist.
 */
export function lqip(id: string): string | undefined {
  return VARIANTS_CONFIGURED ? img(id, "thumb") : undefined;
}

/**
 * Pulls the Cloudflare image id out of a full imagedelivery.net URL.
 *
 * db.json stores full URLs. That is fine for existing content, but authoring
 * long-form posts by pasting a 90-character URL is unpleasant, so the Figure
 * component accepts a bare id and this lets both forms work.
 */
export function imageIdFromUrl(src: string): string | null {
  const match = src.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  return match ? match[1] : null;
}

/** True when `src` is a Cloudflare Images id rather than a local path. */
export function isCloudflareId(value: string): boolean {
  return !value.includes("/") && !value.startsWith("http");
}

/**
 * Resolves whatever the content gave us into a usable Cloudflare id, or null
 * if this is a local asset that should be rendered directly.
 */
export function resolveId(src: string): string | null {
  if (src.startsWith("http")) return imageIdFromUrl(src);
  return isCloudflareId(src) ? src : null;
}
