/**
 * color.ts — CSS colour parsing for the shader.
 *
 * The shader works in LINEAR light. Adding and mixing colours in sRGB the way
 * CSS does makes overlapping accents muddy and desaturated; in linear light
 * two gels crossing brighten toward white the way actual light does. The
 * theme tokens are authored as sRGB hex, so they are converted here on the way
 * in and converted back in the fragment shader on the way out.
 *
 * Only what the tokens actually use is supported — hex and `rgb()`/`rgba()`.
 * Anything else returns null so the caller can fall back rather than paint
 * with a guess.
 */

export type Rgb = [number, number, number];

const HEX_PATTERN = /^#([0-9a-f]+)$/i;
const RGB_PATTERN =
  /^rgba?\(\s*([\d.]+)\s*[\s,]\s*([\d.]+)\s*[\s,]\s*([\d.]+)/i;

/**
 * Parse a CSS colour to sRGB components in [0, 1].
 *
 * Alpha, where present, is ignored: the backdrop always paints opaque over
 * `--bg`, so a translucent token would only ever darken the result in a way
 * the caller cannot see coming.
 */
export function parseCssColor(value: string): Rgb | null {
  const input = value.trim();

  const hex = HEX_PATTERN.exec(input);
  if (hex) {
    const digits = hex[1];

    // #rgb and #rgba are shorthand for doubled digits; #rrggbb and #rrggbbaa
    // are literal. Anything else (5 or 7 digits) is malformed.
    if (
      digits.length !== 3 &&
      digits.length !== 4 &&
      digits.length !== 6 &&
      digits.length !== 8
    ) {
      return null;
    }

    let full = digits;
    if (digits.length <= 4) {
      full = "";
      for (let i = 0; i < digits.length; i++) {
        full += digits[i] + digits[i];
      }
    }

    return [
      parseInt(full.slice(0, 2), 16) / 255,
      parseInt(full.slice(2, 4), 16) / 255,
      parseInt(full.slice(4, 6), 16) / 255,
    ];
  }

  const rgb = RGB_PATTERN.exec(input);
  if (rgb) {
    return [
      Number(rgb[1]) / 255,
      Number(rgb[2]) / 255,
      Number(rgb[3]) / 255,
    ];
  }

  return null;
}

/**
 * sRGB transfer function, inverted.
 *
 * The `pow(c, 2.2)` shortcut is common but drifts most in the shadows — which
 * is exactly where this artwork lives, since it is a small amount of light
 * added to a very dark background. The exact curve costs nothing here.
 */
function srgbChannelToLinear(channel: number): number {
  if (channel <= 0.04045) return channel / 12.92;
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Convert sRGB components in [0, 1] to linear light. */
export function toLinear(rgb: Rgb): Rgb {
  return [
    srgbChannelToLinear(rgb[0]),
    srgbChannelToLinear(rgb[1]),
    srgbChannelToLinear(rgb[2]),
  ];
}
