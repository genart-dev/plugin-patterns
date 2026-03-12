import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import type { PatternRegion } from "../core/types.js";
import { applyRegionClip } from "../core/region-utils.js";

// ---------------------------------------------------------------------------
// Property schema
// ---------------------------------------------------------------------------

const MEMPHIS_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "classic",
    options: [
      { value: "classic", label: "Classic" },
      { value: "confetti", label: "Confetti" },
      { value: "geometric", label: "Geometric" },
      { value: "squiggle", label: "Squiggle" },
    ],
    group: "memphis",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 20,
    min: 6,
    max: 100,
    step: 1,
    group: "memphis",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#e74c3c",
    group: "memphis",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#f1c40f",
    group: "memphis",
  },
  {
    key: "color3",
    label: "Color 3",
    type: "color",
    default: "#3498db",
    group: "memphis",
  },
  {
    key: "density",
    label: "Density",
    type: "number",
    default: 40,
    min: 5,
    max: 100,
    step: 1,
    group: "memphis",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "memphis",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "memphis",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "memphis",
  },
];

const VALID_STYLES = ["classic", "confetti", "geometric", "squiggle"];

// ---------------------------------------------------------------------------
// Seeded PRNG + jittered grid
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Hash-based jitter for grid cell — returns 0..1 */
function cellHash(row: number, col: number, channel: number): number {
  let h = (row | 0) * 374761393 + (col | 0) * 668265263 + (channel | 0) * 2654435761;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return ((h & 0x7fffffff) >>> 0) / 0x7fffffff;
}

interface JitteredPoint { x: number; y: number; rng1: number; rng2: number; rng3: number; }

/** Generate evenly-spaced jittered points across an area.
 *  minSpacing sets a floor on cell size (prevents packed grids for large shapes). */
function jitteredGrid(
  diagonal: number,
  density: number,
  seed: number,
  minSpacing: number = 30,
): JitteredPoint[] {
  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.max(1, Math.floor((area / 10000) * density));
  // Cell size: at least minSpacing to prevent over-packing
  const cellSize = Math.max(minSpacing, Math.sqrt(area / count));
  const cols = Math.ceil((diagonal * 2) / cellSize) + 2;
  const rows = Math.ceil((diagonal * 2) / cellSize) + 2;
  const points: JitteredPoint[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Random skip ~15% of cells for organic feel
      const skipHash = cellHash(row + seed, col, 5);
      if (skipHash < 0.15) continue;

      const jx = cellHash(row + seed, col, 0);
      const jy = cellHash(row + seed, col, 1);
      points.push({
        x: -diagonal + (col + jx) * cellSize,
        y: -diagonal + (row + jy) * cellSize,
        rng1: cellHash(row + seed, col, 2),
        rng2: cellHash(row + seed, col, 3),
        rng3: cellHash(row + seed, col, 4),
      });
    }
  }
  return points;
}

// ---------------------------------------------------------------------------
// Memphis renderers
// ---------------------------------------------------------------------------

function renderClassic(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const points = jitteredGrid(diagonal, density, 42, size * 2);
  const colors = [color1, color2, color3];

  for (const pt of points) {
    const angle = pt.rng1 * Math.PI * 2;
    const s = size * (0.5 + pt.rng2 * 0.8);
    const shape = Math.floor(pt.rng3 * 4);
    const ci = Math.floor(pt.rng1 * 3 + pt.rng2) % colors.length;
    ctx.fillStyle = colors[ci]!;
    ctx.strokeStyle = colors[(ci + 1) % colors.length]!;
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);

    switch (shape) {
      case 0: // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 1: // Circle
        ctx.beginPath();
        ctx.arc(0, 0, s / 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 2: // Line
        ctx.beginPath();
        ctx.moveTo(-s / 2, 0);
        ctx.lineTo(s / 2, 0);
        ctx.stroke();
        break;
      case 3: // Cross
        ctx.beginPath();
        ctx.moveTo(-s / 3, 0);
        ctx.lineTo(s / 3, 0);
        ctx.moveTo(0, -s / 3);
        ctx.lineTo(0, s / 3);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }
}

function renderConfetti(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const points = jitteredGrid(diagonal, density, 137, size * 2);
  const colors = [color1, color2, color3];

  for (const pt of points) {
    const angle = pt.rng1 * Math.PI * 2;
    const w = size * (0.2 + pt.rng2 * 0.3);
    const h = size * (0.6 + pt.rng3 * 0.4);
    ctx.fillStyle = colors[Math.floor(pt.rng1 * colors.length)]!;
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

function renderGeometric(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  _color3: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const points = jitteredGrid(diagonal, density, 256, size * 2);

  for (const pt of points) {
    const angle = pt.rng1 * Math.PI * 2;
    const s = size * (0.4 + pt.rng2 * 0.6);
    const shape = Math.floor(pt.rng3 * 3);

    ctx.strokeStyle = color1;
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);

    switch (shape) {
      case 0: // Square outline
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        break;
      case 1: // Circle outline
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 2: // Triangle outline
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.stroke();
        break;
    }
    ctx.restore();
  }
}

function renderSquiggle(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  _color3: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const points = jitteredGrid(diagonal, density, 311, size * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (const pt of points) {
    const angle = pt.rng1 * Math.PI * 2;
    const len = size * (0.8 + pt.rng2 * 0.5);

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    const segs = 4;
    for (let s = 1; s <= segs; s++) {
      const sx = -len / 2 + (s / segs) * len;
      const sy = (s % 2 === 0 ? -1 : 1) * size * 0.3;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();
  }
}

type MemphisRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const MEMPHIS_RENDERERS: Record<string, MemphisRenderer> = {
  classic: renderClassic,
  confetti: renderConfetti,
  geometric: renderGeometric,
  squiggle: renderSquiggle,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const memphisLayerType: LayerTypeDefinition = {
  typeId: "patterns:memphis",
  displayName: "Memphis Pattern",
  icon: "sparkle",
  category: "draw",
  properties: MEMPHIS_PROPERTIES,
  propertyEditorId: "patterns:memphis-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of MEMPHIS_PROPERTIES) {
      props[schema.key] = schema.default;
    }
    return props;
  },

  render(
    properties: LayerProperties,
    ctx: CanvasRenderingContext2D,
    bounds: LayerBounds,
    _resources: RenderResources,
  ): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;

    const style = (properties.style as string) ?? "classic";
    const size = (properties.size as number) ?? 20;
    const color1 = (properties.color1 as string) ?? "#e74c3c";
    const color2 = (properties.color2 as string) ?? "#f1c40f";
    const color3 = (properties.color3 as string) ?? "#3498db";
    const density = (properties.density as number) ?? 40;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = MEMPHIS_RENDERERS[style] ?? MEMPHIS_RENDERERS.classic!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, density, color1, color2, color3);

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];
    const regionVal = properties.region;
    if (typeof regionVal === "string" && regionVal.trim() !== "") {
      try { JSON.parse(regionVal); } catch {
        errors.push({ property: "region", message: "region must be valid JSON" });
      }
    }
    const style = properties.style as string;
    if (style && !VALID_STYLES.includes(style)) {
      errors.push({ property: "style", message: `style must be one of: ${VALID_STYLES.join(", ")}` });
    }
    return errors.length > 0 ? errors : null;
  },
};
