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

const DIAMOND_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "simple",
    options: [
      { value: "simple", label: "Simple Diamond" },
      { value: "argyle", label: "Argyle" },
      { value: "nested", label: "Nested Diamond" },
      { value: "adjointed", label: "Adjointed Diamonds" },
      { value: "lattice", label: "Diamond Lattice" },
    ],
    group: "diamond",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "diamond",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "diamond",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "diamond",
  },
  {
    key: "color3",
    label: "Color 3 (Argyle accent)",
    type: "color",
    default: "#1a5276",
    group: "diamond",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 2,
    min: 0,
    max: 20,
    step: 0.5,
    group: "diamond",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "diamond",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "diamond",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "diamond",
  },
];

const VALID_STYLES = ["simple", "argyle", "nested", "adjointed", "lattice"];

// ---------------------------------------------------------------------------
// Diamond renderers
// ---------------------------------------------------------------------------

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
}

function renderSimple(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitW = size + gap;
  const unitH = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + xOff;
      const y = -diagonal + row * unitH;
      drawDiamond(ctx, x, y, size - gap, size - gap);
      ctx.fill();
    }
  }
}

function renderArgyle(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  _gap: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  const dw = size;
  const dh = size * 1.5;
  const unitW = dw;
  const unitH = dh;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  // Main diamonds
  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + xOff;
      const y = -diagonal + row * unitH;
      drawDiamond(ctx, x, y, dw, dh);
      ctx.fill();
    }
  }

  // Thin diagonal lines (argyle characteristic)
  ctx.strokeStyle = color3;
  ctx.lineWidth = 1.5;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + xOff;
      const y = -diagonal + row * unitH;
      drawDiamond(ctx, x, y, dw * 0.6, dh * 0.6);
      ctx.stroke();
    }
  }
}

function renderNested(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitW = size + gap;
  const unitH = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW;
      const y = -diagonal + row * unitH;
      // Outer diamond
      ctx.fillStyle = color1;
      drawDiamond(ctx, x, y, size - gap, size - gap);
      ctx.fill();
      // Inner diamond
      ctx.fillStyle = color2;
      drawDiamond(ctx, x, y, (size - gap) * 0.5, (size - gap) * 0.5);
      ctx.fill();
    }
  }
}

function renderAdjointed(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  // Diamonds sharing edges — tessellating rhombus grid
  const unitW = size + gap;
  const unitH = (size / 2) + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + (row % 2 === 0 ? 0 : unitW / 2);
      const y = -diagonal + row * unitH;
      ctx.fillStyle = (row + col) % 2 === 0 ? color1 : color2;
      drawDiamond(ctx, x, y, size - gap, size / 2 - gap / 2);
      ctx.fill();
    }
  }
}

function renderLattice(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  // Diamond outlines forming a lattice
  ctx.strokeStyle = color1;
  ctx.lineWidth = Math.max(1, gap);
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitSize / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize + xOff;
      const y = -diagonal + row * unitSize;
      drawDiamond(ctx, x, y, size - gap, size - gap);
      ctx.stroke();
    }
  }
}

type DiamondRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const DIAMOND_RENDERERS: Record<string, DiamondRenderer> = {
  simple: renderSimple as DiamondRenderer,
  argyle: renderArgyle,
  nested: renderNested as DiamondRenderer,
  adjointed: renderAdjointed as DiamondRenderer,
  lattice: renderLattice as DiamondRenderer,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const diamondLayerType: LayerTypeDefinition = {
  typeId: "patterns:diamond",
  displayName: "Diamond Pattern",
  icon: "diamond",
  category: "draw",
  properties: DIAMOND_PROPERTIES,
  propertyEditorId: "patterns:diamond-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of DIAMOND_PROPERTIES) {
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

    const style = (properties.style as string) ?? "simple";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const color3 = (properties.color3 as string) ?? "#1a5276";
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = DIAMOND_RENDERERS[style] ?? DIAMOND_RENDERERS.simple!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diagonal, size, gap, color1, color2, color3);

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    const regionVal = properties.region;
    if (typeof regionVal === "string" && regionVal.trim() !== "") {
      try {
        JSON.parse(regionVal);
      } catch {
        errors.push({ property: "region", message: "region must be valid JSON" });
      }
    }

    const style = properties.style as string;
    if (style && !VALID_STYLES.includes(style)) {
      errors.push({
        property: "style",
        message: `style must be one of: ${VALID_STYLES.join(", ")}`,
      });
    }

    return errors.length > 0 ? errors : null;
  },
};
