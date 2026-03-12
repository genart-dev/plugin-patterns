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

const SCALE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style", label: "Style", type: "select", default: "fishscale",
    options: [
      { value: "fishscale", label: "Fish Scale" },
      { value: "scallop", label: "Scallop" },
      { value: "overlapping", label: "Overlapping" },
      { value: "pointed", label: "Pointed" },
    ],
    group: "scale",
  },
  { key: "size", label: "Size", type: "number", default: 24, min: 8, max: 200, step: 1, group: "scale" },
  { key: "color1", label: "Color 1", type: "color", default: "#2c3e50", group: "scale" },
  { key: "color2", label: "Color 2", type: "color", default: "#ecf0f1", group: "scale" },
  { key: "lineWidth", label: "Line Width", type: "number", default: 1, min: 0.5, max: 10, step: 0.5, group: "scale" },
  { key: "rotation", label: "Rotation", type: "number", default: 0, min: 0, max: 360, step: 1, group: "scale" },
  { key: "region", label: "Region (JSON)", type: "string", default: '{"type":"bounds"}', group: "scale" },
  { key: "opacity", label: "Opacity", type: "number", default: 1, min: 0, max: 1, step: 0.01, group: "scale" },
];

const VALID_STYLES = ["fishscale", "scallop", "overlapping", "pointed"];

function renderFishscale(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const r = size / 2;
  const rowH = r;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const cols = Math.ceil((2 * diagonal) / size) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : r;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * size + xOff;
      const cy = -diagonal + row * rowH;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.stroke();
    }
  }
}

function renderScallop(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.fillStyle = color1;
  ctx.globalAlpha *= 0.15;
  const r = size / 2;
  const rowH = r * 0.8;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const cols = Math.ceil((2 * diagonal) / size) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : r;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * size + xOff;
      const cy = -diagonal + row * rowH;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.fill();
    }
  }
  ctx.globalAlpha /= 0.15;
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : r;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * size + xOff;
      const cy = -diagonal + row * rowH;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.stroke();
    }
  }
}

function renderOverlapping(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const r = size * 0.6;
  const rowH = size * 0.4;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const cols = Math.ceil((2 * diagonal) / size) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : size / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * size + xOff;
      const cy = -diagonal + row * rowH;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.stroke();
    }
  }
}

function renderPointed(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const hs = size / 2;
  const rowH = size * 0.6;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const cols = Math.ceil((2 * diagonal) / size) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : hs;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * size + xOff;
      const cy = -diagonal + row * rowH;
      ctx.beginPath();
      ctx.moveTo(cx - hs, cy);
      ctx.quadraticCurveTo(cx, cy + size * 0.6, cx + hs, cy);
      ctx.stroke();
    }
  }
}

type ScaleRenderer = (ctx: CanvasRenderingContext2D, d: number, s: number, lw: number, c1: string, c2: string) => void;

const SCALE_RENDERERS: Record<string, ScaleRenderer> = {
  fishscale: renderFishscale,
  scallop: renderScallop,
  overlapping: renderOverlapping,
  pointed: renderPointed,
};

export const scaleLayerType: LayerTypeDefinition = {
  typeId: "patterns:scale",
  displayName: "Scale Pattern",
  icon: "layers",
  category: "draw",
  properties: SCALE_PROPERTIES,
  propertyEditorId: "patterns:scale-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of SCALE_PROPERTIES) props[schema.key] = schema.default;
    return props;
  },

  render(properties: LayerProperties, ctx: CanvasRenderingContext2D, bounds: LayerBounds, _resources: RenderResources): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;
    const style = (properties.style as string) ?? "fishscale";
    const size = (properties.size as number) ?? 24;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 1;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;
    let region: PatternRegion = { type: "bounds" };
    try { region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion; } catch { /* use bounds */ }
    const renderer = SCALE_RENDERERS[style] ?? SCALE_RENDERERS.fishscale!;
    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);
    renderer(ctx, diag, size, lineWidth, color1, color2);
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
