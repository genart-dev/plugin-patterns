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

const PLAID_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "tartan",
    options: [
      { value: "tartan", label: "Tartan" },
      { value: "buffalo-plaid", label: "Buffalo Plaid" },
      { value: "madras", label: "Madras" },
      { value: "windowpane", label: "Windowpane" },
    ],
    group: "plaid",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 40,
    min: 8,
    max: 200,
    step: 1,
    group: "plaid",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#c0392b",
    group: "plaid",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#1a5276",
    group: "plaid",
  },
  {
    key: "color3",
    label: "Color 3 (accent)",
    type: "color",
    default: "#27ae60",
    group: "plaid",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "plaid",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "plaid",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "plaid",
  },
];

const VALID_STYLES = ["tartan", "buffalo-plaid", "madras", "windowpane"];

// ---------------------------------------------------------------------------
// Plaid renderers
// ---------------------------------------------------------------------------

function drawStripes(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  bands: Array<{ offset: number; width: number; color: string }>,
  unitSize: number,
  horizontal: boolean,
): void {
  const count = Math.ceil((diagonal * 2) / unitSize) + 2;
  for (let i = 0; i < count; i++) {
    const base = -diagonal + i * unitSize;
    for (const band of bands) {
      ctx.fillStyle = band.color;
      if (horizontal) {
        ctx.fillRect(-diagonal, base + band.offset, diagonal * 2, band.width);
      } else {
        ctx.fillRect(base + band.offset, -diagonal, band.width, diagonal * 2);
      }
    }
  }
}

function renderTartan(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  // Background
  ctx.fillStyle = color1;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.globalAlpha *= 0.5;

  // Broad vertical bands
  const bands1 = [
    { offset: 0, width: size * 0.4, color: color2 },
    { offset: size * 0.7, width: size * 0.06, color: color3 },
  ];
  drawStripes(ctx, diagonal, bands1, size, false);

  // Broad horizontal bands
  drawStripes(ctx, diagonal, bands1, size, true);

  ctx.globalAlpha /= 0.5;
}

function renderBuffaloPlaid(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  color1: string,
  color2: string,
  _color3: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const half = size / 2;
  ctx.globalAlpha *= 0.6;
  // Vertical bands
  const count = Math.ceil((diagonal * 2) / size) + 2;
  ctx.fillStyle = color1;
  for (let i = 0; i < count; i++) {
    ctx.fillRect(-diagonal + i * size, -diagonal, half, diagonal * 2);
  }
  // Horizontal bands
  for (let i = 0; i < count; i++) {
    ctx.fillRect(-diagonal, -diagonal + i * size, diagonal * 2, half);
  }
  ctx.globalAlpha /= 0.6;
}

function renderMadras(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#fef9e7";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.globalAlpha *= 0.4;

  const bands = [
    { offset: 0, width: size * 0.3, color: color1 },
    { offset: size * 0.35, width: size * 0.2, color: color2 },
    { offset: size * 0.65, width: size * 0.15, color: color3 },
  ];
  drawStripes(ctx, diagonal, bands, size, false);
  drawStripes(ctx, diagonal, bands, size, true);

  ctx.globalAlpha /= 0.4;
}

function renderWindowpane(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  color1: string,
  color2: string,
  _color3: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = 1.5;
  const count = Math.ceil((diagonal * 2) / size) + 2;
  for (let i = 0; i < count; i++) {
    const pos = -diagonal + i * size;
    ctx.beginPath();
    ctx.moveTo(pos, -diagonal);
    ctx.lineTo(pos, diagonal);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-diagonal, pos);
    ctx.lineTo(diagonal, pos);
    ctx.stroke();
  }
}

type PlaidRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const PLAID_RENDERERS: Record<string, PlaidRenderer> = {
  tartan: renderTartan,
  "buffalo-plaid": renderBuffaloPlaid,
  madras: renderMadras,
  windowpane: renderWindowpane,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const plaidLayerType: LayerTypeDefinition = {
  typeId: "patterns:plaid",
  displayName: "Plaid Pattern",
  icon: "grid",
  category: "draw",
  properties: PLAID_PROPERTIES,
  propertyEditorId: "patterns:plaid-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of PLAID_PROPERTIES) {
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

    const style = (properties.style as string) ?? "tartan";
    const size = (properties.size as number) ?? 40;
    const color1 = (properties.color1 as string) ?? "#c0392b";
    const color2 = (properties.color2 as string) ?? "#1a5276";
    const color3 = (properties.color3 as string) ?? "#27ae60";
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = PLAID_RENDERERS[style] ?? PLAID_RENDERERS.tartan!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diagonal, size, color1, color2, color3);

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
