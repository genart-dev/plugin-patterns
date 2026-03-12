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

const CHECKER_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "cellSize",
    label: "Cell Size",
    type: "number",
    default: 30,
    min: 4,
    max: 200,
    step: 1,
    group: "checker",
  },
  {
    key: "colors",
    label: "Colors (JSON)",
    type: "string",
    default: '["#000000","#ffffff"]',
    group: "checker",
  },
  {
    key: "angle",
    label: "Angle",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "checker",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "checker",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "checker",
  },
];

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const checkerLayerType: LayerTypeDefinition = {
  typeId: "patterns:checker",
  displayName: "Checker Pattern",
  icon: "grid",
  category: "draw",
  properties: CHECKER_PROPERTIES,
  propertyEditorId: "patterns:checker-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CHECKER_PROPERTIES) {
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

    const cellSize = (properties.cellSize as number) ?? 30;
    const angle = ((properties.angle as number) ?? 0) * (Math.PI / 180);
    const layerOpacity = (properties.opacity as number) ?? 1;

    let colors: string[] = ["#000000", "#ffffff"];
    try {
      const parsed = JSON.parse((properties.colors as string) ?? "[]") as string[];
      if (Array.isArray(parsed) && parsed.length >= 2) colors = parsed;
    } catch { /* use default */ }

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
    const cols = Math.ceil((2 * diagonal) / cellSize) + 2;
    const rows = Math.ceil((2 * diagonal) / cellSize) + 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const halfW = (cols * cellSize) / 2;
    const halfH = (rows * cellSize) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIdx = (row + col) % 2;
        ctx.fillStyle = colors[colorIdx]!;
        ctx.fillRect(-halfW + col * cellSize, -halfH + row * cellSize, cellSize, cellSize);
      }
    }

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    for (const key of ["colors", "region"] as const) {
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
