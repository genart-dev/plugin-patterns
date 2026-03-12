import type { DesignPlugin, PluginContext } from "@genart-dev/core";
import { fillLayerType } from "./layers/fill.js";
import { stripeLayerType } from "./layers/stripe.js";
import { dotLayerType } from "./layers/dot.js";
import { checkerLayerType } from "./layers/checker.js";
import { waveLayerType } from "./layers/wave.js";
import { crosshatchGeoLayerType } from "./layers/crosshatch-geo.js";
import { herringboneLayerType } from "./layers/herringbone.js";
import { tileLayerType } from "./layers/tile.js";
import { customLayerType } from "./layers/custom.js";
import { triangleLayerType } from "./layers/triangle.js";
import { diamondLayerType } from "./layers/diamond.js";
import { hexagonLayerType } from "./layers/hexagon.js";
import { starLayerType } from "./layers/star.js";
import { circleLayerType } from "./layers/circle.js";
import { japaneseLayerType } from "./layers/japanese.js";
import { latticeLayerType } from "./layers/lattice.js";
import { plaidLayerType } from "./layers/plaid.js";
import { cubeLayerType } from "./layers/cube.js";
import { leafLayerType } from "./layers/leaf.js";
import { floralLayerType } from "./layers/floral.js";
import { memphisLayerType } from "./layers/memphis.js";
import { eyeLayerType } from "./layers/eye.js";
import { spiralLayerType } from "./layers/spiral.js";
import { terrazzoLayerType } from "./layers/terrazzo.js";
import { squareLayerType } from "./layers/square.js";
import { octagonLayerType } from "./layers/octagon.js";
import { scaleLayerType } from "./layers/scale.js";
import { chainlinkLayerType } from "./layers/chainlink.js";
import { ethnicLayerType } from "./layers/ethnic.js";
import { patternMcpTools } from "./pattern-tools.js";

const patternsPlugin: DesignPlugin = {
  id: "patterns",
  name: "Patterns",
  version: "0.2.0",
  tier: "free",
  description:
    "Geometric pattern fills and decorative tiling: hatch, crosshatch, stipple, stripe, dot, checker, wave, herringbone, tile, triangle, diamond, hexagon, star, circle, japanese, lattice, plaid, cube, leaf, floral, memphis, eye, spiral, terrazzo, square, octagon, scale, chainlink, ethnic, and custom patterns.",

  layerTypes: [
    fillLayerType,
    stripeLayerType,
    dotLayerType,
    checkerLayerType,
    waveLayerType,
    crosshatchGeoLayerType,
    herringboneLayerType,
    tileLayerType,
    customLayerType,
    triangleLayerType,
    diamondLayerType,
    hexagonLayerType,
    starLayerType,
    circleLayerType,
    japaneseLayerType,
    latticeLayerType,
    plaidLayerType,
    cubeLayerType,
    leafLayerType,
    floralLayerType,
    memphisLayerType,
    eyeLayerType,
    spiralLayerType,
    terrazzoLayerType,
    squareLayerType,
    octagonLayerType,
    scaleLayerType,
    chainlinkLayerType,
    ethnicLayerType,
  ],
  tools: [],
  exportHandlers: [],
  mcpTools: patternMcpTools,

  async initialize(_context: PluginContext): Promise<void> {},
  dispose(): void {},
};

export default patternsPlugin;
export { fillLayerType } from "./layers/fill.js";
export { stripeLayerType } from "./layers/stripe.js";
export { dotLayerType } from "./layers/dot.js";
export { checkerLayerType } from "./layers/checker.js";
export { waveLayerType } from "./layers/wave.js";
export { crosshatchGeoLayerType } from "./layers/crosshatch-geo.js";
export { herringboneLayerType } from "./layers/herringbone.js";
export { tileLayerType } from "./layers/tile.js";
export { customLayerType } from "./layers/custom.js";
export { triangleLayerType } from "./layers/triangle.js";
export { diamondLayerType } from "./layers/diamond.js";
export { hexagonLayerType } from "./layers/hexagon.js";
export { starLayerType } from "./layers/star.js";
export { circleLayerType } from "./layers/circle.js";
export { japaneseLayerType } from "./layers/japanese.js";
export { latticeLayerType } from "./layers/lattice.js";
export { plaidLayerType } from "./layers/plaid.js";
export { cubeLayerType } from "./layers/cube.js";
export { leafLayerType } from "./layers/leaf.js";
export { floralLayerType } from "./layers/floral.js";
export { memphisLayerType } from "./layers/memphis.js";
export { eyeLayerType } from "./layers/eye.js";
export { spiralLayerType } from "./layers/spiral.js";
export { terrazzoLayerType } from "./layers/terrazzo.js";
export { squareLayerType } from "./layers/square.js";
export { octagonLayerType } from "./layers/octagon.js";
export { scaleLayerType } from "./layers/scale.js";
export { chainlinkLayerType } from "./layers/chainlink.js";
export { ethnicLayerType } from "./layers/ethnic.js";
export { patternMcpTools } from "./pattern-tools.js";
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
  type CrosshatchGeoPreset,
  type HerringbonePreset,
  type TilePreset,
  type TrianglePreset,
  type DiamondPreset,
  type HexagonPreset,
  type StarPreset,
  type CirclePreset,
  type JapanesePreset,
  type LatticePreset,
  type PlaidPreset,
  type CubePreset,
  type LeafPreset,
  type FloralPreset,
  type MemphisPreset,
  type EyePreset,
  type SpiralPreset,
  type TerrazzoPreset,
  type SquarePreset,
  type OctagonPreset,
  type ScalePreset,
  type ChainlinkPreset,
  type EthnicPreset,
  type CustomPatternDef,
  type DrawCommand,
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
