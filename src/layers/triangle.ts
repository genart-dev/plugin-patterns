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

const TRIANGLE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "equilateral",
    options: [
      { value: "equilateral", label: "Equilateral Grid" },
      { value: "pinwheel", label: "Pinwheel" },
      { value: "arrow", label: "Arrow Tessellation" },
      { value: "kaleidoscope", label: "Kaleidoscope" },
      { value: "inverted", label: "Inverted Triangles" },
      { value: "strip", label: "Triangle Strip" },
    ],
    group: "triangle",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "triangle",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "triangle",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "triangle",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 1,
    min: 0,
    max: 20,
    step: 0.5,
    group: "triangle",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "triangle",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "triangle",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "triangle",
  },
];

const VALID_STYLES = ["equilateral", "pinwheel", "arrow", "kaleidoscope", "inverted", "strip"];

// ---------------------------------------------------------------------------
// Triangle renderers
// ---------------------------------------------------------------------------

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  pointUp: boolean,
): void {
  const h = size * (Math.sqrt(3) / 2);
  const dir = pointUp ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy + dir * h * (2 / 3));
  ctx.lineTo(cx - size / 2, cy - dir * h * (1 / 3));
  ctx.lineTo(cx + size / 2, cy - dir * h * (1 / 3));
  ctx.closePath();
}

function renderEquilateral(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const h = size * (Math.sqrt(3) / 2);
  const unitW = size + gap;
  const unitH = h + gap;
  const cols = Math.ceil((2 * diagonal) / (unitW / 2)) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * (unitW / 2);
      const y = -diagonal + row * unitH + unitH / 2;
      const pointUp = (row + col) % 2 === 0;
      ctx.fillStyle = pointUp ? color1 : color2;
      drawTriangle(ctx, x, y, size - gap, pointUp);
      ctx.fill();
    }
  }
}

function renderPinwheel(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const cx = -diagonal + col * unitSize;
      const cy = -diagonal + row * unitSize;
      const s = size - gap;
      const hs = s / 2;

      // 4 right triangles forming a pinwheel
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((Math.PI / 2) * i);
        ctx.fillStyle = i % 2 === 0 ? color1 : color2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(hs, 0);
        ctx.lineTo(0, -hs);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

function renderArrow(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const h = size * (Math.sqrt(3) / 2);
  const unitW = size + gap;
  const unitH = h + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW;
      const y = -diagonal + row * unitH;
      const s = size - gap;
      // Arrow shape: two triangles forming a chevron/arrow
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s / 2, y + h * 0.6);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x + s / 2, y + h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderKaleidoscope(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const cx = -diagonal + col * unitSize;
      const cy = -diagonal + row * unitSize;
      const s = size - gap;

      // 6 triangles radiating from center
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((Math.PI / 3) * i);
        ctx.fillStyle = i % 2 === 0 ? color1 : color2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s / 2, -s * 0.43);
        ctx.lineTo(-s / 2, -s * 0.43);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

function renderInverted(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const h = size * (Math.sqrt(3) / 2);
  const unitW = size + gap;
  const unitH = h + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + xOff;
      const y = -diagonal + row * unitH;
      // Inverted (point-down) triangle
      drawTriangle(ctx, x, y + h / 2, size - gap, false);
      ctx.fill();
    }
  }
}

function renderStrip(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const h = size * (Math.sqrt(3) / 2);
  const unitW = size + gap;
  const unitH = h + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW;
      const y = -diagonal + row * unitH;
      // Alternating up/down triangles in a strip
      ctx.fillStyle = col % 2 === 0 ? color1 : color2;
      drawTriangle(ctx, x, y + h / 2, size - gap, col % 2 === 0);
      ctx.fill();
    }
  }
}

type TriangleRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
) => void;

const TRIANGLE_RENDERERS: Record<string, TriangleRenderer> = {
  equilateral: renderEquilateral,
  pinwheel: renderPinwheel,
  arrow: renderArrow,
  kaleidoscope: renderKaleidoscope,
  inverted: renderInverted,
  strip: renderStrip,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const triangleLayerType: LayerTypeDefinition = {
  typeId: "patterns:triangle",
  displayName: "Triangle Pattern",
  icon: "triangle",
  category: "draw",
  properties: TRIANGLE_PROPERTIES,
  propertyEditorId: "patterns:triangle-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of TRIANGLE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "equilateral";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const gap = (properties.gap as number) ?? 1;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = TRIANGLE_RENDERERS[style] ?? TRIANGLE_RENDERERS.equilateral!;

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
