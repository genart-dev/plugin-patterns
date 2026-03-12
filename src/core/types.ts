/**
 * Types for the patterns:fill layer system (extracted from plugin-painting ADR 034).
 *
 * A PatternRegion defines where marks are generated and clipped.
 * A PatternStrategy determines what kind of marks are generated.
 * A ShadingFunction controls how density/weight/opacity vary spatially.
 */

// ---------------------------------------------------------------------------
// Region
// ---------------------------------------------------------------------------

export type PatternRegion =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { type: "polygon"; points: Array<{ x: number; y: number }> }
  | { type: "bounds" };

// ---------------------------------------------------------------------------
// Fill strategies
// ---------------------------------------------------------------------------

export interface HatchFill {
  type: "hatch";
  /** Line angle in degrees. 0 = horizontal, 90 = vertical. Default 45 */
  angle: number;
  /** Distance between lines in px. Default 8 */
  spacing: number;
}

export interface CrosshatchFill {
  type: "crosshatch";
  /** Array of angles for each hatch pass. Default [45, 135] */
  angles: number[];
  /** Distance between lines per pass. Default 8 */
  spacing: number;
  /**
   * Opacity multiplier per successive pass. Default 0.7
   * Pass 0 = full opacity, pass 1 = 0.7×, pass 2 = 0.49×, etc.
   */
  passDecay: number;
}

export interface StippleFill {
  type: "stipple";
  /** Average dots per 100×100px area at full density. Default 40 */
  density: number;
  /** Point distribution algorithm */
  distribution: "random" | "poisson" | "jittered-grid";
}

export interface ScumbleFill {
  type: "scumble";
  /** Average strokes per 100×100px area at full density. Default 15 */
  density: number;
  /** Stroke length in px. Default 20 */
  strokeLength: number;
  /** Curvature: 0 = straight, 1 = tight curls. Default 0.5 */
  curvature: number;
}

export interface ContourFill {
  type: "contour";
  /** Distance between contour rings in px. Default 8 */
  spacing: number;
  /** Max inward offset rings. Default: fill until too small */
  maxRings?: number;
  /** Smoothing applied to offset contours. 0–1, default 0.3 */
  smoothing: number;
}

export type PatternStrategy =
  | HatchFill
  | CrosshatchFill
  | StippleFill
  | ScumbleFill
  | ContourFill;

/** Preset name shorthand that expands to a full PatternStrategy + render overrides. */
export interface PatternPreset {
  strategy: PatternStrategy;
  /** Line width for the pattern renderer. */
  lineWidth: number;
}

// ---------------------------------------------------------------------------
// Geometric pattern presets (stripe, dot, checker, wave)
// ---------------------------------------------------------------------------

/** Preset for patterns:stripe layer type. */
export interface StripePreset {
  layerType: "patterns:stripe";
  angle: number;
  spacing: number;
  lineWidth: number;
  colors: string[];
  dashPattern?: number[];
}

/** Preset for patterns:dot layer type. */
export interface DotPreset {
  layerType: "patterns:dot";
  spacing: number;
  radius: number;
  offset: boolean;
  color: string;
  backgroundColor: string;
}

/** Preset for patterns:checker layer type. */
export interface CheckerPreset {
  layerType: "patterns:checker";
  cellSize: number;
  colors: string[];
  angle: number;
}

/** Preset for patterns:wave layer type. */
export interface WavePreset {
  layerType: "patterns:wave";
  amplitude: number;
  frequency: number;
  phase: number;
  lineWidth: number;
  waveform: "sine" | "triangle" | "square" | "sawtooth";
  color: string;
  spacing: number;
}

/** Preset for patterns:crosshatch-geo layer type. */
export interface CrosshatchGeoPreset {
  layerType: "patterns:crosshatch-geo";
  angle1: number;
  angle2: number;
  spacing: number;
  lineWidth: number;
  color: string;
  backgroundColor: string;
}

