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

const LATTICE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "greek-key",
    options: [
      { value: "greek-key", label: "Greek Key" },
      { value: "chinese-fret", label: "Chinese Fret" },
      { value: "double-meander", label: "Double Meander" },
      { value: "chinese-window", label: "Chinese Window" },
      { value: "interlocking-fret", label: "Interlocking Fret" },
    ],
    group: "lattice",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "lattice",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "lattice",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "lattice",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 2,
    min: 0.5,
    max: 10,
    step: 0.5,
    group: "lattice",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "lattice",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "lattice",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "lattice",
  },
];

const VALID_STYLES = ["greek-key", "chinese-fret", "double-meander", "chinese-window", "interlocking-fret"];

// ---------------------------------------------------------------------------
// Lattice renderers
// ---------------------------------------------------------------------------

function renderGreekKey(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const s = unit * 0.9;
  const q = s / 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      // Greek key meander unit
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x + s, y + s);
      ctx.lineTo(x + q, y + s);
      ctx.lineTo(x + q, y + q);
      ctx.lineTo(x + s - q, y + q);
      ctx.lineTo(x + s - q, y + s - q);
      ctx.lineTo(x, y + s - q);
      ctx.stroke();
    }
  }
}

function renderChineseFret(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const s = unit * 0.9;
  const t = s / 3;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      // T-shaped fret
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.moveTo(x + s / 2, y);
      ctx.lineTo(x + s / 2, y + t);
      ctx.lineTo(x, y + t);
      ctx.lineTo(x, y + t * 2);
      ctx.lineTo(x + s, y + t * 2);
      ctx.moveTo(x + s / 2, y + t * 2);
      ctx.lineTo(x + s / 2, y + s);
      ctx.stroke();
    }
  }
}

function renderDoubleMeander(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const s = unit * 0.9;
  const q = s / 5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      // Double meander — two nested key spirals
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x + s, y + s);
      ctx.lineTo(x + q, y + s);
      ctx.lineTo(x + q, y + q);
      ctx.lineTo(x + s - q, y + q);
      ctx.lineTo(x + s - q, y + s - q);
      ctx.lineTo(x + q * 2, y + s - q);
      ctx.lineTo(x + q * 2, y + q * 2);
      ctx.lineTo(x + s - q * 2, y + q * 2);
      ctx.stroke();
    }
  }
}

function renderChineseWindow(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const s = unit * 0.9;
  const q = s / 3;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      // Rectangular window lattice with internal cross
      ctx.strokeRect(x, y, s, s);
      ctx.beginPath();
      ctx.moveTo(x + q, y);
      ctx.lineTo(x + q, y + s);
      ctx.moveTo(x + q * 2, y);
      ctx.lineTo(x + q * 2, y + s);
      ctx.moveTo(x, y + q);
      ctx.lineTo(x + s, y + q);
      ctx.moveTo(x, y + q * 2);
      ctx.lineTo(x + s, y + q * 2);
      ctx.stroke();
    }
  }
}

function renderInterlockingFret(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lw;
  const unit = size;
  const cols = Math.ceil((2 * diagonal) / unit) + 4;
  const rows = Math.ceil((2 * diagonal) / unit) + 4;
  const s = unit * 0.9;
  const h = s / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unit;
      const y = -diagonal + row * unit;
      const flip = (row + col) % 2 === 0;
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s, y + h);
        ctx.lineTo(x + h, y + h);
        ctx.lineTo(x + h, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + h, y);
        ctx.lineTo(x + h, y + h);
        ctx.lineTo(x + s, y + h);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
      }
      ctx.stroke();
    }
  }
}

type LatticeRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
) => void;

const LATTICE_RENDERERS: Record<string, LatticeRenderer> = {
  "greek-key": renderGreekKey,
  "chinese-fret": renderChineseFret,
  "double-meander": renderDoubleMeander,
  "chinese-window": renderChineseWindow,
  "interlocking-fret": renderInterlockingFret,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const latticeLayerType: LayerTypeDefinition = {
  typeId: "patterns:lattice",
  displayName: "Lattice Pattern",
  icon: "grid",
  category: "draw",
  properties: LATTICE_PROPERTIES,
  propertyEditorId: "patterns:lattice-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of LATTICE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "greek-key";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = LATTICE_RENDERERS[style] ?? LATTICE_RENDERERS["greek-key"]!;

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
