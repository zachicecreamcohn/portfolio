"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroBackdrop.module.css";
import {
  PEAK,
  RULE_FLOOR,
  RULE_SPACING_CSS,
  RULE_WIDTH_CSS,
  SHADOW_EDGE_SOFTNESS,
  SHADOW_FADE,
  SHADOW_LENGTH,
  SHADOW_MAP_ANGLES,
  SHADOW_MAP_STEPS,
  SHADOW_MAX_DISTANCE,
  createArtUniforms,
  ruledLightFragmentShader,
  ruledLightVertexShader,
  shadowMapFragmentShader,
} from "./art";
import { rasteriseInk } from "./ink";
import { parseCssColor, toLinear } from "@/lib/color";
import { seedFromText } from "@/lib/seed";

/**
 * HeroBackdrop — generated background artwork for the home hero.
 *
 * The artwork itself lives in `art.ts`; this file is the apparatus around it.
 *
 * Weight: OGL is imported dynamically *after* mount, so it is code-split out of
 * the route's initial JavaScript. First paint is the plain `--bg` from
 * globals.css and nothing here delays it.
 *
 * Identity: the seed is a hash of the page's own text, so a page's artwork is a
 * pure function of its copy — unique per page, identical on every reload, for
 * every visitor, with nothing stored. See `seedFromText`.
 *
 * Colour: monochrome, and deliberately coupled to nothing. The shader is built
 * from --bg and --text, which are neutral greys declared once in globals.css
 * and never overridden per theme, so there is no theme to observe and no accent
 * token in play.
 */

type Ogl = typeof import("ogl");

const MAX_DPR = 2;

/**
 * Ceiling on shaded pixels. This shader is a grid, one exponential, and a small
 * loop over the occluder boxes — no marching, no texture fetches — so the
 * budget is generous. A 5K display at 2x would still ask for 30M pixels of it.
 */
const MAX_DRAWING_PIXELS = 3500000;

/**
 * Time constant, in seconds, for the light's easing. Short enough that the
 * light feels attached to the pointer, long enough that it glides rather than
 * snaps — the pointer drives the light, but the light is not welded to it.
 */
const POINTER_TIME_CONSTANT = 0.35;

/**
 * When nothing is moving, the only remaining motion is the no-pointer drift,
 * which travels well under a pixel per second. Repainting that at 60fps would
 * spend GPU to change nothing on screen.
 */
const IDLE_PAINT_INTERVAL_MS = 200;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface HeroBackdropProps {
  /**
   * Override the seed source. Defaults to the text content of `<main>`, which
   * is what makes the artwork per-page automatically. Pass this only to pin a
   * seed that should survive copy edits.
   */
  seedText?: string;
}

export default function HeroBackdrop({ seedText }: HeroBackdropProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let scene: { dispose: () => void } | null = null;
    let disposed = false;

    void import("ogl")
      .then((ogl) => {
        // Unmounted while the chunk was still in flight.
        if (disposed) return;
        scene = startScene(ogl, host, seedText);
      })
      .catch((error) => {
        /*
         * Almost always this means no WebGL: an old browser, a blocklisted GPU
         * driver, a headless renderer. The page is already complete without the
         * artwork, so production stays quiet — there is nothing to report and
         * nothing to retry.
         *
         * In development, though, the other cause is a shader that failed to
         * compile, and OGL's thrown error is the only thing that says so.
         * Swallowing it silently would turn a typo in art.ts into an invisible
         * blank background.
         */
        if (process.env.NODE_ENV !== "production") {
          console.warn("[HeroBackdrop] artwork disabled:", error);
        }
      });

    return () => {
      disposed = true;
      if (scene) scene.dispose();
    };
  }, [seedText]);

  return <div ref={hostRef} className={styles.backdrop} aria-hidden="true" />;
}


