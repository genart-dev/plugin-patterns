import type { PatternPreset, PatternStrategy } from "./types.js";

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

/** Look up a pattern preset by name. Returns undefined if not found. */
export function getPatternPreset(name: string): PatternPreset | undefined {
  return PATTERN_PRESETS[name];
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
