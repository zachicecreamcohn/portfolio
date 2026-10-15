/**
 * seed.ts — deterministic seeding for the generative artwork.
 *
 * The brief was to derive the seed from "all the text content on the page", so
 * every page gets its own artwork and that artwork never changes. Two
 * consequences drive the design:
 *
 *   1. `Math.random()` is used nowhere in the artwork pipeline. Every value the
 *      shader receives comes from `makeRandom()`, so a composition is a pure
 *      function of the page copy: the same words always draw the same picture,
 *      on every reload, for every visitor, with nothing stored anywhere.
 *
 *   2. The hash is taken over *normalised* text. Re-wrapping a paragraph or
 *      re-indenting a JSX file must not silently redraw the art, so every run
 *      of whitespace collapses to a single space first.
 *
 * Deliberately pure and dependency-free: this is also the hook for per-post
 * artwork (seed from a slug) or build-time Open Graph images later, neither of
 * which will have a DOM to read from.
 */

/**
 * xmur3 — string to a 32-bit unsigned integer.
 *
 * Chosen over a naive `charCodeAt` sum because it avalanches: changing one
 * character changes roughly half the output bits. A rolling sum would give
 * near-identical seeds to near-identical copy, and near-identical seeds give
 * near-identical artwork, which defeats the point.
 */
function xmur3(input: string): number {
  let h = 1779033703 ^ input.length;

  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);

  return (h ^= h >>> 16) >>> 0;
}

/**
 * mulberry32 — a 32-bit seed to a stream of floats in [0, 1).
 *
 * Small, fast, and good enough for aesthetics. It is emphatically not
 * cryptographic, and nothing here needs it to be: the seed is derived from
 * public page copy, never from anything secret.
 */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;

  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;

    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Collapse formatting whitespace so re-indenting markup cannot change the art. */
export function normalizeSeedText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** The artwork seed for a block of page copy. */
export function seedFromText(text: string): number {
  return xmur3(normalizeSeedText(text));
}
