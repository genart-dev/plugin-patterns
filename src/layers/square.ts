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

const SQUARE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "nested",
    options: [
      { value: "nested", label: "Nested Squares" },
      { value: "rotated", label: "Rotated Squares" },
      { value: "offset", label: "Offset Squares" },
      { value: "stars-and-squares", label: "Stars & Squares" },
      { value: "circles-and-squares", label: "Circles & Squares" },
    ],
    group: "square",
  },
  { key: "size", label: "Size", type: "number", default: 30, min: 8, max: 200, step: 1, group: "square" },
  { key: "color1", label: "Color 1", type: "color", default: "#2c3e50", group: "square" },
  { key: "color2", label: "Color 2", type: "color", default: "#ecf0f1", group: "square" },
  { key: "color3", label: "Color 3", type: "color", default: "#f39c12", group: "square" },
  { key: "gap", label: "Gap", type: "number", default: 2, min: 0, max: 20, step: 0.5, group: "square" },
  { key: "rotation", label: "Rotation", type: "number", default: 0, min: 0, max: 360, step: 1, group: "square" },
  { key: "region", label: "Region (JSON)", type: "string", default: '{"type":"bounds"}', group: "square" },
  { key: "opacity", label: "Opacity", type: "number", default: 1, min: 0, max: 1, step: 0.01, group: "square" },
];

const VALID_STYLES = ["nested", "rotated", "offset", "stars-and-squares", "circles-and-squares"];

function renderNested(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      ctx.strokeStyle = color1;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, size, size);
      ctx.strokeRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);
      ctx.strokeRect(x + size * 0.35, y + size * 0.35, size * 0.3, size * 0.3);
    }
  }
}

function renderRotated(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + size / 2;
      const cy = -diagonal + row * unit + size / 2;
      ctx.fillStyle = color1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-size * 0.35, -size * 0.35, size * 0.7, size * 0.7);
      ctx.restore();
    }
  }
}

function renderOffset(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unit / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit + xOff;
      const y = -diagonal + row * unit;
      ctx.fillStyle = color1;
      ctx.fillRect(x, y, size, size);
    }
  }
}

function renderStarsAndSquares(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, color1: string, color2: string, color3: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const hs = size / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + hs;
      const cy = -diagonal + row * unit + hs;
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = color1;
        ctx.fillRect(cx - hs * 0.6, cy - hs * 0.6, hs * 1.2, hs * 1.2);
      } else {
        // 4-pointed star
        ctx.fillStyle = color3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? hs * 0.6 : hs * 0.25;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function renderCirclesAndSquares(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + size / 2;
      const cy = -diagonal + row * unit + size / 2;
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = color1;
        ctx.fillRect(cx - size * 0.35, cy - size * 0.35, size * 0.7, size * 0.7);
      } else {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

type SquareRenderer = (ctx: CanvasRenderingContext2D, d: number, s: number, g: number, c1: string, c2: string, c3: string) => void;

const SQUARE_RENDERERS: Record<string, SquareRenderer> = {
  nested: renderNested as SquareRenderer,
  rotated: renderRotated as SquareRenderer,
  offset: renderOffset as SquareRenderer,
  "stars-and-squares": renderStarsAndSquares,
  "circles-and-squares": renderCirclesAndSquares as SquareRenderer,
};

export const squareLayerType: LayerTypeDefinition = {
  typeId: "patterns:square",
  displayName: "Square Pattern",
  icon: "square",
  category: "draw",
  properties: SQUARE_PROPERTIES,
  propertyEditorId: "patterns:square-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of SQUARE_PROPERTIES) props[schema.key] = schema.default;
    return props;
  },

  render(properties: LayerProperties, ctx: CanvasRenderingContext2D, bounds: LayerBounds, _resources: RenderResources): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;
    const style = (properties.style as string) ?? "nested";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const color3 = (properties.color3 as string) ?? "#f39c12";
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;
    let region: PatternRegion = { type: "bounds" };
    try { region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion; } catch { /* use bounds */ }
    const renderer = SQUARE_RENDERERS[style] ?? (SQUARE_RENDERERS.nested as SquareRenderer);
    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);
    renderer(ctx, diag, size, gap, color1, color2, color3);
    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];
    const regionVal = properties.region;
    if (typeof regionVal === "string" && regionVal.trim() !== "") {
      try { JSON.parse(regionVal); } catch { errors.push({ property: "region", message: "region must be valid JSON" }); }
    }
    const style = properties.style as string;
    if (style && !VALID_STYLES.includes(style)) {
      errors.push({ property: "style", message: `style must be one of: ${VALID_STYLES.join(", ")}` });
    }
    return errors.length > 0 ? errors : null;
  },
};
