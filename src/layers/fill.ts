import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import type { PatternRegion, PatternStrategy, ShadingFunction, ShadingAffect, GeneratedPath } from "../core/types.js";
import { generatePatternPaths } from "../core/generators.js";
import { applyRegionClip } from "../core/region-utils.js";
import { renderPatternPaths } from "../core/renderer.js";

// ---------------------------------------------------------------------------
// Property schema
// ---------------------------------------------------------------------------

const FILL_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "color",
    label: "Color",
    type: "color",
    default: "#000000",
    group: "fill",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 2,
    min: 0.5,
    max: 50,
    step: 0.5,
    group: "fill",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "fill",
  },
  {
    key: "strategy",
    label: "Strategy (JSON)",
    type: "string",
    default: '{"type":"hatch","angle":45,"spacing":8}',
    group: "fill",
  },
  {
    key: "shading",
    label: "Shading (JSON)",
    type: "string",
    default: '{"type":"uniform"}',
    group: "fill",
  },
  {
    key: "shadingAffects",
    label: "Shading Affects",
    type: "string",
    default: '["density"]',
    group: "fill",
  },
  {
    key: "seed",
    label: "Seed",
    type: "number",
    default: 42,
    min: 0,
    max: 99999,
    step: 1,
    group: "fill",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "fill",
  },
];

// ---------------------------------------------------------------------------
// Simple cache keyed by stringified properties
// ---------------------------------------------------------------------------

interface PathCacheEntry {
  key: string;
  paths: GeneratedPath[];
}

const _pathCache = new Map<string, PathCacheEntry>();

function makeCacheKey(properties: LayerProperties, bounds: LayerBounds): string {
  return JSON.stringify([
    properties.color,
    properties.lineWidth,
    properties.region,
    properties.strategy,
    properties.shading,
    properties.shadingAffects,
    properties.seed,
    bounds.x, bounds.y, bounds.width, bounds.height,
    properties.opacity,
  ]);
}

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const fillLayerType: LayerTypeDefinition = {
  typeId: "patterns:fill",
  displayName: "Pattern Fill",
  icon: "bucket",
  category: "draw",
  properties: FILL_PROPERTIES,
  propertyEditorId: "patterns:fill-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of FILL_PROPERTIES) {
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

    // Parse properties
    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    let strategy: PatternStrategy = { type: "hatch", angle: 45, spacing: 8 };
    try {
      strategy = JSON.parse((properties.strategy as string) ?? "") as PatternStrategy;
    } catch { /* use default */ }

    let shading: ShadingFunction = { type: "uniform" };
    try {
      shading = JSON.parse((properties.shading as string) ?? '{"type":"uniform"}') as ShadingFunction;
    } catch { /* use uniform */ }

    let shadingAffects: ShadingAffect[] = ["density"];
    try {
      shadingAffects = JSON.parse((properties.shadingAffects as string) ?? '["density"]') as ShadingAffect[];
    } catch { /* use density */ }

    const color = (properties.color as string) ?? "#000000";
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const seed = (properties.seed as number) ?? 42;
    const layerOpacity = (properties.opacity as number) ?? 1;

    // Generate paths (cached)
    const cacheKey = makeCacheKey(properties, bounds);
    let generatedPaths: GeneratedPath[];

    const cachedPaths = _pathCache.get(cacheKey);
    if (cachedPaths) {
      generatedPaths = cachedPaths.paths;
    } else {
      generatedPaths = generatePatternPaths(strategy, region, shading, shadingAffects, bounds, seed);

      if (_pathCache.size > 50) {
        const firstKey = _pathCache.keys().next().value;
        if (firstKey !== undefined) _pathCache.delete(firstKey);
      }
      _pathCache.set(cacheKey, { key: cacheKey, paths: generatedPaths });
    }

    if (generatedPaths.length === 0) return;

    // Render with clipping
    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);
    renderPatternPaths(ctx, generatedPaths, { color, lineWidth, opacity: 1 });
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    for (const key of ["region", "strategy", "shading", "shadingAffects"] as const) {
      const val = properties[key];
      if (typeof val === "string" && val.trim() !== "") {
        try {
          JSON.parse(val);
        } catch {
          errors.push({ property: key, message: `${key} must be valid JSON` });
        }
      }
    }

    return errors.length > 0 ? errors : null;
  },
};
