import type {
  PatternPreset,
  PatternStrategy,
  GeometricPreset,
  StripePreset,
  DotPreset,
  CheckerPreset,
  WavePreset,
} from "./types.js";

/**
 * Built-in pattern presets for common illustration techniques.
 * Agents can use preset names as shorthand for strategy + render configuration.
 */
export const PATTERN_PRESETS: Record<string, PatternPreset> = {
  "hatch-light": {
    strategy: { type: "hatch", angle: 45, spacing: 12 },
    lineWidth: 2,
  },
  "hatch-medium": {
    strategy: { type: "hatch", angle: 45, spacing: 8 },
    lineWidth: 3,
  },
  "hatch-dense": {
    strategy: { type: "hatch", angle: 45, spacing: 4 },
    lineWidth: 2,
  },
  "crosshatch-light": {
    strategy: { type: "crosshatch", angles: [45, 135], spacing: 12, passDecay: 0.7 },
    lineWidth: 2,
  },
  "crosshatch-dense": {
    strategy: { type: "crosshatch", angles: [45, 135], spacing: 5, passDecay: 0.8 },
    lineWidth: 2,
  },
  "stipple-light": {
    strategy: { type: "stipple", density: 15, distribution: "poisson" },
    lineWidth: 2,
  },
  "stipple-dense": {
    strategy: { type: "stipple", density: 60, distribution: "poisson" },
    lineWidth: 2,
  },
  scumble: {
    strategy: { type: "scumble", density: 12, strokeLength: 25, curvature: 0.5 },
    lineWidth: 3,
  },
  contour: {
    strategy: { type: "contour", spacing: 6, smoothing: 0.3 },
    lineWidth: 2,
  },
};

// ---------------------------------------------------------------------------
// Geometric pattern presets (stripe, dot, checker, wave)
// ---------------------------------------------------------------------------

export const GEOMETRIC_PRESETS: Record<string, GeometricPreset> = {
  // Stripe presets (6)
  pinstripe: {
    layerType: "patterns:stripe",
    angle: 90,
    spacing: 12,
    lineWidth: 1,
    colors: ["#1a1a2e", "#f0f0f0"],
  },
  ticking: {
    layerType: "patterns:stripe",
    angle: 90,
    spacing: 20,
    lineWidth: 3,
    colors: ["#2c3e50", "#ecf0f1"],
  },
  awning: {
    layerType: "patterns:stripe",
    angle: 90,
    spacing: 30,
    lineWidth: 30,
    colors: ["#c0392b", "#ffffff"],
  },
  nautical: {
    layerType: "patterns:stripe",
    angle: 0,
    spacing: 16,
    lineWidth: 8,
    colors: ["#2c3e50", "#ffffff"],
  },
  candy: {
    layerType: "patterns:stripe",
    angle: 45,
    spacing: 14,
    lineWidth: 14,
    colors: ["#e74c3c", "#ffffff", "#e74c3c", "#ffffff"],
  },
  "barber-pole": {
    layerType: "patterns:stripe",
    angle: 30,
    spacing: 12,
    lineWidth: 12,
    colors: ["#e74c3c", "#ffffff", "#2980b9", "#ffffff"],
  },

  // Dot presets (6)
  "polka-small": {
    layerType: "patterns:dot",
    spacing: 20,
    radius: 4,
    offset: false,
    color: "#2c3e50",
    backgroundColor: "#ffffff",
  },
  "polka-large": {
    layerType: "patterns:dot",
    spacing: 40,
    radius: 12,
    offset: false,
    color: "#e74c3c",
    backgroundColor: "#ffffff",
  },
  halftone: {
    layerType: "patterns:dot",
    spacing: 8,
    radius: 3,
    offset: true,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  "hex-dot": {
    layerType: "patterns:dot",
    spacing: 24,
    radius: 6,
    offset: true,
    color: "#8e44ad",
    backgroundColor: "#f8f8f8",
  },
  confetti: {
    layerType: "patterns:dot",
    spacing: 16,
    radius: 3,
    offset: true,
    color: "#e67e22",
    backgroundColor: "#fdf2e9",
  },
  sprinkle: {
    layerType: "patterns:dot",
    spacing: 12,
    radius: 2,
    offset: false,
    color: "#27ae60",
    backgroundColor: "#eafaf1",
  },

  // Checker presets (5)
  "checker-small": {
    layerType: "patterns:checker",
    cellSize: 16,
    colors: ["#000000", "#ffffff"],
    angle: 0,
  },
  "checker-large": {
    layerType: "patterns:checker",
    cellSize: 48,
    colors: ["#000000", "#ffffff"],
    angle: 0,
  },
  gingham: {
    layerType: "patterns:checker",
    cellSize: 20,
    colors: ["#3498db", "#d6eaf8"],
    angle: 0,
  },
  "buffalo-check": {
    layerType: "patterns:checker",
    cellSize: 36,
    colors: ["#c0392b", "#1a1a1a"],
    angle: 0,
  },
  houndstooth: {
    layerType: "patterns:checker",
    cellSize: 12,
    colors: ["#2c3e50", "#ecf0f1"],
    angle: 45,
  },

  // Wave presets (5)
  "gentle-wave": {
    layerType: "patterns:wave",
    amplitude: 12,
    frequency: 2,
    phase: 0,
    lineWidth: 2,
    waveform: "sine",
    color: "#2980b9",
    spacing: 30,
  },
  choppy: {
    layerType: "patterns:wave",
    amplitude: 8,
    frequency: 8,
    phase: 0,
    lineWidth: 1.5,
    waveform: "sine",
    color: "#2c3e50",
    spacing: 20,
  },
  zigzag: {
    layerType: "patterns:wave",
    amplitude: 10,
    frequency: 6,
    phase: 0,
    lineWidth: 2,
    waveform: "triangle",
    color: "#e74c3c",
    spacing: 25,
  },
  scallop: {
    layerType: "patterns:wave",
    amplitude: 15,
    frequency: 4,
    phase: 0,
    lineWidth: 2,
    waveform: "sine",
    color: "#16a085",
    spacing: 32,
  },
  ogee: {
    layerType: "patterns:wave",
    amplitude: 20,
    frequency: 2,
    phase: 0,
    lineWidth: 3,
    waveform: "sine",
    color: "#8e44ad",
    spacing: 45,
  },
};

/** Look up a pattern preset by name. Returns undefined if not found. */
export function getPatternPreset(name: string): PatternPreset | undefined {
  return PATTERN_PRESETS[name];
}

/** Look up a geometric preset by name. Returns undefined if not found. */
export function getGeometricPreset(name: string): GeometricPreset | undefined {
  return GEOMETRIC_PRESETS[name];
}

/**
 * Resolve a strategy value: if it's a string preset name, expand it.
 * Otherwise return as-is. Returns null if the preset name is unknown.
 */
export function resolveStrategy(
  strategyOrPreset: PatternStrategy | string,
): { strategy: PatternStrategy; lineWidth?: number } | null {
  if (typeof strategyOrPreset === "string") {
    const preset = PATTERN_PRESETS[strategyOrPreset];
    if (!preset) return null;
    return { strategy: preset.strategy, lineWidth: preset.lineWidth };
  }
  return { strategy: strategyOrPreset };
}
