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

const TILE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "tileShape",
    label: "Tile Shape",
    type: "select",
    default: "brick",
    options: [
      { value: "brick", label: "Brick" },
      { value: "basketweave", label: "Basketweave" },
      { value: "hex", label: "Hexagonal" },
      { value: "scale", label: "Fish Scale" },
      { value: "moroccan", label: "Moroccan" },
      { value: "ogee", label: "Ogee" },
      { value: "lantern", label: "Lantern" },
      { value: "basketweave-tight", label: "Basketweave Tight" },
    ],
    group: "tile",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "tile",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#c0392b",
    group: "tile",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "tile",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 2,
    min: 0,
    max: 20,
    step: 0.5,
    group: "tile",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "tile",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "tile",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "tile",
  },
];

const VALID_TILE_SHAPES = ["brick", "basketweave", "hex", "scale", "moroccan", "ogee", "lantern", "basketweave-tight"];

// ---------------------------------------------------------------------------
// Tile renderers
// ---------------------------------------------------------------------------

function renderBrick(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const brickW = size * 2;
  const brickH = size;
  const unitW = brickW + gap;
  const unitH = brickH + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 2;
  const rows = Math.ceil((2 * diagonal) / unitH) + 2;
  const halfW = (cols * unitW) / 2;
  const halfH = (rows * unitH) / 2;

  // Background (mortar color)
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = (row % 2 === 0) ? 0 : unitW / 2;
    for (let col = -1; col < cols; col++) {
      const x = -halfW + col * unitW + offset;
      const y = -halfH + row * unitH;
      ctx.fillRect(x, y, brickW, brickH);
    }
  }
}

function renderBasketweave(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size * 2 + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 2;
  const half = (count * unitSize) / 2;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const x = -half + col * unitSize;
      const y = -half + row * unitSize;
      const isHorizontal = (row + col) % 2 === 0;

      ctx.fillStyle = color1;
      if (isHorizontal) {
        // Two horizontal rectangles stacked
        ctx.fillRect(x, y, size * 2, size - gap / 2);
        ctx.fillRect(x, y + size + gap / 2, size * 2, size - gap / 2);
      } else {
        // Two vertical rectangles side by side
        ctx.fillRect(x, y, size - gap / 2, size * 2);
        ctx.fillRect(x + size + gap / 2, y, size - gap / 2, size * 2);
      }
    }
  }
}

function renderHex(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const hexH = r * 2;
  const unitW = hexW + gap;
  const unitH = hexH * 0.75 + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;
  const halfW = (cols * unitW) / 2;
  const halfH = (rows * unitH) / 2;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  for (let row = 0; row < rows; row++) {
    const offset = (row % 2 === 0) ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -halfW + col * unitW + offset;
      const cy = -halfH + row * unitH;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + (r - gap / 2) * Math.cos(a);
        const py = cy + (r - gap / 2) * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderScale(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const r = size / 2;
  const unitW = size + gap;
  const unitH = r + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;
  const halfW = (cols * unitW) / 2;
  const halfH = (rows * unitH) / 2;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;
  ctx.lineWidth = gap > 0 ? gap : 0;

  for (let row = 0; row < rows; row++) {
    const offset = (row % 2 === 0) ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -halfW + col * unitW + offset;
      const cy = -halfH + row * unitH;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      if (gap > 0) ctx.stroke();
    }
  }
}

function renderMoroccan(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  // 8-pointed star tile pattern
  const unitSize = size + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 4;
  const half = (count * unitSize) / 2;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const r = size / 2;
  const inner = r * 0.38; // inner radius of 8-pointed star

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const cx = -half + col * unitSize;
      const cy = -half + row * unitSize;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const outerAngle = (Math.PI / 4) * i - Math.PI / 8;
        const innerAngle = outerAngle + Math.PI / 8;
        const ox = cx + r * Math.cos(outerAngle);
        const oy = cy + r * Math.sin(outerAngle);
        const ix = cx + inner * Math.cos(innerAngle);
        const iy = cy + inner * Math.sin(innerAngle);
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderOgee(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitW = size + gap;
  const unitH = size * 1.5 + gap;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.strokeStyle = color1;
  ctx.lineWidth = 1.5;
  const hs = size / 2;
  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + xOff;
      const cy = -diagonal + row * unitH;
      // Ogee: S-curve pointed arch
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.75);
      ctx.quadraticCurveTo(cx + hs, cy - size * 0.25, cx + hs, cy);
      ctx.quadraticCurveTo(cx + hs, cy + size * 0.25, cx, cy + size * 0.75);
      ctx.quadraticCurveTo(cx - hs, cy + size * 0.25, cx - hs, cy);
      ctx.quadraticCurveTo(cx - hs, cy - size * 0.25, cx, cy - size * 0.75);
      ctx.closePath();
      ctx.fillStyle = color1;
      ctx.globalAlpha *= 0.3;
      ctx.fill();
      ctx.globalAlpha /= 0.3;
      ctx.stroke();
    }
  }
}

