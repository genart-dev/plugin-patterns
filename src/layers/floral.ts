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

const FLORAL_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "daisy",
    options: [
      { value: "daisy", label: "Daisy" },
      { value: "rosette", label: "Rosette" },
      { value: "cherry-blossom", label: "Cherry Blossom" },
      { value: "sunflower", label: "Sunflower" },
      { value: "abstract-flower", label: "Abstract Flower" },
    ],
    group: "floral",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "floral",
  },
  {
    key: "color1",
    label: "Petal Color",
    type: "color",
    default: "#f1c40f",
    group: "floral",
  },
  {
    key: "color2",
    label: "Background",
    type: "color",
    default: "#ecf0f1",
    group: "floral",
  },
  {
    key: "petalCount",
    label: "Petal Count",
    type: "number",
    default: 8,
    min: 3,
    max: 16,
    step: 1,
    group: "floral",
  },
  {
    key: "gap",
    label: "Spacing",
    type: "number",
    default: 6,
    min: 0,
    max: 40,
    step: 1,
    group: "floral",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "floral",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "floral",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "floral",
  },
];

const VALID_STYLES = ["daisy", "rosette", "cherry-blossom", "sunflower", "abstract-flower"];

// ---------------------------------------------------------------------------
// Flower helpers
// ---------------------------------------------------------------------------

function drawFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  petals: number,
  color1: string,
  centerColor: string,
  centerRadius: number,
): void {
  const petalLen = size * 0.42;
  const petalW = size * 0.15;
  ctx.fillStyle = color1;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    // Petal: ellipse centered at distance from center
    ctx.ellipse(0, -petalLen, petalW, petalLen * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Center disk (contrasting)
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Floral renderers
// ---------------------------------------------------------------------------

function renderDaisy(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      drawFlower(ctx, x, y, size, petals, color1, color2, size * 0.12);
    }
  }
}

function renderRosette(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      // Double layer rosette
      ctx.globalAlpha = 0.5;
      drawFlower(ctx, x, y, size, petals, color1, color2, size * 0.1);
      ctx.globalAlpha = 1;
      drawFlower(ctx, x, y, size * 0.6, petals, color1, color2, size * 0.08);
    }
  }
}

function renderCherryBlossom(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const seed = (row * 127 + col * 311) & 0xffff;
      const angle = (seed / 0xffff) * Math.PI * 0.5;
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // Heart-shaped petals
      const petalLen = size * 0.4;
      ctx.fillStyle = color1;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petalLen * 0.3, -petalLen * 0.5, -petalLen * 0.1, -petalLen, 0, -petalLen * 0.8);
        ctx.bezierCurveTo(petalLen * 0.1, -petalLen, petalLen * 0.3, -petalLen * 0.5, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function renderSunflower(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      // Pointed petals
      ctx.fillStyle = color1;
      const petalLen = size * 0.45;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size * 0.06, -petalLen * 0.5);
        ctx.lineTo(0, -petalLen);
        ctx.lineTo(size * 0.06, -petalLen * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // Dark center
      ctx.fillStyle = color2;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderAbstractFlower(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.strokeStyle = color1;
  ctx.lineWidth = 1.5;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      const r = size * 0.4;
      // Concentric petal arcs
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, r * 0.5, a - 0.5, a + 0.5);
        ctx.stroke();
      }
      // Center dot
      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type FloralRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  petals: number,
) => void;

const FLORAL_RENDERERS: Record<string, FloralRenderer> = {
  daisy: renderDaisy,
  rosette: renderRosette,
  "cherry-blossom": renderCherryBlossom,
  sunflower: renderSunflower,
  "abstract-flower": renderAbstractFlower,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const floralLayerType: LayerTypeDefinition = {
  typeId: "patterns:floral",
  displayName: "Floral Pattern",
  icon: "flower",
  category: "draw",
  properties: FLORAL_PROPERTIES,
  propertyEditorId: "patterns:floral-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of FLORAL_PROPERTIES) {
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

    const style = (properties.style as string) ?? "daisy";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#f1c40f";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const petalCount = (properties.petalCount as number) ?? 8;
    const gap = (properties.gap as number) ?? 6;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = FLORAL_RENDERERS[style] ?? FLORAL_RENDERERS.daisy!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, gap, color1, color2, petalCount);

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
