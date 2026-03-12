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

const STAR_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "six-pointed",
    options: [
      { value: "six-pointed", label: "Six-Pointed Star" },
      { value: "eight-pointed", label: "Eight-Pointed Star" },
      { value: "plus-grid", label: "Plus Grid" },
      { value: "plus-offset", label: "Plus Offset" },
      { value: "lattice", label: "Star Lattice" },
    ],
    group: "star",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 28,
    min: 8,
    max: 200,
    step: 1,
    group: "star",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "star",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "star",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 2,
    min: 0,
    max: 20,
    step: 0.5,
    group: "star",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "star",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "star",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "star",
  },
];

const VALID_STYLES = ["six-pointed", "eight-pointed", "plus-grid", "plus-offset", "lattice"];

// ---------------------------------------------------------------------------
// Star renderers
// ---------------------------------------------------------------------------

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawPlus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  armWidth: number,
): void {
  const hw = armWidth / 2;
  const hs = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - hs);
  ctx.lineTo(cx + hw, cy - hs);
  ctx.lineTo(cx + hw, cy - hw);
  ctx.lineTo(cx + hs, cy - hw);
  ctx.lineTo(cx + hs, cy + hw);
  ctx.lineTo(cx + hw, cy + hw);
  ctx.lineTo(cx + hw, cy + hs);
  ctx.lineTo(cx - hw, cy + hs);
  ctx.lineTo(cx - hw, cy + hw);
  ctx.lineTo(cx - hs, cy + hw);
  ctx.lineTo(cx - hs, cy - hw);
  ctx.lineTo(cx - hw, cy - hw);
  ctx.closePath();
}

function renderSixPointed(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.866)) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const r = (size - gap) / 2;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + offset;
      const y = -diagonal + row * unitSize * 0.866;
      drawStar(ctx, x, y, r, r * 0.5, 6);
      ctx.fill();
    }
  }
}

function renderEightPointed(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const r = (size - gap) / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      drawStar(ctx, x, y, r, r * 0.38, 8);
      ctx.fill();
    }
  }
}

function renderPlusGrid(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const armW = size * 0.35;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      drawPlus(ctx, x, y, size - gap, armW);
      ctx.fill();
    }
  }
}

function renderPlusOffset(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const armW = size * 0.35;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + offset;
      const y = -diagonal + row * unitSize;
      drawPlus(ctx, x, y, size - gap, armW);
      ctx.fill();
    }
  }
}

function renderLattice(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.866)) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  // Star outlines forming a lattice
  ctx.strokeStyle = color1;
  ctx.lineWidth = Math.max(1, gap * 0.5);
  const r = (size - gap) / 2;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + offset;
      const y = -diagonal + row * unitSize * 0.866;
      // Fill star
      ctx.fillStyle = color1;
      drawStar(ctx, x, y, r, r * 0.45, 6);
      ctx.fill();
      // Connecting lines to neighbors
      ctx.strokeStyle = color1;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + unitSize - r, y);
      ctx.stroke();
    }
  }
}

type StarRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
) => void;

const STAR_RENDERERS: Record<string, StarRenderer> = {
  "six-pointed": renderSixPointed,
  "eight-pointed": renderEightPointed,
  "plus-grid": renderPlusGrid,
  "plus-offset": renderPlusOffset,
  lattice: renderLattice,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const starLayerType: LayerTypeDefinition = {
  typeId: "patterns:star",
  displayName: "Star Pattern",
  icon: "star",
  category: "draw",
  properties: STAR_PROPERTIES,
  propertyEditorId: "patterns:star-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of STAR_PROPERTIES) {
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

    const style = (properties.style as string) ?? "six-pointed";
    const size = (properties.size as number) ?? 28;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = STAR_RENDERERS[style] ?? STAR_RENDERERS["six-pointed"]!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diagonal, size, gap, color1, color2);

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    const regionVal = properties.region;
    if (typeof regionVal === "string" && regionVal.trim() !== "") {
      try {
        JSON.parse(regionVal);
      } catch {
        errors.push({ property: "region", message: "region must be valid JSON" });
      }
    }

    const style = properties.style as string;
    if (style && !VALID_STYLES.includes(style)) {
      errors.push({
        property: "style",
        message: `style must be one of: ${VALID_STYLES.join(", ")}`,
      });
    }

    return errors.length > 0 ? errors : null;
  },
};
