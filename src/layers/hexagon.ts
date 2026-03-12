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

const HEXAGON_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "honeycomb",
    options: [
      { value: "honeycomb", label: "Honeycomb" },
      { value: "interlocked", label: "Interlocked" },
      { value: "flower", label: "Hex Flower" },
      { value: "grid", label: "Hex Grid" },
      { value: "overlapping", label: "Overlapping" },
    ],
    group: "hexagon",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 24,
    min: 8,
    max: 200,
    step: 1,
    group: "hexagon",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#f39c12",
    group: "hexagon",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#fef9e7",
    group: "hexagon",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 2,
    min: 0,
    max: 20,
    step: 0.5,
    group: "hexagon",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "hexagon",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "hexagon",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "hexagon",
  },
];

const VALID_STYLES = ["honeycomb", "interlocked", "flower", "grid", "overlapping"];

// ---------------------------------------------------------------------------
// Hex helpers
// ---------------------------------------------------------------------------

function drawHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, flat: boolean): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + (flat ? 0 : -Math.PI / 6);
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Hexagon renderers
// ---------------------------------------------------------------------------

function renderHoneycomb(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW + gap;
  const unitH = r * 1.5 + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      drawHex(ctx, cx, cy, r - gap / 2, false);
      ctx.fill();
    }
  }
}

function renderInterlocked(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW + gap;
  const unitH = r * 1.5 + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      ctx.fillStyle = (row + col) % 2 === 0 ? color1 : color2;
      drawHex(ctx, cx, cy, r - gap / 2, false);
      ctx.fill();
      // Outline for interlocked effect
      ctx.strokeStyle = color1;
      ctx.lineWidth = Math.max(0.5, gap * 0.5);
      ctx.stroke();
    }
  }
}

function renderFlower(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW * 2 + gap * 2;
  const unitH = r * 3 + gap * 2;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      // Center hex
      drawHex(ctx, cx, cy, r - gap / 2, false);
      ctx.fill();
      // 6 surrounding petals (smaller hexes)
      const petalR = r * 0.6;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + (r + petalR * 0.5) * Math.cos(a);
        const py = cy + (r + petalR * 0.5) * Math.sin(a);
        drawHex(ctx, px, py, petalR, false);
        ctx.fill();
      }
    }
  }
}

function renderGrid(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW + gap;
  const unitH = r * 1.5 + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  // Outline-only hex grid
  ctx.strokeStyle = color1;
  ctx.lineWidth = Math.max(1, gap);
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      drawHex(ctx, cx, cy, r - gap / 2, false);
      ctx.stroke();
    }
  }
}

function renderOverlapping(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  _gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW * 0.75;
  const unitH = r * 1.2;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.globalAlpha *= 0.6;
  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      drawHex(ctx, cx, cy, r, false);
      ctx.fill();
    }
  }
  ctx.globalAlpha /= 0.6;
}

type HexRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
) => void;

const HEXAGON_RENDERERS: Record<string, HexRenderer> = {
  honeycomb: renderHoneycomb,
  interlocked: renderInterlocked,
  flower: renderFlower,
  grid: renderGrid,
  overlapping: renderOverlapping,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const hexagonLayerType: LayerTypeDefinition = {
  typeId: "patterns:hexagon",
  displayName: "Hexagon Pattern",
  icon: "hexagon",
  category: "draw",
  properties: HEXAGON_PROPERTIES,
  propertyEditorId: "patterns:hexagon-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of HEXAGON_PROPERTIES) {
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

    const style = (properties.style as string) ?? "honeycomb";
    const size = (properties.size as number) ?? 24;
    const color1 = (properties.color1 as string) ?? "#f39c12";
    const color2 = (properties.color2 as string) ?? "#fef9e7";
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = HEXAGON_RENDERERS[style] ?? HEXAGON_RENDERERS.honeycomb!;

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
