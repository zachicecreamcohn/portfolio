/*
 * art.ts — THE ARTWORK. This is the file to replace when the look changes.
 *
 * Everything else in `HeroBackdrop/` is apparatus: renderer lifecycle, pointer
 * handling, accessibility, performance. This file owns only the shaders and the
 * mapping from a seed to that shader's parameters.
 *
 * ---------------------------------------------------------------------------
 * Direction: RULED LIGHT, CAST BY THE TYPE.
 *
 * A faint drafting grid on a black surface. A single light follows the pointer
 * and illuminates the rules; the page's own words sit between that light and the
 * surface, so they cast ordinary shadows — and the shadows are the picture.
 *
 * The occluder is the GLYPH SILHOUETTE — `ink.ts` rasterises the real
 * letterforms — and the shadows are resolved in two passes.
 *
 *   PASS 1 (SHADOW MAP)  For each of a few thousand angles around the light,
 *                        march outward through the silhouette and record the
 *                        distance to the first ink. One texel per angle.
 *
 *   PASS 2 (THE PICTURE) For each pixel, look up its angle and compare its
 *                        distance to the light against that recorded distance.
 *                        One or two texture reads, no marching.
 *
 * The two-pass split is not an optimisation, it is what makes the shadows
 * correct. Marching per pixel was tried first and produced concentric rings
 * radiating from the light: `max` over discrete samples is discontinuous in ray
 * DIRECTION, so as the ray rotates, samples sweep in and out of glyph strokes.
 * Finer steps only make finer rings, and blurring the silhouette to hide them
 * destroys the letterforms, which are the entire point. Marching per ANGLE
 * instead lets that march be as fine as it likes — it runs a few thousand times,
 * not a few million — and leaves no directional aliasing to ring.
 *
 * Three further properties worth noting:
 *
 *   1. MONOCHROME. Drawn from --bg and --text only. Both are neutral greys and
 *      neither is overridden per theme, so the artwork is greyscale by
 *      construction. No accent token is referenced, and there is no theme to
 *      observe.
 *
 *   2. CALM. There is no shader-side animation at all — no time uniform. A still
 *      page is completely still. The only motion is the light following the
 *      pointer, eased. (The no-pointer case drifts by 2% of the viewport over a
 *      ~105s period.)
 *
 *   3. THE COPY SELF-PROTECTS. A fragment inside a glyph's halo counts as blocked
 *      regardless of the light, so the words sit on the darkest part of the
 *      surface and the effect that draws the shadows is the same one that keeps
 *      the copy legible.
 */

import { makeRandom } from "@/lib/seed";

/* ------------------------------------------------------------------ tuning */

/**
 * Minor rule spacing, in CSS pixels. Converted to device pixels at runtime so
 * the grid keeps the same physical size whatever the display density or the
 * resolution cap does.
 */
export const RULE_SPACING_CSS = 32;

/** Rule thickness, in CSS pixels. */
export const RULE_WIDTH_CSS = 0.75;

/** The grid away from the light. Present, but close to a whisper. */
export const RULE_FLOOR = 0.003;

/**
 * Peak brightness the light adds to a rule, as a mix toward --text.
 *
 * This is the only fill in the artwork: the light brightens the rules and
 * nothing else, so the surface between them — and every shadowed area — stays
 * black.
 */
export const PEAK = 0.07;

/** Angular resolution of the shadow map: one texel per angle. */
export const SHADOW_MAP_ANGLES = 2048;

/**
 * Iterations of the shadow map's own march. Each is one texture read, but the
 * pass runs once per ANGLE rather than once per pixel, so this can be an order
 * of magnitude finer than anything affordable per pixel — which is exactly why
 * the letterforms survive.
 *
 * The loop bound has to be a compile-time constant in GLSL ES 1.00, so the step
 * is a uniform instead: MAX_DISTANCE / STEPS.
 */
export const SHADOW_MAP_STEPS = 1024;

/**
 * Furthest an occluder is looked for, in uv. Past this, light is treated as
 * unobstructed — comfortably beyond the point where the light's own falloff has
 * died out.
 */
export const SHADOW_MAX_DISTANCE = 3.0;

/**
 * Softness of the shadow edge, in uv. The map's angular resolution already
 * quantises the edge to a couple of pixels; this is what keeps it from
 * stair-stepping.
 */
export const SHADOW_EDGE_SOFTNESS = 0.0025;

/**
 * How far a glyph's shadow reaches, as a multiple of that glyph's distance from
 * the light. This is the light's HEIGHT, expressed as the one number that
 * matters.
 *
 * Put the letters on a plane at height H and the light at height h above it, and
 * a surface point only sees a glyph if its ray toward the light meets that glyph
 * within the first H/h of its climb. A glyph's shadow therefore stops at
 * k = h/(h-H) times its own distance from the light, instead of running away to
 * infinity as it does for a light lying in the same plane as the letters.
 *
 *   k -> infinity   light level with the letters: shadows that stretch across
 *                   the page and magnify into huge letterforms
 *   k = 2           light roughly twice as high as the letters are tall
 *   k -> 1          light at infinity: no shadow at all, a flat even wash
 *
 * There is a second, mechanical reason this must stay comfortably above 1: the
 * shadow is `enters * leaves`, where `enters` rises at the glyph and `leaves`
 * falls past the shadow's end. Those two ramps only overlap when k is well over
 * 1 — at k = 1.35 the shadow never got past ~0.4 strength. A larger k makes the
 * shadow both longer and darker.
 */
