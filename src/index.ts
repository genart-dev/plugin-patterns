import type { DesignPlugin, PluginContext } from "@genart-dev/core";
import { fillLayerType } from "./layers/fill.js";
import { stripeLayerType } from "./layers/stripe.js";
import { dotLayerType } from "./layers/dot.js";
import { checkerLayerType } from "./layers/checker.js";
import { waveLayerType } from "./layers/wave.js";

const patternsPlugin: DesignPlugin = {
  id: "patterns",
  name: "Patterns",
  version: "0.1.0",
  tier: "free",
  description:
    "Geometric pattern fills and decorative tiling: hatch, crosshatch, stipple, stripe, dot, checker, wave.",

  layerTypes: [fillLayerType, stripeLayerType, dotLayerType, checkerLayerType, waveLayerType],
  tools: [],
  exportHandlers: [],
  mcpTools: [],

  async initialize(_context: PluginContext): Promise<void> {},
  dispose(): void {},
};

export default patternsPlugin;
export { fillLayerType } from "./layers/fill.js";
export { stripeLayerType } from "./layers/stripe.js";
export { dotLayerType } from "./layers/dot.js";
export { checkerLayerType } from "./layers/checker.js";
export { waveLayerType } from "./layers/wave.js";
export {
  type PatternRegion,
  type PatternStrategy,
  type PatternPreset,
  type ShadingFunction,
  type ShadingAffect,
  type GeneratedPath,
  type GeometricPreset,
  type StripePreset,
  type DotPreset,
  type CheckerPreset,
  type WavePreset,
} from "./core/types.js";
export {
  PATTERN_PRESETS,
  GEOMETRIC_PRESETS,
  getPatternPreset,
  getGeometricPreset,
  resolveStrategy,
} from "./core/presets.js";
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
