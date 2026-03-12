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

const JAPANESE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "style",
    label: "Style",
    type: "select",
    default: "asanoha",
    options: [
      { value: "asanoha", label: "Asanoha (Hemp Leaf)" },
      { value: "seigaiha", label: "Seigaiha (Blue Waves)" },
      { value: "shippo", label: "Shippo (Seven Treasures)" },
      { value: "bishamon-kikko", label: "Bishamon Kikko (Tortoiseshell)" },
      { value: "yagasuri", label: "Yagasuri (Arrow Feather)" },
      { value: "kumiko", label: "Kumiko (Woodwork)" },
    ],
    group: "japanese",
  },
  {
    key: "size",
    label: "Size",
    type: "number",
    default: 30,
    min: 8,
    max: 200,
    step: 1,
    group: "japanese",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "japanese",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#f5f5dc",
    group: "japanese",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 1,
    min: 0.5,
    max: 10,
    step: 0.5,
    group: "japanese",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "japanese",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "japanese",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "japanese",
  },
];

const VALID_STYLES = ["asanoha", "seigaiha", "shippo", "bishamon-kikko", "yagasuri", "kumiko"];

// ---------------------------------------------------------------------------
// Japanese pattern renderers
// ---------------------------------------------------------------------------

function renderAsanoha(
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
  const h = size * (Math.sqrt(3) / 2);
  const unitW = size;
  const unitH = h;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + xOff;
      const cy = -diagonal + row * unitH;
      // Asanoha: 6 lines radiating from center to hex vertices
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (size / 2) * Math.cos(a), cy + (size / 2) * Math.sin(a));
        ctx.stroke();
      }
    }
  }
}

function renderSeigaiha(
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
  const r = size / 2;
  const unitW = size;
  const unitH = r * 0.75;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + xOff;
      const cy = -diagonal + row * unitH;
      // Concentric semicircle arcs (seigaiha wave pattern)
      for (let ring = 1; ring <= 3; ring++) {
        const rr = r * (ring / 3);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, Math.PI, 0, false);
        ctx.stroke();
      }
    }
  }
}

function renderShippo(
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
  const r = size / 2;
  const unitSize = size;
  const cols = Math.ceil((2 * diagonal) / unitSize) + 4;
  const rows = Math.ceil((2 * diagonal) / unitSize) + 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitSize;
      const cy = -diagonal + row * unitSize;
      // Overlapping circles (shippo = seven treasures)
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderBishamonKikko(
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
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW;
  const unitH = r * 1.5;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      // Double hexagon (bishamon kikko)
      for (const scale of [1, 0.6]) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx + r * scale * Math.cos(a);
          const py = cy + r * scale * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
}

function renderYagasuri(
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
): void {
  ctx.fillStyle = color2;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);

  ctx.fillStyle = color1;
  ctx.lineWidth = lw;
  const unitW = size;
  const unitH = size * 1.5;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  for (let row = 0; row < rows; row++) {
    const xOff = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const x = -diagonal + col * unitW + xOff;
      const y = -diagonal + row * unitH;
      // Arrow feather shape
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + unitW / 2, y + unitH / 2);
      ctx.lineTo(x, y + unitH);
      ctx.lineTo(x, y + unitH / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function renderKumiko(
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
  const r = size / 2;
  const hexW = r * Math.sqrt(3);
  const unitW = hexW;
  const unitH = r * 1.5;
  const cols = Math.ceil((2 * diagonal) / unitW) + 4;
  const rows = Math.ceil((2 * diagonal) / unitH) + 4;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : unitW / 2;
    for (let col = 0; col < cols; col++) {
      const cx = -diagonal + col * unitW + offset;
      const cy = -diagonal + row * unitH;
      // Hex outline + internal star lines (kumiko woodwork)
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      // Internal lines from center to vertices
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        ctx.stroke();
      }
    }
  }
}

type JapaneseRenderer = (
  ctx: CanvasRenderingContext2D,
  diagonal: number,
  size: number,
  lw: number,
  color1: string,
  color2: string,
) => void;

const JAPANESE_RENDERERS: Record<string, JapaneseRenderer> = {
  asanoha: renderAsanoha,
  seigaiha: renderSeigaiha,
  shippo: renderShippo,
  "bishamon-kikko": renderBishamonKikko,
  yagasuri: renderYagasuri,
  kumiko: renderKumiko,
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const japaneseLayerType: LayerTypeDefinition = {
  typeId: "patterns:japanese",
  displayName: "Japanese Pattern",
  icon: "flower",
  category: "draw",
  properties: JAPANESE_PROPERTIES,
  propertyEditorId: "patterns:japanese-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of JAPANESE_PROPERTIES) {
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

    const style = (properties.style as string) ?? "asanoha";
    const size = (properties.size as number) ?? 30;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#f5f5dc";
    const lineWidth = (properties.lineWidth as number) ?? 1;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const renderer = JAPANESE_RENDERERS[style] ?? JAPANESE_RENDERERS.asanoha!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    renderer(ctx, diagonal, size, lineWidth, color1, color2);

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
