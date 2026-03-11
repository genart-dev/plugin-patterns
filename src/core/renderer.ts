import type { GeneratedPath } from "./types.js";

/** Options for rendering generated pattern paths. */
export interface PatternRenderOptions {
  /** Line width in px. Default 2 */
  lineWidth: number;
  /** Line cap style. Default "round" */
  lineCap: CanvasLineCap;
  /** Stroke/fill color. Default "#000000" */
  color: string;
  /** Base opacity (0–1). Default 1 */
  opacity: number;
}

const DEFAULT_OPTIONS: PatternRenderOptions = {
  lineWidth: 2,
  lineCap: "round",
  color: "#000000",
  opacity: 1,
};

/**
 * Render generated pattern paths using lightweight Canvas2D primitives.
 * No brush engine dependency — all patterns render as crisp geometric marks.
 *
 * - Lines → ctx.stroke()
 * - Dots (single-point paths) → ctx.arc() + ctx.fill()
 * - Multi-point paths → ctx.moveTo/lineTo + ctx.stroke()
 */
export function renderPatternPaths(
  ctx: CanvasRenderingContext2D,
  paths: GeneratedPath[],
  options: Partial<PatternRenderOptions> = {},
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  ctx.strokeStyle = opts.color;
  ctx.fillStyle = opts.color;
  ctx.lineCap = opts.lineCap;
  ctx.lineJoin = "round";

  for (const gp of paths) {
    const effectiveSize = opts.lineWidth * gp.sizeScale;
    const effectiveOpacity = gp.opacityScale * opts.opacity;

    if (gp.points.length === 2) {
      const p0 = gp.points[0]!;
      const p1 = gp.points[1]!;
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;

      // Single-point stipple dot: distance < 1px
      if (dx * dx + dy * dy < 1) {
        ctx.globalAlpha = effectiveOpacity;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, effectiveSize / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
    }

    // Multi-point path: use native stroke
    ctx.globalAlpha = effectiveOpacity;
    ctx.lineWidth = effectiveSize;
    ctx.beginPath();
    const first = gp.points[0]!;
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < gp.points.length; i++) {
      const pt = gp.points[i]!;
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
}
