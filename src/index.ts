import type { DesignPlugin, PluginContext } from "@genart-dev/core";
import { fillLayerType } from "./layers/fill.js";

const patternsPlugin: DesignPlugin = {
  id: "patterns",
  name: "Patterns",
  version: "0.1.0",
  tier: "free",
  description:
    "Geometric pattern fills and decorative tiling: hatch, crosshatch, stipple, scumble, contour.",

  layerTypes: [fillLayerType],
  tools: [],
  exportHandlers: [],
  mcpTools: [],

  async initialize(_context: PluginContext): Promise<void> {},
  dispose(): void {},
};

export default patternsPlugin;
export { fillLayerType } from "./layers/fill.js";
export {
  type PatternRegion,
  type PatternStrategy,
  type PatternPreset,
  type ShadingFunction,
  type ShadingAffect,
  type GeneratedPath,
} from "./core/types.js";
export { PATTERN_PRESETS, getPatternPreset, resolveStrategy } from "./core/presets.js";
export { generatePatternPaths } from "./core/generators.js";
export { renderPatternPaths } from "./core/renderer.js";
export {
  regionBounds,
  pointInRegion,
  applyRegionClip,
  regionToPolygon,
  offsetPolygon,
} from "./core/region-utils.js";
export { buildShadingEvaluator, applyShadingToPath } from "./core/shading.js";
