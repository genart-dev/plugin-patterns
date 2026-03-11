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

const STRIPE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "angle",
    label: "Angle",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "stripe",
  },
  {
    key: "spacing",
    label: "Spacing",
    type: "number",
    default: 20,
    min: 2,
    max: 200,
    step: 1,
    group: "stripe",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 10,
    min: 1,
    max: 100,
    step: 0.5,
    group: "stripe",
  },
  {
    key: "colors",
    label: "Colors (JSON)",
    type: "string",
    default: '["#000000","#ffffff"]',
    group: "stripe",
  },
  {
    key: "dashPattern",
    label: "Dash Pattern (JSON)",
    type: "string",
    default: "[]",
    group: "stripe",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "stripe",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "stripe",
  },
];

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const stripeLayerType: LayerTypeDefinition = {
  typeId: "patterns:stripe",
  displayName: "Stripe Pattern",
  icon: "lines",
  category: "draw",
  properties: STRIPE_PROPERTIES,
  propertyEditorId: "patterns:stripe-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of STRIPE_PROPERTIES) {
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

    const angle = ((properties.angle as number) ?? 0) * (Math.PI / 180);
    const spacing = (properties.spacing as number) ?? 20;
    const lineWidth = (properties.lineWidth as number) ?? 10;
    const layerOpacity = (properties.opacity as number) ?? 1;

    let colors: string[] = ["#000000", "#ffffff"];
    try {
      const parsed = JSON.parse((properties.colors as string) ?? "[]") as string[];
      if (Array.isArray(parsed) && parsed.length >= 2) colors = parsed;
    } catch { /* use default */ }

    let dashPattern: number[] = [];
    try {
      const parsed = JSON.parse((properties.dashPattern as string) ?? "[]") as number[];
      if (Array.isArray(parsed)) dashPattern = parsed;
    } catch { /* no dash */ }

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    // Rotate around bounds center and draw parallel bands
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
    const bandWidth = lineWidth + spacing;
    const totalBands = Math.ceil(diagonal / bandWidth) + 2;
    const startOffset = -(totalBands / 2) * bandWidth;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (dashPattern.length > 0) {
      ctx.setLineDash(dashPattern);
    }

    for (let i = 0; i < totalBands; i++) {
      const y = startOffset + i * bandWidth;
      const color = colors[i % colors.length]!;
      ctx.fillStyle = color;
      ctx.fillRect(-diagonal, y, diagonal * 2, lineWidth);
    }

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    for (const key of ["colors", "dashPattern", "region"] as const) {
      const val = properties[key];
      if (typeof val === "string" && val.trim() !== "") {
        try {
          JSON.parse(val);
        } catch {
          errors.push({ property: key, message: `${key} must be valid JSON` });
        }
      }
    }

    const colorsVal = properties.colors;
    if (typeof colorsVal === "string") {
      try {
        const parsed = JSON.parse(colorsVal) as unknown;
        if (!Array.isArray(parsed) || parsed.length < 2) {
          errors.push({ property: "colors", message: "colors must have at least 2 entries" });
        }
      } catch { /* already caught above */ }
    }

    return errors.length > 0 ? errors : null;
  },
};
