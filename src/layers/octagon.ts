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

const OCTAGON_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style", label: "Style", type: "select", default: "octagon-square",
    options: [
      { value: "octagon-square", label: "Octagon & Square" },
      { value: "outline", label: "Outline" },
    ],
    group: "octagon",
  },
  { key: "size", label: "Size", type: "number", default: 30, min: 8, max: 200, step: 1, group: "octagon" },
  { key: "color1", label: "Octagon Color", type: "color", default: "#2c3e50", group: "octagon" },
  { key: "color2", label: "Square Color", type: "color", default: "#bdc3c7", group: "octagon" },
  { key: "gap", label: "Gap", type: "number", default: 2, min: 0, max: 20, step: 0.5, group: "octagon" },
  { key: "lineWidth", label: "Line Width", type: "number", default: 1.5, min: 0.5, max: 10, step: 0.5, group: "octagon" },
  { key: "rotation", label: "Rotation", type: "number", default: 0, min: 0, max: 360, step: 1, group: "octagon" },
  { key: "region", label: "Region (JSON)", type: "string", default: '{"type":"bounds"}', group: "octagon" },
  { key: "opacity", label: "Opacity", type: "number", default: 1, min: 0, max: 1, step: 0.01, group: "octagon" },
];

const VALID_STYLES = ["octagon-square", "outline"];

function drawOctagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function renderOctagonSquare(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, _lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const r = (size / 2) * 0.9;
  const sqSize = size * 0.38;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + size / 2;
      const cy = -diagonal + row * unit + size / 2;
      ctx.fillStyle = color1;
      drawOctagon(ctx, cx, cy, r);
      ctx.fill();
      // Small square in the gap
      ctx.fillStyle = color2;
      ctx.fillRect(cx + r * 0.7 - sqSize / 4, cy + r * 0.7 - sqSize / 4, sqSize / 2, sqSize / 2);
    }
  }
}

function renderOutline(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const unit = size + gap;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const r = (size / 2) * 0.9;
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + size / 2;
      const cy = -diagonal + row * unit + size / 2;
      drawOctagon(ctx, cx, cy, r);
      ctx.stroke();
    }
  }
}

type OctRenderer = (ctx: CanvasRenderingContext2D, d: number, s: number, g: number, lw: number, c1: string, c2: string) => void;

const OCTAGON_RENDERERS: Record<string, OctRenderer> = {
  "octagon-square": renderOctagonSquare,
  outline: renderOutline,
};

export const octagonLayerType: LayerTypeDefinition = {
  typeId: "patterns:octagon",
  displayName: "Octagon Pattern",
  icon: "octagon",
  category: "draw",
  properties: OCTAGON_PROPERTIES,
  propertyEditorId: "patterns:octagon-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of OCTAGON_PROPERTIES) props[schema.key] = schema.default;
    return props;
  },

  render(properties: LayerProperties, ctx: CanvasRenderingContext2D, bounds: LayerBounds, _resources: RenderResources): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;
    const style = (properties.style as string) ?? "octagon-square";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#bdc3c7";
    const gap = (properties.gap as number) ?? 2;
    const lineWidth = (properties.lineWidth as number) ?? 1.5;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;
    let region: PatternRegion = { type: "bounds" };
    try { region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion; } catch { /* use bounds */ }
    const renderer = OCTAGON_RENDERERS[style] ?? OCTAGON_RENDERERS["octagon-square"]!;
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
      try { JSON.parse(regionVal); } catch { errors.push({ property: "region", message: "region must be valid JSON" }); }
    }
    const style = properties.style as string;
    if (style && !VALID_STYLES.includes(style)) {
      errors.push({ property: "style", message: `style must be one of: ${VALID_STYLES.join(", ")}` });
    }
    return errors.length > 0 ? errors : null;
  },
};
