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

const CUBE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "isometric",
    options: [
      { value: "isometric", label: "Isometric Cube" },
      { value: "stacked", label: "Stacked Cubes" },
      { value: "tumbling-blocks", label: "Tumbling Blocks" },
    ],
    group: "cube",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "cube",
  },
  {
    key: "color1",
    label: "Color 1 (top)",
    type: "color",
    default: "#2c3e50",
    group: "cube",
  },
  {
    key: "color2",
    label: "Color 2 (left)",
    type: "color",
    default: "#5d6d7e",
    group: "cube",
  },
  {
    key: "color3",
    label: "Color 3 (right)",
    type: "color",
    default: "#85929e",
    group: "cube",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 1,
    min: 0,
    max: 20,
    step: 0.5,
    group: "cube",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "cube",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "cube",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "cube",
  },
];

const VALID_STYLES = ["isometric", "stacked", "tumbling-blocks"];

// ---------------------------------------------------------------------------
// Cube helpers
// ---------------------------------------------------------------------------

function drawIsoCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  // True isometric: edge length = size
  // halfW = horizontal half-span, halfH = vertical step per edge
  const halfW = size * (Math.sqrt(3) / 2);
  const halfH = size / 2;
  // Top face (diamond/rhombus)
  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);          // top vertex
  ctx.lineTo(cx + halfW, cy - halfH); // right
  ctx.lineTo(cx, cy);                 // center
  ctx.lineTo(cx - halfW, cy - halfH); // left
  ctx.closePath();
  ctx.fill();
  // Left face
  ctx.fillStyle = color2;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy - halfH); // top-left
  ctx.lineTo(cx, cy);                 // center
  ctx.lineTo(cx, cy + size);          // bottom
  ctx.lineTo(cx - halfW, cy + halfH); // bottom-left
  ctx.closePath();
  ctx.fill();
  // Right face
  ctx.fillStyle = color3;
  ctx.beginPath();
  ctx.moveTo(cx + halfW, cy - halfH); // top-right
  ctx.lineTo(cx, cy);                 // center
  ctx.lineTo(cx, cy + size);          // bottom
  ctx.lineTo(cx + halfW, cy + halfH); // bottom-right
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Cube renderers
// ---------------------------------------------------------------------------

function renderIsometric(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  // True isometric cube: width = size*√3, height = size*2
  const cubeW = size * Math.sqrt(3) + gap;
  const cubeH = size * 1.5 + gap; // rows overlap by size/2
  const cols = Math.ceil((2 * diagonal) / cubeW) + 4;
  const rows = Math.ceil((2 * diagonal) / cubeH) + 4;

  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : cubeW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * cubeW + xOff;
      const y = -diagonal + row * cubeH;
      drawIsoCube(ctx, x, y, size - gap * 0.5, color1, color2, color3);
    }
  }
}

function renderStacked(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  // Stacked cubes: tighter vertical packing, offset columns
  const cubeW = size * Math.sqrt(3) + gap;
  const cubeH = size * 2 + gap; // full cube height for stacking
  const cols = Math.ceil((2 * diagonal) / cubeW) + 4;
  const rows = Math.ceil((2 * diagonal) / cubeH) + 4;

  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : cubeW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * cubeW + xOff;
      const y = -diagonal + row * cubeH;
      drawIsoCube(ctx, x, y, size - gap * 0.5, color1, color2, color3);
    }
  }
}

function renderTumblingBlocks(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  _gap: number,
  color1: string,
  color2: string,
  color3: string,
): void {
  // Classic tumbling blocks: tessellating 60°/120° rhombuses in 3 orientations
  // Each "cube" = 3 rhombuses meeting at a center point
  const halfW = size * (Math.sqrt(3) / 2);
  const halfH = size / 2;

  // Grid: cubes tile with centers on a triangular grid
  const cubeW = halfW * 2; // horizontal distance between cube centers in a row
  const cubeH = size * 3;  // vertical distance between matching rows

  const cols = Math.ceil((2 * diagonal) / cubeW) + 4;
  const rows = Math.ceil((2 * diagonal) / cubeH) + 4;

  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Two cubes per cell: one at grid position, one offset
      for (let sub = 0; sub < 2; sub++) {
        const cx = -diagonal + col * cubeW + (sub === 1 ? halfW : 0);
        const cy = -diagonal + row * cubeH + (sub === 1 ? size * 1.5 : 0);

        // Top rhombus (horizontal diamond)
        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + halfW, cy - halfH);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - halfW, cy - halfH);
        ctx.closePath();
        ctx.fill();

        // Left rhombus
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy - halfH);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - halfW, cy + halfH);
        ctx.closePath();
        ctx.fill();

        // Right rhombus
        ctx.fillStyle = color3;
        ctx.beginPath();
        ctx.moveTo(cx + halfW, cy - halfH);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx + halfW, cy + halfH);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

type CubeRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
  color3: string,
) => void;

const CUBE_RENDERERS: Record<string, CubeRenderer> = {
  isometric: renderIsometric,
  stacked: renderStacked,
  "tumbling-blocks": renderTumblingBlocks,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const cubeLayerType: LayerTypeDefinition = {
  typeId: "patterns:cube",
  displayName: "Cube Pattern",
  icon: "cube",
  category: "draw",
  properties: CUBE_PROPERTIES,
  propertyEditorId: "patterns:cube-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CUBE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "isometric";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#5d6d7e";
    const color3 = (properties.color3 as string) ?? "#85929e";
    const gap = (properties.gap as number) ?? 1;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = CUBE_RENDERERS[style] ?? CUBE_RENDERERS.isometric!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diag = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diag, size, gap, color1, color2, color3);

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