export const SHADOW_LENGTH = 2.5;

/**
 * Fraction of the shadow's length over which its far end fades out.
 *
 * A point source would end the shadow abruptly at exactly k times the distance,
 * which reads as a cut-out. A real source has size, and this stands in for the
 * penumbra that follows from it — and is what makes the result read as diffuse
 * rather than as a stencil.
 */
export const SHADOW_FADE = 0.7;

/**
 * Coverage in the halo channel at which a fragment counts as copy. `ink.ts`
 * strokes each glyph as well as filling it, so this thresholds a genuine
 * dilation of the letterforms — the margin that keeps the words legible.
 */
export const HALO_THRESHOLD = 0.35;

/* ------------------------------------------------------------------ shaders */

/*
 * NOTE: the shaders are template literals, so anything meant to come from
 * TypeScript has to be written as interpolation, and anything NOT interpolated
 * must be valid GLSL on its own. Forgetting that once produced an undeclared
 * identifier as an array size, a failed link, and a very confusing error from
 * inside OGL.
 */

/**
 * GLSL ES 1.00 has no implicit int-to-float conversion, so a whole number
 * interpolated into a float context has to be written with a decimal point or
 * the shader will refuse to compile.
 */
function glslFloat(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

/**
 * Full-screen triangle. OGL's `Triangle` supplies a clip-space `position` that
 * overdraws the viewport and a `uv` that interpolates 0..1 across the visible
 * region, so both passes use it unchanged.
 */
export const ruledLightVertexShader = `
precision highp float;

attribute vec2 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * PASS 1 — one texel per angle: how far from the light the first ink is.
 *
 * The map is written with NEAREST filtering because its two channels are a
 * packed 16-bit number, and packed values cannot be interpolated component-wise.
 * The reading side unpacks the two neighbouring angles and interpolates those.
 */
export const shadowMapFragmentShader = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uInk;
uniform vec2  uLight;
uniform float uStep;

#define MAP_STEPS ${SHADOW_MAP_STEPS}
#define MAX_DIST ${glslFloat(SHADOW_MAX_DISTANCE)}
#define TWO_PI 6.28318530718

void main() {
  // vUv.x sweeps 0..1 across the map, so each texel is one angle. This has to
  // match the angle convention used in pass 2 exactly.
  float angle = (vUv.x - 0.5) * TWO_PI;
  vec2 dir = vec2(cos(angle), sin(angle));

  float distance = MAX_DIST;
  float found = 0.0;
  float travelled = 0.0;

  /*
   * Walk outward until the first ink. Once found, the rest of the loop still
   * runs — GLSL ES 1.00 wants a constant bound and this is cheap at one texel
   * per angle — but stops writing.
   */
  for (int i = 0; i < MAP_STEPS; i++) {
    travelled += uStep;
    float ink = texture2D(uInk, uLight + dir * travelled).r;
    if (found < 0.5 && ink > 0.5) {
      distance = travelled;
      found = 1.0;
    }
  }

  /*
   * 16-bit encode across two channels. A single 8-bit channel would quantise the
   * shadow edge to steps of 1/255 of the range — several pixels — which shows up
   * as concentric banding along every edge.
   */
  float scaled = clamp(distance / MAX_DIST, 0.0, 1.0) * 255.0;
  float hi = floor(scaled);
  gl_FragColor = vec4(hi / 255.0, scaled - hi, 0.0, 1.0);
}
`;

/**
 * PASS 2 — the picture.
 */
export const ruledLightFragmentShader = `
precision highp float;

varying vec2 vUv;

uniform vec2  uResolution;
uniform vec2  uLight;
uniform float uSpread;
uniform float uCell;
uniform float uRuleWidth;
uniform float uFloor;
uniform float uPeak;
uniform sampler2D uInk;
uniform sampler2D uShadowMap;
uniform float uMapAngles;
uniform float uEdgeSoftness;
uniform float uShadowLength;
uniform float uShadowFade;
uniform vec3  uBgLin;
uniform vec3  uInkLin;

#define MAJOR 5.0
#define MAX_DIST ${glslFloat(SHADOW_MAX_DISTANCE)}
#define HALO ${glslFloat(HALO_THRESHOLD)}
#define TWO_PI 6.28318530718

/* Unpack the distance recorded for one angular texel, wrapping at the seam. */
float occluderDistance(float index) {
  float wrapped = mod(index, uMapAngles);
  vec2 encoded = texture2D(uShadowMap, vec2((wrapped + 0.5) / uMapAngles, 0.5)).rg;
  return (encoded.r * 255.0 + encoded.g) / 255.0 * MAX_DIST;
}

/* The exact inverse of the sRGB curve applied in src/lib/color.ts. */
vec3 linearToSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), c));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  /*
   * This fragment's relationship to the page's ink. R is crisp glyph coverage,
   * G is the same silhouette dilated by a few pixels.
   */
  vec4 ink = texture2D(uInk, uv);

  /*
   * Copy is opaque to the light. The halo channel (G) is the glyph dilated by a
   * few pixels, so a fragment inside any glyph's margin counts as blocked no
   * matter where the light is — this keeps the words on the darkest surface and
   * legible without separate masking.
   */
  float blocked = step(HALO, ink.g);

  /*
   * Vector FROM the light TO this fragment, and how far. The shadow map is
   * indexed by the ray leaving the light, so the direction must be light -> uv
   * here too — sampling it with the opposite vector (uv -> light) mirrors every
   * shadow to the far side of the light.
   */
  vec2 delta = uv - uLight;
  float dist = length(delta);

  if (dist > 1e-4) {
    float angle = atan(delta.y, delta.x);
    float position = angle / TWO_PI + 0.5;

    // Interpolate between the two neighbouring angles by hand, because the map
    // itself cannot be filtered.
    float u = position * uMapAngles - 0.5;
    float base = floor(u);
    float fraction = u - base;

    float occluder = mix(
      occluderDistance(base),
      occluderDistance(base + 1.0),
      fraction
    );

    /*
     * Shadowed once this fragment is further from the light than the nearest
     * glyph in its direction, and un-shadowed again past where that shadow can
     * reach — because the light is above the plane, not lying in it. See the
     * SHADOW_LENGTH note.
     *
     * "hasOccluder" is zero for the directions where the march found no glyph
     * (it bottomed out at MAX_DIST): those are "nothing to shadow", not "a glyph
     * at the very edge", and must not read as a spurious shadow ring.
     */
    float hasOccluder = step(occluder, MAX_DIST - 0.001);

    float enters = smoothstep(
      occluder - uEdgeSoftness,
      occluder + uEdgeSoftness,
      dist
    );

    float reach = occluder * uShadowLength;
    float leaves = 1.0 - smoothstep(reach * (1.0 - uShadowFade), reach, dist);

    blocked = max(blocked, enters * leaves * hasOccluder);
  }

  /* ------------------------------------------------------------------ grid */

  /*
   * The rules, resolved on the device pixel grid so hairlines do not shimmer as
   * the light crosses them. distToRule is the distance in device pixels to the
   * nearest rule.
   */
  vec2 px = uv * uResolution;
  vec2 cell = px / uCell;

  float distToRule = min(
    abs(fract(cell.x) - 0.5) * uCell,
    abs(fract(cell.y) - 0.5) * uCell
  );
  float rule = 1.0 - smoothstep(0.0, uRuleWidth, distToRule);

  /*
   * Every fifth rule is heavier, the way drafting paper and light plots are
   * ruled. max() rather than addition so a major rule does not double-brighten
   * where it crosses a minor one.
   */
  float distToMajor = min(
    abs(fract(cell.x / MAJOR) - 0.5) * uCell * MAJOR,
    abs(fract(cell.y / MAJOR) - 0.5) * uCell * MAJOR
  );
  float major = 1.0 - smoothstep(0.0, uRuleWidth * 1.15, distToMajor);

  float lines = max(rule * 0.55, major);

  /* ----------------------------------------------------------------- light */

  /*
   * The cursor's light, aspect-corrected so it reads round. It brightens only
   * the rules — the surface between them stays black — and is cut by the glyphs
   * and their shadows, so the light is exactly the picture and nothing washes
   * the grid out.
   */
  float d = length((uv - uLight) * vec2(aspect, 1.0));
  float wash = exp(-d * d * uSpread) * (1.0 - blocked);

  float amount = clamp(lines * (uFloor + wash * uPeak), 0.0, 1.0);

  gl_FragColor = vec4(linearToSrgb(mix(uBgLin, uInkLin, amount)), 1.0);
}
`;

/* ------------------------------------------------------------------- seeds */

/** The seed-derived values for one composition. */
export interface ArtUniforms {
  /** Where the light rests when there is no pointer. */
  rest: [number, number];
  /** Tightness of the light pool. */
  spread: number;
}

/**
 * Map a seed to this artwork's parameters.
 *
 * The grid is deliberately NOT seeded: a technical lattice that rearranged
 * itself per page would be noise, not identity. What varies is the light.
 */
export function createArtUniforms(seed: number): ArtUniforms {
  const random = makeRandom(seed);

  return {
    /*
     * Rest to the right of and below the copy, so a still page is composed: the
     * headline throws its shadow up and to the left across the already-dark side
     * of the page, while the open lower right stays lit.
     */
    rest: [0.78 + random() * 0.16, 0.18 + random() * 0.20],
    spread: 7.0 + random() * 3.0,
  };
}