function renderLantern(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  const unitSize = size + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 4;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  const hs = size / 2;
  const nw = size * 0.25; // narrow waist width
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const cx = -diagonal + col * unitSize;
      const cy = -diagonal + row * unitSize;
      // Lantern: narrow-waisted shape
      ctx.beginPath();
      ctx.moveTo(cx - nw, cy - hs);
      ctx.quadraticCurveTo(cx - hs, cy - hs * 0.3, cx - hs, cy);
      ctx.quadraticCurveTo(cx - hs, cy + hs * 0.3, cx - nw, cy + hs);
      ctx.lineTo(cx + nw, cy + hs);
      ctx.quadraticCurveTo(cx + hs, cy + hs * 0.3, cx + hs, cy);
      ctx.quadraticCurveTo(cx + hs, cy - hs * 0.3, cx + nw, cy - hs);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderBasketweaveTight(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
): void {
  // Same as basketweave but with smaller units and tighter gap
  const tightSize = size * 0.6;
  const unitSize = tightSize * 2 + gap;
  const count = Math.ceil((2 * diagonal) / unitSize) + 2;
  const half = (count * unitSize) / 2;

  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const x = -half + col * unitSize;
      const y = -half + row * unitSize;
      const isHorizontal = (row + col) % 2 === 0;

      ctx.fillStyle = color1;
      if (isHorizontal) {
        ctx.fillRect(x, y, tightSize * 2, tightSize - gap / 2);
        ctx.fillRect(x, y + tightSize + gap / 2, tightSize * 2, tightSize - gap / 2);
      } else {
        ctx.fillRect(x, y, tightSize - gap / 2, tightSize * 2);
        ctx.fillRect(x + tightSize + gap / 2, y, tightSize - gap / 2, tightSize * 2);
      }
    }
  }
}

type TileRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  gap: number,
  color1: string,
  color2: string,
) => void;

const TILE_RENDERERS: Record<string, TileRenderer> = {
  brick: renderBrick,
  basketweave: renderBasketweave,
  hex: renderHex,
  scale: renderScale,
  moroccan: renderMoroccan,
  ogee: renderOgee,
  lantern: renderLantern,
  "basketweave-tight": renderBasketweaveTight,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const tileLayerType: LayerTypeDefinition = {
  typeId: "patterns:tile",
  displayName: "Tile Pattern",
  icon: "tile",
  category: "draw",
  properties: TILE_PROPERTIES,
  propertyEditorId: "patterns:tile-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of TILE_PROPERTIES) {
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

    const tileShape = (properties.tileShape as string) ?? "brick";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#c0392b";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const gap = (properties.gap as number) ?? 2;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = TILE_RENDERERS[tileShape] ?? TILE_RENDERERS.brick!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diagonal, size, gap, color1, color2);

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

    const tileShape = properties.tileShape as string;
    if (tileShape && !VALID_TILE_SHAPES.includes(tileShape)) {
      errors.push({
        property: "tileShape",
        message: `tileShape must be one of: ${VALID_TILE_SHAPES.join(", ")}`,
      });
    }

    return errors.length > 0 ? errors : null;
  },
};
