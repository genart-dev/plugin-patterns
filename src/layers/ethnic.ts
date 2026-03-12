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

const ETHNIC_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style", label: "Style", type: "select", default: "tribal-zigzag",
    options: [
      { value: "tribal-zigzag", label: "Tribal Zigzag" },
      { value: "african-kente", label: "African Kente" },
      { value: "egyptian-lotus", label: "Egyptian Lotus" },
      { value: "mexican-step", label: "Mexican Step" },
      { value: "songket-diamond", label: "Songket Diamond" },
      { value: "tribal-arrow", label: "Tribal Arrow" },
    ],
    group: "ethnic",
  },
  { key: "size", label: "Size", type: "number", default: 24, min: 8, max: 200, step: 1, group: "ethnic" },
  { key: "color1", label: "Color 1", type: "color", default: "#784212", group: "ethnic" },
  { key: "color2", label: "Color 2", type: "color", default: "#fef9e7", group: "ethnic" },
  { key: "lineWidth", label: "Line Width", type: "number", default: 2, min: 0.5, max: 10, step: 0.5, group: "ethnic" },
  { key: "rotation", label: "Rotation", type: "number", default: 0, min: 0, max: 360, step: 1, group: "ethnic" },
  { key: "region", label: "Region (JSON)", type: "string", default: '{"type":"bounds"}', group: "ethnic" },
  { key: "opacity", label: "Opacity", type: "number", default: 1, min: 0, max: 1, step: 0.01, group: "ethnic" },
];

const VALID_STYLES = ["tribal-zigzag", "african-kente", "egyptian-lotus", "mexican-step", "songket-diamond", "tribal-arrow"];

function renderTribalZigzag(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const rowH = size;
  const rows = Math.ceil((2 * diagonal) / rowH) + 4;
  const segW = size * 0.5;
  for (let row = 0; row < rows; row++) {
    const y = -diagonal + row * rowH;
    ctx.beginPath();
    for (let x = -diagonal; x < diagonal; x += segW * 2) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + segW, y - size * 0.4);
      ctx.lineTo(x + segW * 2, y);
    }
    ctx.stroke();
    // Mirror zigzag
    ctx.beginPath();
    for (let x = -diagonal; x < diagonal; x += segW * 2) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + segW, y + size * 0.4);
      ctx.lineTo(x + segW * 2, y);
    }
    ctx.stroke();
  }
}

function renderAfricanKente(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  const bandW = size;
  const cols = Math.ceil((2 * diagonal) / bandW) + 4;
  // Vertical bands with alternating fills
  for (let col = 0; col < cols; col++) {
    const x = -diagonal + col * bandW;
    ctx.fillStyle = col % 2 === 0 ? color1 : color2;
    ctx.fillRect(x, -diagonal, bandW * 0.4, diagonal * 2);
    // Horizontal dashes within bands
    ctx.strokeStyle = col % 2 === 0 ? color2 : color1;
    ctx.lineWidth = lw;
    const dashCount = Math.ceil((2 * diagonal) / (size * 0.6));
    for (let d = 0; d < dashCount; d++) {
      const dy = -diagonal + d * size * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, dy);
      ctx.lineTo(x + bandW * 0.4, dy);
      ctx.stroke();
    }
  }
}

function renderEgyptianLotus(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + unit / 2;
      const cy = -diagonal + row * unit + unit / 2;
      const hs = size * 0.4;
      // Lotus: symmetric petals
      ctx.beginPath();
      ctx.moveTo(cx, cy - hs);
      ctx.quadraticCurveTo(cx + hs * 0.8, cy - hs * 0.3, cx + hs * 0.5, cy + hs * 0.3);
      ctx.quadraticCurveTo(cx, cy + hs * 0.6, cx - hs * 0.5, cy + hs * 0.3);
      ctx.quadraticCurveTo(cx - hs * 0.8, cy - hs * 0.3, cx, cy - hs);
      ctx.stroke();
    }
  }
}

function renderMexicanStep(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const step = size / 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      // Stepped pyramid shape
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x, y + size - step);
      ctx.lineTo(x + step, y + size - step);
      ctx.lineTo(x + step, y + size - step * 2);
      ctx.lineTo(x + step * 2, y + size - step * 2);
      ctx.lineTo(x + step * 2, y + size - step * 3);
      ctx.lineTo(x + step * 3, y + size - step * 3);
      ctx.lineTo(x + step * 3, y + size - step * 2);
      ctx.lineTo(x + size, y + size - step * 2);
      ctx.lineTo(x + size, y + size);
      ctx.stroke();
    }
  }
}

function renderSongketDiamond(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unit / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + xOff + unit / 2;
      const cy = -diagonal + row * unit + unit / 2;
      const hs = size * 0.4;
      // Diamond with inner cross
      ctx.beginPath();
      ctx.moveTo(cx, cy - hs);
      ctx.lineTo(cx + hs, cy);
      ctx.lineTo(cx, cy + hs);
      ctx.lineTo(cx - hs, cy);
      ctx.closePath();
      ctx.stroke();
      // Inner smaller diamond
      const is = hs * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - is);
      ctx.lineTo(cx + is, cy);
      ctx.lineTo(cx, cy + is);
      ctx.lineTo(cx - is, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function renderTribalArrow(ctx: CanvasRenderingContext2D, diagonal: number, size: number, lw: number, color1: string, color2: string): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / (unit * 0.8)) + 4;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unit / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unit + xOff;
      const cy = -diagonal + row * unit * 0.8;
      const hs = size * 0.35;
      // Arrow pointing up
      ctx.beginPath();
      ctx.moveTo(cx, cy - hs);
      ctx.lineTo(cx + hs * 0.6, cy);
      ctx.lineTo(cx + hs * 0.2, cy);
      ctx.lineTo(cx + hs * 0.2, cy + hs);
      ctx.lineTo(cx - hs * 0.2, cy + hs);
      ctx.lineTo(cx - hs * 0.2, cy);
      ctx.lineTo(cx - hs * 0.6, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

type EthnicRenderer = (ctx: CanvasRenderingContext2D, d: number, s: number, lw: number, c1: string, c2: string) => void;

const ETHNIC_RENDERERS: Record<string, EthnicRenderer> = {
  "tribal-zigzag": renderTribalZigzag,
  "african-kente": renderAfricanKente,
  "egyptian-lotus": renderEgyptianLotus,
  "mexican-step": renderMexicanStep,
  "songket-diamond": renderSongketDiamond,
  "tribal-arrow": renderTribalArrow,
};

export const ethnicLayerType: LayerTypeDefinition = {
  typeId: "patterns:ethnic",
  displayName: "Ethnic Pattern",
  icon: "globe",
  category: "draw",
  properties: ETHNIC_PROPERTIES,
  propertyEditorId: "patterns:ethnic-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of ETHNIC_PROPERTIES) props[schema.key] = schema.default;
    return props;
  },

  render(properties: LayerProperties, ctx: CanvasRenderingContext2D, bounds: LayerBounds, _resources: RenderResources): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;
    const style = (properties.style as string) ?? "tribal-zigzag";
    const size = (properties.size as number) ?? 24;
    const color1 = (properties.color1 as string) ?? "#784212";
    const color2 = (properties.color2 as string) ?? "#fef9e7";
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;
    let region: PatternRegion = { type: "bounds" };
    try { region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion; } catch { /* use bounds */ }
    const renderer = ETHNIC_RENDERERS[style] ?? ETHNIC_RENDERERS["tribal-zigzag"]!;
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