function startScene(ogl: Ogl, host: HTMLElement, seedText?: string) {
  const { Renderer, Program, Mesh, Triangle, RenderTarget } = ogl;

  /* ---------------------------------------------------------------- seed */

  /*
   * Read <main> rather than taking the copy as a prop, so this works unchanged
   * on any page it is dropped into.
   *
   * `textContent` and not `innerText`: the hash must not depend on CSS, or the
   * artwork would silently redraw the day a breakpoint started hiding an
   * element. (`innerText` would also force a layout read here.)
   *
   * Scoped to <main> on purpose. The nav is byte-identical on every page, so
   * including it would pull every seed closer together, and it varies with
   * unrelated state — whether a published post exists, whether Tools is shown.
   */
  const source =
    seedText ?? document.getElementById("main")?.textContent ?? "";
  const seed = seedFromText(source);
  const art = createArtUniforms(seed);

  const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

  /* ------------------------------------------------------------ renderer */

  const renderer = new Renderer({
    dpr: 1,
    // The shader paints --bg itself, so the canvas is opaque. That keeps the
    // result identical to the rest of the page with no blending surprises.
    alpha: false,
    // Every edge here is either a hairline or the antialiased edge of a glyph in
    // the ink mask; MSAA would cost bandwidth to antialias what is already
    // antialiased.
    antialias: false,
    depth: false,
    stencil: false,
  });

  const gl = renderer.gl;
  host.appendChild(gl.canvas);

  /*
   * The page's own ink, rasterised to a silhouette the rays are cast through.
   * Uploaded as a texture because the occluder is now an arbitrary shape rather
   * than a handful of boxes — there is no uniform budget that could carry a
   * glyph.
   *
   * The source canvas is created before the renderer attaches anything, so
   * nothing about the artwork can influence the layout being measured.
   */
  const { Texture } = ogl;
  const initialInk = rasteriseInk(
    host.clientWidth || window.innerWidth,
    host.clientHeight || window.innerHeight
  );

  const inkTexture = new Texture(gl, {
    image: initialInk ? initialInk.source : document.createElement("canvas"),
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    // Canvas rows run top-down and uv runs bottom-up, so the upload is flipped.
    flipY: true,
    premultiplyAlpha: false,
  });

  /*
   * PASS 1 — angular shadow map.
   *
   * One texel per angle around the light, each holding the distance to the first
   * ink in that direction. Marching here rather than per pixel is what makes the
   * shadows correct: a per-pixel march takes a handful of samples along each
   * ray, and because which samples land on ink changes discontinuously as the
   * ray rotates, it paints concentric rings. This pass runs once per angle, so
   * it can afford a sample per mask texel and has no such aliasing.
   *
   * NEAREST filtering is required, not preferred: the texel is a packed 16-bit
   * distance, and interpolating the two channels separately would corrupt it.
   * If this program fails to link, OGL logs the info log and returns early, and
   * the failure surfaces later as a wildly unhelpful error from inside OGL —
   * hence the explicit checks.
   */
  const mapProgram = new Program(gl, {
    vertex: ruledLightVertexShader,
    fragment: shadowMapFragmentShader,
    uniforms: {
      uInk: { value: inkTexture },
      uLight: { value: [art.rest[0], art.rest[1]] },
      uStep: { value: SHADOW_MAX_DISTANCE / SHADOW_MAP_STEPS },
    },
    depthTest: false,
    depthWrite: false,
  });

  const mapTarget = new RenderTarget(gl, {
    width: SHADOW_MAP_ANGLES,
    height: 1,
    depth: false,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
  });

  const mapMesh = new Mesh(gl, { geometry: new Triangle(gl), program: mapProgram });

  /* --------------------------------------------------------- pass 2 setup */

  const uniforms = {
    uResolution: { value: [1, 1] },
    uLight: { value: [art.rest[0], art.rest[1]] },
    uSpread: { value: art.spread },
    uCell: { value: RULE_SPACING_CSS },
    uRuleWidth: { value: RULE_WIDTH_CSS },
    uFloor: { value: RULE_FLOOR },
    uPeak: { value: PEAK },
    uInk: { value: inkTexture },
    uShadowMap: { value: mapTarget.texture },
    uMapAngles: { value: SHADOW_MAP_ANGLES },
    uEdgeSoftness: { value: SHADOW_EDGE_SOFTNESS },
    uShadowLength: { value: SHADOW_LENGTH },
    uShadowFade: { value: SHADOW_FADE },
    uBgLin: { value: [0, 0, 0] },
    uInkLin: { value: [1, 1, 1] },
  };

  const program = new Program(gl, {
    vertex: ruledLightVertexShader,
    fragment: ruledLightFragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  // Write through the programs' own uniform maps: OGL is free to keep a
  // reference or a copy of what was passed in, and this is correct either way.
  const values = program.uniforms;
  const mapValues = mapProgram.uniforms;

  if (process.env.NODE_ENV !== "production") {
    /*
     * A shader that fails to LINK does not throw: OGL logs the info log with
     * console.warn and returns from its constructor early, leaving
     * uniformLocations undefined, and the failure then surfaces on the first
     * draw as a baffling "cannot read properties of undefined (reading
     * 'forEach')" from inside OGL. Say what actually happened instead.
     */
    for (const [name, candidate] of [
      ["shadow map", mapProgram],
      ["picture", program],
    ] as const) {
      if (!candidate.uniformLocations) {
        console.error(
          `[HeroBackdrop] the ${name} shader failed to link — see the WebGL ` +
            "info log logged above."
        );
      }
    }
  }

  /* --------------------------------------------------------------- colour */

  /*
   * Resolved from the live cascade rather than duplicated here, so globals.css
   * stays the single source of truth. Read once: both tokens are declared in
   * :root and no theme overrides them, so there is nothing to re-read when the
   * theme changes.
   */
  const root = document.documentElement;
  const computed = getComputedStyle(root);

  const bg = parseCssColor(computed.getPropertyValue("--bg"));
  const ink = parseCssColor(computed.getPropertyValue("--text"));

  if (bg) values.uBgLin.value = toLinear(bg);
  if (ink) values.uInkLin.value = toLinear(ink);

  /* ----------------------------------------------------------------- run */

  let disposed = false;
  let running = false;
  let frameId = 0;
  let lastFrame = 0;
  let lastPaint = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  let elapsed = 0;
  /** True once a real pointer has moved, which retires the resting drift. */
  let hasPointer = false;
  /** Coalesces scroll-triggered re-rasterisation to one per frame. */
  let scrollRaf = 0;

  const light = {
    target: [art.rest[0], art.rest[1]] as [number, number],
    current: [art.rest[0], art.rest[1]] as [number, number],
  };

  /**
   * Re-rasterise the silhouette and hand it to the GPU.
   *
   * Called on resize, because the copy rewraps and its glyph positions change,
   * and once the webfonts land, because until then the boxes would be measured
   * against the fallback face and every shadow would sit slightly off its word.
   */
  function updateInk() {
    const measured = rasteriseInk(
      host.clientWidth || window.innerWidth,
      host.clientHeight || window.innerHeight
    );
    if (!measured) return;

    // Swapping the image and flagging it is what OGL uploads on next use;
    // recreating the texture would churn a GL object per resize.
    inkTexture.image = measured.source;
    inkTexture.needsUpdate = true;

    if (!running) draw();
  }

  function draw() {
    const position = [light.current[0], light.current[1]];

    // Pass 1: rebuild the angular shadow map for the light's new position, then
    // pass 2: paint the picture through it. Order matters — pass 2 samples what
    // pass 1 just wrote.
    mapValues.uLight.value = position;
    renderer.render({ scene: mapMesh, target: mapTarget });

    values.uLight.value = position;
    renderer.render({ scene: mesh });
  }

  function frame(now: number) {
    frameId = window.requestAnimationFrame(frame);

    if (!lastFrame) lastFrame = now;
    // Clamped, so returning to a backgrounded tab cannot teleport the light.
    const dt = Math.min((now - lastFrame) / 1000, 1 / 30);
    lastFrame = now;
    elapsed += dt;

    if (!hasPointer) {
      /*
       * Nothing to follow — a touch device, or a mouse that has not moved yet.
       * Drift 2% of the viewport on a ~105s period: under a pixel per second,
       * present enough that the page is not dead, slow enough that it never
       * asks to be looked at.
       */
      light.target[0] = art.rest[0] + Math.sin(elapsed * 0.06) * 0.02;
      light.target[1] = art.rest[1] + Math.cos(elapsed * 0.045) * 0.02;
    }

    /*
     * Frame-rate independent easing. The naive `current += (target - current)
     * * k` with a constant k converges twice as fast at 120Hz as at 60Hz, so
     * the light would feel snappier on a ProMotion display from the same code.
     */
    const catchUp = 1 - Math.exp(-dt / POINTER_TIME_CONSTANT);
    light.current[0] += (light.target[0] - light.current[0]) * catchUp;
    light.current[1] += (light.target[1] - light.current[1]) * catchUp;

    const settled =
      Math.abs(light.target[0] - light.current[0]) < 0.0004 &&
      Math.abs(light.target[1] - light.current[1]) < 0.0004;

    // While the light is catching up this paints every frame, so the follow
    // stays smooth; once it settles, only the resting drift is left and that
    // can be painted at a fraction of the rate.
    if (settled && now - lastPaint < IDLE_PAINT_INTERVAL_MS) return;

    lastPaint = now;
    draw();
  }

  function start() {
    // Reduced motion never animates, so there is no loop to start.
    if (running || motionQuery.matches) return;
    running = true;
    lastFrame = 0;
    frameId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  /* -------------------------------------------------------------- events */

  function onPointerMove(event: PointerEvent) {
    /*
     * Mouse and pen only. A touch drag is how the page is scrolled on a phone,
     * and letting a scrolling thumb drag the light around would be exactly the
     * restlessness this design is trying to avoid.
     */
    if (event.pointerType === "touch") return;

    hasPointer = true;
    light.target[0] = event.clientX / window.innerWidth;
    light.target[1] = 1 - event.clientY / window.innerHeight;
  }

  function onVisibilityChange() {
    // A hidden tab only needs the pixels it is not showing to stop costing.
    if (document.hidden) stop();
    else start();
  }

  function onMotionChange() {
    if (motionQuery.matches) {
      stop();
      // One still frame — still seeded, so still this page's artwork, just not
      // moving.
      draw();
    } else {
      start();
    }
  }

  /*
   * The ink is rasterised from live viewport positions, and the backdrop is
   * fixed, so scrolling moves the copy relative to the mask and the shadows
   * would sit off their words. Re-rasterise on scroll — `getBoundingClientRect`
   * already reports the scrolled position, so no offset maths — coalesced to one
   * per frame so a fling does not re-layout and re-draw more often than paint.
   */
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = 0;
      if (!disposed) updateInk();
    });
  }

  function resize() {
    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || window.innerHeight;

    /*
     * A no-op resize still runs renderer.setSize, which resets the canvas buffer
     * to black. Guard it so a redundant ResizeObserver callback (or the init
     * double-fire) never clears a live frame.
     */
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;

    /*
     * Cap the total shaded pixels. At native density the hairlines stay crisp,
     * so this only ever bites on very large or very dense displays.
     */
    const density = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const ceiling = Math.sqrt(
      MAX_DRAWING_PIXELS / Math.max(width * height, 1)
    );
    // Floored at 1: below that the hairlines alias into a moire and stop
    // looking ruled.
    renderer.dpr = Math.max(1, Math.min(density, ceiling));
    renderer.setSize(width, height);

    /*
     * The rules are specified in CSS pixels but resolved in device pixels, so
     * that both the spacing and the line weight hold their physical size at any
     * density. Without this the grid would visibly change weight on a retina
     * display versus a standard one.
     */
    values.uCell.value = RULE_SPACING_CSS * renderer.dpr;
    values.uRuleWidth.value = RULE_WIDTH_CSS * renderer.dpr;
    values.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];

    // The copy rewraps when the viewport changes, so its boxes have to be
    // measured again rather than rescaled.
    updateInk();

    if (!running) draw();
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  motionQuery.addEventListener("change", onMotionChange);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  /*
   * Webfonts land after first paint and move the text, so until this resolves
   * the occluder boxes are measured against the fallback face and the shadows
   * sit slightly off the words that cast them. This one is load-bearing.
   */
  if (document.fonts && document.fonts.ready) {
    void document.fonts.ready
      .then(() => {
        if (!disposed) updateInk();
      })
      .catch(() => {});
  }

  // First frame is painted; let CSS fade the canvas in.
  host.dataset.ready = "true";

  if (motionQuery.matches) {
    draw();
  } else {
    start();
  }

  /* -------------------------------------------------------------- teardown */

  return {
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);

      program.remove();

      /*
       * OGL has no renderer-level teardown, and a WebGL context that is merely
       * dropped still counts against the browser's context limit until it is
       * collected. Losing it explicitly releases it now rather than after a
       * route change or two.
       */
      const loseContext = gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();

      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    },
  };
}
