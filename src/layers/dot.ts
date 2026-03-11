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

const DOT_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "spacing",
    label: "Spacing",
    type: "number",
    default: 24,
    min: 4,
    max: 200,
    step: 1,
    group: "dot",
  },
  {
    key: "radius",
    label: "Radius",
    type: "number",
    default: 6,
    min: 1,
    max: 100,
    step: 0.5,
    group: "dot",
  },
  {
    key: "offset",
    label: "Hex Offset",
    type: "boolean",
    default: false,
    group: "dot",
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    default: "#000000",
    group: "dot",
  },
  {
    key: "backgroundColor",
    label: "Background Color",
    type: "color",
    default: "#ffffff",
    group: "dot",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "dot",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "dot",
  },
];

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const dotLayerType: LayerTypeDefinition = {
  typeId: "patterns:dot",
  displayName: "Dot Pattern",
  icon: "circle-dot",
  category: "draw",
  properties: DOT_PROPERTIES,
  propertyEditorId: "patterns:dot-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of DOT_PROPERTIES) {
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

    const spacing = (properties.spacing as number) ?? 24;
    const radius = (properties.radius as number) ?? 6;
    const hexOffset = (properties.offset as boolean) ?? false;
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

    // Draw dots
    ctx.fillStyle = color;
    const rowSpacing = hexOffset ? spacing * (Math.sqrt(3) / 2) : spacing;
    const cols = Math.ceil(bounds.width / spacing) + 1;
    const rows = Math.ceil(bounds.height / rowSpacing) + 1;

    for (let row = 0; row < rows; row++) {
      const y = bounds.y + row * rowSpacing;
      const xOffset = hexOffset && row % 2 === 1 ? spacing / 2 : 0;
      for (let col = 0; col < cols; col++) {
        const x = bounds.x + col * spacing + xOffset;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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
