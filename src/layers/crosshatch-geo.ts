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

const CROSSHATCH_GEO_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "angle1",
    label: "Angle 1",
    type: "number",
    default: 45,
    min: 0,
    max: 360,
    step: 1,
    group: "crosshatch-geo",
  },
  {
    key: "angle2",
    label: "Angle 2",
    type: "number",
    default: 135,
    min: 0,
    max: 360,
    step: 1,
    group: "crosshatch-geo",
  },
  {
    key: "spacing",
    label: "Spacing",
    type: "number",
    default: 10,
    min: 2,
    max: 100,
    step: 0.5,
    group: "crosshatch-geo",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 1,
    min: 0.5,
    max: 20,
    step: 0.5,
    group: "crosshatch-geo",
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    default: "#000000",
    group: "crosshatch-geo",
  },
  {
    key: "backgroundColor",
    label: "Background Color",
    type: "color",
    default: "#ffffff",
    group: "crosshatch-geo",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "crosshatch-geo",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "crosshatch-geo",
  },
];

// ---------------------------------------------------------------------------
// Render helper: draw parallel lines at a given angle
// ---------------------------------------------------------------------------

function drawParallelLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diagonal: number,
  angleDeg: number,
  spacing: number,
  lineWidth: number,
  color: string,
): void {
  const angle = angleDeg * (Math.PI / 180);
  const totalLines = Math.ceil((2 * diagonal) / spacing) + 2;
  const startOffset = -(totalLines / 2) * spacing;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";

  for (let i = 0; i < totalLines; i++) {
    const y = startOffset + i * spacing;
    ctx.beginPath();
    ctx.moveTo(-diagonal, y);
    ctx.lineTo(diagonal, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const crosshatchGeoLayerType: LayerTypeDefinition = {
  typeId: "patterns:crosshatch-geo",
  displayName: "Crosshatch (Geometric)",
  icon: "hash",
  category: "draw",
  properties: CROSSHATCH_GEO_PROPERTIES,
  propertyEditorId: "patterns:crosshatch-geo-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CROSSHATCH_GEO_PROPERTIES) {
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

    const angle1 = (properties.angle1 as number) ?? 45;
    const angle2 = (properties.angle2 as number) ?? 135;
    const spacing = (properties.spacing as number) ?? 10;
    const lineWidth = (properties.lineWidth as number) ?? 1;
    const color = (properties.color as string) ?? "#000000";
    const backgroundColor = (properties.backgroundColor as string) ?? "#ffffff";
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    // Draw two sets of parallel lines
    drawParallelLines(ctx, cx, cy, diagonal, angle1, spacing, lineWidth, color);
    drawParallelLines(ctx, cx, cy, diagonal, angle2, spacing, lineWidth, color);

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

    return errors.length > 0 ? errors : null;
  },
};
