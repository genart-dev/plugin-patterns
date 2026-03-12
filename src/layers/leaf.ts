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

const LEAF_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "simple-leaf",
    options: [
      { value: "simple-leaf", label: "Simple Leaf" },
      { value: "fern-row", label: "Fern Row" },
      { value: "tropical-scatter", label: "Tropical Scatter" },
      { value: "vine-trail", label: "Vine Trail" },
    ],
    group: "leaf",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 28,
    min: 8,
    max: 200,
    step: 1,
    group: "leaf",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#27ae60",
    group: "leaf",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#eafaf1",
    group: "leaf",
  },
  {
    key: "gap",
    label: "Spacing",
    type: "number",
    default: 8,
    min: 0,
    max: 40,
    step: 1,
    group: "leaf",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "leaf",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "leaf",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "leaf",
  },
];

const VALID_STYLES = ["simple-leaf", "fern-row", "tropical-scatter", "vine-trail"];

// ---------------------------------------------------------------------------
// Leaf helpers
// ---------------------------------------------------------------------------

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const w = size * 0.4;
  const h = size;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w, -h / 4, w, h / 4, 0, h / 2);
  ctx.bezierCurveTo(-w, h / 4, -w, -h / 4, 0, -h / 2);
  ctx.closePath();
  ctx.fill();
  // Midrib
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(0, h / 2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Leaf renderers
// ---------------------------------------------------------------------------

function renderSimpleLeaf(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;
  ctx.lineWidth = 1;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      const angle = ((row + col) % 4) * (Math.PI / 4);
      drawLeaf(ctx, x, y, size, angle);
    }
  }
}

function renderFernRow(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;
  ctx.lineWidth = 0.5;
  const leafSize = size * 0.5;
  const rowH = size + gap;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const leafSpacing = leafSize * 0.8;

  for (let row = 0; row < rows; row++) {
    const y = -diagonal + row * rowH;
    const dir = row % 2 === 0 ? 1 : -1;
    // Stem line
    ctx.strokeStyle = color1;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-diagonal, y);
    ctx.lineTo(diagonal, y);
    ctx.stroke();
    ctx.strokeStyle = color2;
    ctx.lineWidth = 0.5;
    // Leaves along stem
    const leafCount = Math.ceil((diagonal * 2) / leafSpacing) + 2;
    for (let i = 0; i < leafCount; i++) {
      const x = -diagonal + i * leafSpacing;
      ctx.fillStyle = color1;
      drawLeaf(ctx, x, y, leafSize, dir * Math.PI / 4);
    }
  }
}

function renderTropicalScatter(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color2;
  ctx.lineWidth = 0.5;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  // Deterministic scatter using simple hash
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seed = (row * 127 + col * 311) & 0xffff;
      const angle = (seed / 0xffff) * Math.PI * 2;
      const leafScale = 0.7 + (seed % 100) / 200;
      const x = -diagonal + col * unitSize + ((seed % 7) - 3) * 2;
      const y = -diagonal + row * unitSize + ((seed % 11) - 5) * 2;
      ctx.fillStyle = color1;
      drawLeaf(ctx, x, y, size * leafScale, angle);
    }
  }
}

function renderVineTrail(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = 1.5;
  const rowH = size * 2 + gap;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;

  for (let row = 0; row < rows; row++) {
    const baseY = -diagonal + row * rowH;
    // Wavy vine line
    ctx.beginPath();
    for (let x = -diagonal; x < diagonal; x += 2) {
      const y = baseY + Math.sin(x / (size * 0.5)) * (size * 0.4);
      if (x === -diagonal) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Leaves along the vine
    ctx.fillStyle = color1;
    ctx.strokeStyle = color2;
    ctx.lineWidth = 0.5;
    const leafSpacing = size * 0.8 + gap;
    const leafCount = Math.ceil((diagonal * 2) / leafSpacing);
    for (let i = 0; i < leafCount; i++) {
      const x = -diagonal + i * leafSpacing;
      const y = baseY + Math.sin(x / (size * 0.5)) * (size * 0.4);
      const side = i % 2 === 0 ? 1 : -1;
      drawLeaf(ctx, x, y, size * 0.6, side * Math.PI / 3);
    }
    ctx.strokeStyle = color1;
    ctx.lineWidth = 1.5;
  }
}

type LeafRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
) => void;

const LEAF_RENDERERS: Record<string, LeafRenderer> = {
  "simple-leaf": renderSimpleLeaf,
  "fern-row": renderFernRow,
  "tropical-scatter": renderTropicalScatter,
  "vine-trail": renderVineTrail,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const leafLayerType: LayerTypeDefinition = {
  typeId: "patterns:leaf",
  displayName: "Leaf Pattern",
  icon: "leaf",
  category: "draw",
  properties: LEAF_PROPERTIES,
  propertyEditorId: "patterns:leaf-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of LEAF_PROPERTIES) {
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

    const style = (properties.style as string) ?? "simple-leaf";
    const size = (properties.size as number) ?? 28;
    const color1 = (properties.color1 as string) ?? "#27ae60";
    const color2 = (properties.color2 as string) ?? "#eafaf1";
    const gap = (properties.gap as number) ?? 8;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = LEAF_RENDERERS[style] ?? LEAF_RENDERERS["simple-leaf"]!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, gap, color1, color2);

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
