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

const CHAINLINK_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style", label: "Style", type: "select", default: "circle",
    options: [
      { value: "circle", label: "Circle Links" },
      { value: "oval", label: "Oval Links" },
      { value: "double", label: "Double Links" },
    ],
    group: "chainlink",
  },
  { key: "size", label: "Size", type: "number", default: 24, min: 8, max: 200, step: 1, group: "chainlink" },
  { key: "color1", label: "Color 1", type: "color", default: "#7f8c8d", group: "chainlink" },
  { key: "color2", label: "Background", type: "color", default: "#ecf0f1", group: "chainlink" },
  { key: "lineWidth", label: "Line Width", type: "number", default: 2, min: 0.5, max: 10, step: 0.5, group: "chainlink" },
  { key: "gap", label: "Gap", type: "number", default: 4, min: 0, max: 40, step: 1, group: "chainlink" },
  { key: "rotation", label: "Rotation", type: "number", default: 0, min: 0, max: 360, step: 1, group: "chainlink" },
  { key: "region", label: "Region (JSON)", type: "string", default: '{"type":"bounds"}', group: "chainlink" },
  { key: "opacity", label: "Opacity", type: "number", default: 1, min: 0, max: 1, step: 0.01, group: "chainlink" },
];

const VALID_STYLES = ["circle", "oval", "double"];

function renderCircle(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const r = size / 2;
  const unitX = size * 0.7 + gap;
  const unitY = size * 0.7 + gap;
  const cols = Math.ceil((2 * diagonal) / unitX) + 4;
  const rows = Math.ceil((2 * diagonal) / unitY) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitX / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitX + xOff;
      const cy = -diagonal + row * unitY;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderOval(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const rx = size * 0.5;
  const ry = size * 0.3;
  const unitX = size * 0.7 + gap;
  const unitY = size * 0.5 + gap;
  const cols = Math.ceil((2 * diagonal) / unitX) + 4;
  const rows = Math.ceil((2 * diagonal) / unitY) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitX / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitX + xOff;
      const cy = -diagonal + row * unitY;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderDouble(ctx: CanvasRenderingContext2D, diagonal: number, size: number, gap: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const r = size * 0.4;
  const unitX = size + gap;
  const unitY = size * 0.8 + gap;
  const cols = Math.ceil((2 * diagonal) / unitX) + 4;
  const rows = Math.ceil((2 * diagonal) / unitY) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitX / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitX + xOff;
      const cy = -diagonal + row * unitY;
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

type ChainRenderer = (ctx: CanvasRenderingContext2D, d: number, s: number, g: number, lw: number, c1: string, c2: string) => void;

const CHAIN_RENDERERS: Record<string, ChainRenderer> = {
  circle: renderCircle,
  oval: renderOval,
  double: renderDouble,
};

export const chainlinkLayerType: LayerTypeDefinition = {
  typeId: "patterns:chainlink",
  displayName: "Chainlink Pattern",
  icon: "link",
  category: "draw",
  properties: CHAINLINK_PROPERTIES,
  propertyEditorId: "patterns:chainlink-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CHAINLINK_PROPERTIES) props[schema.key] = schema.default;
    return props;
  },

  render(properties: LayerProperties, ctx: CanvasRenderingContext2D, bounds: LayerBounds, _resources: RenderResources): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;
    const style = (properties.style as string) ?? "circle";
    const size = (properties.size as number) ?? 24;
    const color1 = (properties.color1 as string) ?? "#7f8c8d";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const gap = (properties.gap as number) ?? 4;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;
    let region: PatternRegion = { type: "bounds" };
    try { region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion; } catch { /* use bounds */ }
    const renderer = CHAIN_RENDERERS[style] ?? CHAIN_RENDERERS.circle!;
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
