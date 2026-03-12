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

const CIRCLE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "concentric",
    options: [
      { value: "concentric", label: "Concentric Rings" },
      { value: "overlapping", label: "Overlapping Circles" },
      { value: "packed", label: "Packed Circles" },
      { value: "semicircle", label: "Semicircle Row" },
      { value: "quarter-turn", label: "Quarter Turn" },
      { value: "bullseye", label: "Bullseye" },
    ],
    group: "circle",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 40,
    min: 8,
    max: 200,
    step: 1,
    group: "circle",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "circle",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "circle",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 2,
    min: 0.5,
    max: 20,
    step: 0.5,
    group: "circle",
  },
  {
    key: "gap",
    label: "Gap / Ring Spacing",
    type: "number",
    default: 6,
    min: 0,
    max: 40,
    step: 0.5,
    group: "circle",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "circle",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "circle",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "circle",
  },
];

const VALID_STYLES = ["concentric", "overlapping", "packed", "semicircle", "quarter-turn", "bullseye"];

// ---------------------------------------------------------------------------
// Circle renderers
// ---------------------------------------------------------------------------

function renderConcentric(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lineWidth: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lineWidth;
  const r = size / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      // Multiple concentric rings
      const rings = Math.floor(r / gap) || 1;
      for (let i = 0; i < rings; i++) {
        const ringR = r - i * gap;
        if (ringR <= 0) break;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

function renderOverlapping(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  _gap: number,
  lineWidth: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const unitSize = size * 0.7;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lineWidth;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderPacked(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  _lineWidth: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const unitW = size + gap;
  const unitH = size * (Math.sqrt(3) / 2) + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + offset;
      const y = -diagonal + row * unitH;
      ctx.beginPath();
      ctx.arc(x, y, r - gap / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderSemicircle(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  _lineWidth: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const unitW = size + gap;
  const unitH = r + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + offset;
      const y = -diagonal + row * unitH;
      ctx.beginPath();
      ctx.arc(x, y, r - gap / 2, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderQuarterTurn(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lineWidth: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = lineWidth;
  const r = size / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      // Quarter arcs from corners of cell
      const quadrant = (row + col) % 4;
      const startAngle = (Math.PI / 2) * quadrant;
      // Draw concentric quarter arcs
      const rings = Math.floor(r / gap) || 1;
      for (let i = 0; i < rings; i++) {
        const ringR = r - i * gap;
        if (ringR <= 0) break;
        ctx.beginPath();
        ctx.arc(x, y, ringR, startAngle, startAngle + Math.PI / 2);
        ctx.stroke();
      }
    }
  }
}

function renderBullseye(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lineWidth: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap * 2;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  const r = size / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitSize;
      const y = -diagonal + row * unitSize;
      // Alternating filled rings
      const rings = Math.floor(r / (lineWidth + gap)) || 1;
      for (let i = 0; i < rings; i++) {
        const ringR = r - i * (lineWidth + gap);
        if (ringR <= 0) break;
        ctx.fillStyle = i % 2 === 0 ? color1 : color2;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

type CircleRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  lineWidth: number,
  color1: string,
  color2: string,
) => void;

const CIRCLE_RENDERERS: Record<string, CircleRenderer> = {
  concentric: renderConcentric,
  overlapping: renderOverlapping,
  packed: renderPacked,
  semicircle: renderSemicircle,
  "quarter-turn": renderQuarterTurn,
  bullseye: renderBullseye,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const circleLayerType: LayerTypeDefinition = {
  typeId: "patterns:circle",
  displayName: "Circle Pattern",
  icon: "circle",
  category: "draw",
  properties: CIRCLE_PROPERTIES,
  propertyEditorId: "patterns:circle-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CIRCLE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "concentric";
    const size = (properties.size as number) ?? 40;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const gap = (properties.gap as number) ?? 6;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = CIRCLE_RENDERERS[style] ?? CIRCLE_RENDERERS.concentric!;

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
