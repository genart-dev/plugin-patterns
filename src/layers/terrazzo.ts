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

const TERRAZZO_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "classic",
    options: [
      { value: "classic", label: "Classic" },
      { value: "bold", label: "Bold" },
      { value: "blob", label: "Blob" },
    ],
    group: "terrazzo",
  },
  {
    key: "size",
    label: "Chip Size",
    type: "number",
    default: 16,
    min: 4,
    max: 80,
    step: 1,
    group: "terrazzo",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "terrazzo",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "terrazzo",
  },
  {
    key: "color3",
    label: "Color 3",
    type: "color",
    default: "#c0392b",
    group: "terrazzo",
  },
  {
    key: "density",
    label: "Density",
    type: "number",
    default: 40,
    min: 5,
    max: 100,
    step: 1,
    group: "terrazzo",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "terrazzo",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "terrazzo",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "terrazzo",
  },
];

const VALID_STYLES = ["classic", "bold", "blob"];

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Terrazzo renderers
// ---------------------------------------------------------------------------

function renderClassic(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#f0ece3";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.floor((area / 10000) * density);
  const rng = seededRandom(42);
  const colors = [color1, color2, color3];

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const angle = rng() * Math.PI * 2;
    const w = size * (0.3 + rng() * 0.7);
    const h = size * (0.15 + rng() * 0.3);
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)]!;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // Irregular polygon chip
    const sides = 3 + Math.floor(rng() * 4);
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const r = (s % 2 === 0 ? w : h) * (0.7 + rng() * 0.3);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function renderBold(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.floor((area / 10000) * density * 0.6);
  const rng = seededRandom(137);
  const colors = [color1, color2, color3];

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const angle = rng() * Math.PI * 2;
    const w = size * (0.8 + rng() * 1.2);
    const h = size * (0.4 + rng() * 0.6);
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)]!;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const sides = 4 + Math.floor(rng() * 3);
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      const r = (s % 2 === 0 ? w : h) * (0.6 + rng() * 0.4);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function renderBlob(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  _color3: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.floor((area / 10000) * density);
  const rng = seededRandom(256);

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const r = size * (0.3 + rng() * 0.7);
    ctx.fillStyle = color1;
    ctx.globalAlpha = 0.3 + rng() * 0.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rng() * 0.5), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

type TerrazzoRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const TERRAZZO_RENDERERS: Record<string, TerrazzoRenderer> = {
  classic: renderClassic,
  bold: renderBold,
  blob: renderBlob,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const terrazzoLayerType: LayerTypeDefinition = {
  typeId: "patterns:terrazzo",
  displayName: "Terrazzo Pattern",
  icon: "scatter",
  category: "draw",
  properties: TERRAZZO_PROPERTIES,
  propertyEditorId: "patterns:terrazzo-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of TERRAZZO_PROPERTIES) {
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

    const style = (properties.style as string) ?? "classic";
    const size = (properties.size as number) ?? 16;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const color3 = (properties.color3 as string) ?? "#c0392b";
    const density = (properties.density as number) ?? 40;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = TERRAZZO_RENDERERS[style] ?? TERRAZZO_RENDERERS.classic!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, density, color1, color2, color3);

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
