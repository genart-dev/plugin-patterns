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

const EYE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "vesica",
    options: [
      { value: "vesica", label: "Vesica Piscis" },
      { value: "pointed", label: "Pointed Eye" },
      { value: "almond", label: "Almond" },
      { value: "double", label: "Double Eye" },
    ],
    group: "eye",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "eye",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "eye",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "eye",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 1.5,
    min: 0.5,
    max: 10,
    step: 0.5,
    group: "eye",
  },
  {
    key: "gap",
    label: "Spacing",
    type: "number",
    default: 2,
    min: 0,
    max: 40,
    step: 1,
    group: "eye",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "eye",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "eye",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "eye",
  },
];

const VALID_STYLES = ["vesica", "pointed", "almond", "double"];

// ---------------------------------------------------------------------------
// Eye helpers
// ---------------------------------------------------------------------------

function drawVesica(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const r = size * 0.5;
  const offset = r * 0.5;
  // Two overlapping circles form vesica piscis
  ctx.beginPath();
  ctx.arc(cx - offset, cy, r, -Math.PI / 3, Math.PI / 3);
  ctx.arc(cx + offset, cy, r, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3);
  ctx.closePath();
}

function drawPointedEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const hw = size * 0.5;
  const hh = size * 0.25;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.quadraticCurveTo(cx, cy - hh * 2, cx + hw, cy);
  ctx.quadraticCurveTo(cx, cy + hh * 2, cx - hw, cy);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Eye renderers
// ---------------------------------------------------------------------------

function renderVesica(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.7)) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize * 0.7;
      drawVesica(ctx, x, y, size);
      ctx.stroke();
    }
  }
}

function renderPointed(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.6)) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize * 0.6;
      drawPointedEye(ctx, x, y, size);
      ctx.stroke();
    }
  }
}

function renderAlmond(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.5)) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize * 0.5;
      drawPointedEye(ctx, x, y, size);
      ctx.fill();
    }
  }
}

function renderDouble(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / (unitSize * 0.7)) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize * 0.7;
      // Outer eye
      drawPointedEye(ctx, x, y, size);
      ctx.stroke();
      // Inner eye
      drawPointedEye(ctx, x, y, size * 0.5);
      ctx.stroke();
      // Center dot
      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type EyeRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lw: number,
  color1: string,
  color2: string,
) => void;

const EYE_RENDERERS: Record<string, EyeRenderer> = {
  vesica: renderVesica,
  pointed: renderPointed,
  almond: renderAlmond,
  double: renderDouble,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const eyeLayerType: LayerTypeDefinition = {
  typeId: "patterns:eye",
  displayName: "Eye Pattern",
  icon: "eye",
  category: "draw",
  properties: EYE_PROPERTIES,
  propertyEditorId: "patterns:eye-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of EYE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "vesica";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 1.5;
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = EYE_RENDERERS[style] ?? EYE_RENDERERS.vesica!;

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
