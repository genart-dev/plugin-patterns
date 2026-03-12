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

const SPIRAL_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "archimedean",
    options: [
      { value: "archimedean", label: "Archimedean" },
      { value: "logarithmic", label: "Logarithmic" },
      { value: "scroll", label: "Scroll" },
      { value: "double", label: "Double Spiral" },
    ],
    group: "spiral",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "spiral",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "spiral",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "spiral",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 1.5,
    min: 0.5,
    max: 10,
    step: 0.5,
    group: "spiral",
  },
  {
    key: "gap",
    label: "Spacing",
    type: "number",
    default: 6,
    min: 0,
    max: 40,
    step: 1,
    group: "spiral",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "spiral",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "spiral",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "spiral",
  },
];

const VALID_STYLES = ["archimedean", "logarithmic", "scroll", "double"];

// ---------------------------------------------------------------------------
// Spiral helpers
// ---------------------------------------------------------------------------

function drawArchimedeanSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  maxR: number,
  turns: number,
): void {
  ctx.beginPath();
  const steps = Math.floor(turns * 60);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = (t / (turns * Math.PI * 2)) * maxR;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawLogSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  maxR: number,
  turns: number,
): void {
  ctx.beginPath();
  const steps = Math.floor(turns * 60);
  const a = maxR * 0.05;
  const b = Math.log(maxR / a) / (turns * Math.PI * 2);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = a * Math.exp(b * t);
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Spiral renderers
// ---------------------------------------------------------------------------

function renderArchimedean(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      drawArchimedeanSpiral(ctx, x, y, size * 0.4, 3);
    }
  }
}

function renderLogarithmic(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      drawLogSpiral(ctx, x, y, size * 0.4, 2.5);
    }
  }
}

function renderScroll(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      // S-shaped scroll: two spirals facing opposite directions
      const r = size * 0.35;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 2;
        const sr = (t / (Math.PI * 2)) * r;
        const sx = x - r * 0.3 + Math.cos(t) * sr;
        const sy = y + Math.sin(t) * sr;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 2;
        const sr = (t / (Math.PI * 2)) * r;
        const sx = x + r * 0.3 + Math.cos(t + Math.PI) * sr;
        const sy = y + Math.sin(t + Math.PI) * sr;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }
}

function renderDouble(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      // Two interleaved spirals
      drawArchimedeanSpiral(ctx, x, y, size * 0.4, 2.5);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.translate(-x, -y);
      drawArchimedeanSpiral(ctx, x, y, size * 0.4, 2.5);
      ctx.restore();
    }
  }
}

type SpiralRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
) => void;

const SPIRAL_RENDERERS: Record<string, SpiralRenderer> = {
  archimedean: renderArchimedean,
  logarithmic: renderLogarithmic,
  scroll: renderScroll,
  double: renderDouble,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const spiralLayerType: LayerTypeDefinition = {
  typeId: "patterns:spiral",
  displayName: "Spiral Pattern",
  icon: "spiral",
  category: "draw",
  properties: SPIRAL_PROPERTIES,
  propertyEditorId: "patterns:spiral-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of SPIRAL_PROPERTIES) {
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

    const style = (properties.style as string) ?? "archimedean";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 1.5;
    const gap = (properties.gap as number) ?? 6;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = SPIRAL_RENDERERS[style] ?? SPIRAL_RENDERERS.archimedean!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, gap, lineWidth, color1, color2);

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