/** Preset for patterns:herringbone layer type. */
export interface HerringbonePreset {
  layerType: "patterns:herringbone";
  blockWidth: number;
  blockHeight: number;
  angle: number;
  color1: string;
  color2: string;
  gap?: number;
}

/** Preset for patterns:tile layer type. */
export interface TilePreset {
  layerType: "patterns:tile";
  tileShape: "brick" | "basketweave" | "hex" | "scale" | "moroccan" | "ogee" | "lantern" | "basketweave-tight";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:triangle layer type. */
export interface TrianglePreset {
  layerType: "patterns:triangle";
  style: "equilateral" | "pinwheel" | "arrow" | "kaleidoscope" | "inverted" | "strip";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:diamond layer type. */
export interface DiamondPreset {
  layerType: "patterns:diamond";
  style: "simple" | "argyle" | "nested" | "adjointed" | "lattice";
  size: number;
  color1: string;
  color2: string;
  color3?: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:hexagon layer type. */
export interface HexagonPreset {
  layerType: "patterns:hexagon";
  style: "honeycomb" | "interlocked" | "flower" | "grid" | "overlapping";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:star layer type. */
export interface StarPreset {
  layerType: "patterns:star";
  style: "six-pointed" | "eight-pointed" | "plus-grid" | "plus-offset" | "lattice";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:circle layer type. */
export interface CirclePreset {
  layerType: "patterns:circle";
  style: "concentric" | "overlapping" | "packed" | "semicircle" | "quarter-turn" | "bullseye";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:japanese layer type. */
export interface JapanesePreset {
  layerType: "patterns:japanese";
  style: "asanoha" | "seigaiha" | "shippo" | "bishamon-kikko" | "yagasuri" | "kumiko";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  rotation?: number;
}

/** Preset for patterns:lattice layer type. */
export interface LatticePreset {
  layerType: "patterns:lattice";
  style: "greek-key" | "chinese-fret" | "double-meander" | "chinese-window" | "interlocking-fret";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  rotation?: number;
}

/** Preset for patterns:plaid layer type. */
export interface PlaidPreset {
  layerType: "patterns:plaid";
  style: "tartan" | "buffalo-plaid" | "madras" | "windowpane";
  size: number;
  color1: string;
  color2: string;
  color3?: string;
  rotation?: number;
}

/** Preset for patterns:cube layer type. */
export interface CubePreset {
  layerType: "patterns:cube";
  style: "isometric" | "stacked" | "tumbling-blocks";
  size: number;
  color1: string;
  color2: string;
  color3: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:leaf layer type. */
export interface LeafPreset {
  layerType: "patterns:leaf";
  style: "simple-leaf" | "fern-row" | "tropical-scatter" | "vine-trail";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:floral layer type. */
export interface FloralPreset {
  layerType: "patterns:floral";
  style: "daisy" | "rosette" | "cherry-blossom" | "sunflower" | "abstract-flower";
  size: number;
  color1: string;
  color2: string;
  petalCount?: number;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:memphis layer type. */
export interface MemphisPreset {
  layerType: "patterns:memphis";
  style: "classic" | "confetti" | "geometric" | "squiggle";
  size: number;
  color1: string;
  color2: string;
  color3?: string;
  density?: number;
  rotation?: number;
}

/** Preset for patterns:eye layer type. */
export interface EyePreset {
  layerType: "patterns:eye";
  style: "vesica" | "pointed" | "almond" | "double";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:spiral layer type. */
export interface SpiralPreset {
  layerType: "patterns:spiral";
  style: "archimedean" | "logarithmic" | "scroll" | "double";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:terrazzo layer type. */
export interface TerrazzoPreset {
  layerType: "patterns:terrazzo";
  style: "classic" | "bold" | "blob";
  size: number;
  color1: string;
  color2: string;
  color3?: string;
  density?: number;
  rotation?: number;
}

/** Preset for patterns:square layer type. */
export interface SquarePreset {
  layerType: "patterns:square";
  style: "nested" | "rotated" | "offset" | "stars-and-squares" | "circles-and-squares";
  size: number;
  color1: string;
  color2: string;
  color3?: string;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:octagon layer type. */
export interface OctagonPreset {
  layerType: "patterns:octagon";
  style: "octagon-square" | "outline";
  size: number;
  color1: string;
  color2: string;
  gap?: number;
  lineWidth?: number;
  rotation?: number;
}

/** Preset for patterns:scale layer type. */
export interface ScalePreset {
  layerType: "patterns:scale";
  style: "fishscale" | "scallop" | "overlapping" | "pointed";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  rotation?: number;
}

/** Preset for patterns:chainlink layer type. */
export interface ChainlinkPreset {
  layerType: "patterns:chainlink";
  style: "circle" | "oval" | "double";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  gap?: number;
  rotation?: number;
}

/** Preset for patterns:ethnic layer type. */
export interface EthnicPreset {
  layerType: "patterns:ethnic";
  style: "tribal-zigzag" | "african-kente" | "egyptian-lotus" | "mexican-step" | "songket-diamond" | "tribal-arrow";
  size: number;
  color1: string;
  color2: string;
  lineWidth?: number;
  rotation?: number;
}

export type GeometricPreset =
  | StripePreset
  | DotPreset
  | CheckerPreset
  | WavePreset
  | CrosshatchGeoPreset
  | HerringbonePreset
  | TilePreset
  | TrianglePreset
  | DiamondPreset
  | HexagonPreset
  | StarPreset
  | CirclePreset
  | JapanesePreset
  | LatticePreset
  | PlaidPreset
  | CubePreset
  | LeafPreset
  | FloralPreset
  | MemphisPreset
  | EyePreset
  | SpiralPreset
  | TerrazzoPreset
  | SquarePreset
  | OctagonPreset
  | ScalePreset
  | ChainlinkPreset
  | EthnicPreset;

// ---------------------------------------------------------------------------
// Shading
// ---------------------------------------------------------------------------

export type ShadingFunction =
  | { type: "uniform" }
  | { type: "linear"; angle: number; range: [number, number] }
  | { type: "radial"; cx: number; cy: number; range: [number, number] }
  | { type: "noise"; seed: number; scale: number; range: [number, number] }
  | { type: "algorithm"; channel: string; range: [number, number] };

export type ShadingAffect = "density" | "weight" | "opacity";

// ---------------------------------------------------------------------------
// Generated path (internal)
// ---------------------------------------------------------------------------

/** A generated path ready to be rendered. */
export interface GeneratedPath {
  points: Array<{ x: number; y: number }>;
  /** Per-path opacity modifier from shading. 1.0 = no modification. */
  opacityScale: number;
  /** Per-path size modifier from shading. 1.0 = no modification. */
  sizeScale: number;
}

// ---------------------------------------------------------------------------
// Custom pattern system (Track C)
// ---------------------------------------------------------------------------

/** A drawing command for the custom pattern unit cell. */
export type DrawCommand =
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; lineWidth?: number }
  | { type: "circle"; cx: number; cy: number; r: number; fill?: boolean; stroke?: boolean; lineWidth?: number }
  | { type: "rect"; x: number; y: number; width: number; height: number; fill?: boolean; stroke?: boolean; lineWidth?: number }
  | { type: "arc"; cx: number; cy: number; r: number; startAngle: number; endAngle: number; lineWidth?: number }
  | { type: "path"; points: Array<{ x: number; y: number }>; closed?: boolean; fill?: boolean; lineWidth?: number }
  | { type: "polygon"; points: Array<{ x: number; y: number }>; fill?: boolean; stroke?: boolean; lineWidth?: number };

/** Definition for a custom repeating pattern. */
export interface CustomPatternDef {
  id: string;
  name: string;
  /** Unit cell width in local coordinates. */
  width: number;
  /** Unit cell height in local coordinates. */
  height: number;
  /** Drawing commands that define the unit cell. Max 200 commands, ~10KB limit. */
  commands: DrawCommand[];
}
