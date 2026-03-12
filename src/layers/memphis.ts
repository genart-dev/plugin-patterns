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

const MEMPHIS_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "classic",
    options: [
      { value: "classic", label: "Classic" },
      { value: "confetti", label: "Confetti" },
      { value: "geometric", label: "Geometric" },
      { value: "squiggle", label: "Squiggle" },
    ],
    group: "memphis",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 20,
    min: 6,
    max: 100,
    step: 1,
    group: "memphis",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#e74c3c",
    group: "memphis",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#f1c40f",
    group: "memphis",
  },
  {
    key: "color3",
    label: "Color 3",
    type: "color",
    default: "#3498db",
    group: "memphis",
  },
  {
    key: "density",
    label: "Density",
    type: "number",
    default: 40,
    min: 5,
    max: 100,
    step: 1,
    group: "memphis",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "memphis",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "memphis",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "memphis",
  },
];

const VALID_STYLES = ["classic", "confetti", "geometric", "squiggle"];

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
// Memphis renderers
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
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.floor((area / 10000) * density);
  const rng = seededRandom(42);
  const colors = [color1, color2, color3];

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const angle = rng() * Math.PI * 2;
    const s = size * (0.5 + rng() * 0.8);
    const shape = Math.floor(rng() * 4);
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)]!;
    ctx.strokeStyle = colors[Math.floor(rng() * colors.length)]!;
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    switch (shape) {
      case 0: // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 1: // Circle
        ctx.beginPath();
        ctx.arc(0, 0, s / 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 2: // Line
        ctx.beginPath();
        ctx.moveTo(-s / 2, 0);
        ctx.lineTo(s / 2, 0);
        ctx.stroke();
        break;
      case 3: // Cross
        ctx.beginPath();
        ctx.moveTo(-s / 3, 0);
        ctx.lineTo(s / 3, 0);
        ctx.moveTo(0, -s / 3);
        ctx.lineTo(0, s / 3);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }
}

function renderConfetti(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const area = (diagonal * 2) * (diagonal * 2);
  const count = Math.floor((area / 10000) * density);
  const rng = seededRandom(137);
  const colors = [color1, color2, color3];

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const angle = rng() * Math.PI * 2;
    const w = size * (0.2 + rng() * 0.3);
    const h = size * (0.6 + rng() * 0.4);
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)]!;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

function renderGeometric(
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
    const angle = rng() * Math.PI * 2;
    const s = size * (0.4 + rng() * 0.6);
    const shape = Math.floor(rng() * 3);

    ctx.strokeStyle = color1;
    ctx.lineWidth = 1.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    switch (shape) {
      case 0: // Square outline
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        break;
      case 1: // Circle outline
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 2: // Triangle outline
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.stroke();
        break;
    }
    ctx.restore();
  }
}

function renderSquiggle(
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
  const rng = seededRandom(311);

  ctx.strokeStyle = color1;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (let i = 0; i < count; i++) {
    const x = -diagonal + rng() * diagonal * 2;
    const y = -diagonal + rng() * diagonal * 2;
    const angle = rng() * Math.PI * 2;
    const len = size * (0.8 + rng() * 0.5);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    const segs = 4;
    for (let s = 1; s <= segs; s++) {
      const sx = -len / 2 + (s / segs) * len;
      const sy = (s % 2 === 0 ? -1 : 1) * size * 0.3;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();
  }
}

type MemphisRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  density: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const MEMPHIS_RENDERERS: Record<string, MemphisRenderer> = {
  classic: renderClassic,
  confetti: renderConfetti,
  geometric: renderGeometric,
  squiggle: renderSquiggle,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const memphisLayerType: LayerTypeDefinition = {
  typeId: "patterns:memphis",
  displayName: "Memphis Pattern",
  icon: "sparkle",
  category: "draw",
  properties: MEMPHIS_PROPERTIES,
  propertyEditorId: "patterns:memphis-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of MEMPHIS_PROPERTIES) {
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
    const size = (properties.size as number) ?? 20;
    const color1 = (properties.color1 as string) ?? "#e74c3c";
    const color2 = (properties.color2 as string) ?? "#f1c40f";
    const color3 = (properties.color3 as string) ?? "#3498db";
    const density = (properties.density as number) ?? 40;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = MEMPHIS_RENDERERS[style] ?? MEMPHIS_RENDERERS.classic!;

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
