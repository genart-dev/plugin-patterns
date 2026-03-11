import { describe, it, expect } from "vitest";
import { PATTERN_PRESETS, getPatternPreset, resolveStrategy } from "../src/core/presets.js";
import type { PatternStrategy } from "../src/core/types.js";

describe("PATTERN_PRESETS", () => {
  it("has exactly 9 presets", () => {
    expect(Object.keys(PATTERN_PRESETS)).toHaveLength(9);
  });

  it("contains all documented preset names", () => {
    const expected = [
      "hatch-light", "hatch-medium", "hatch-dense",
      "crosshatch-light", "crosshatch-dense",
      "stipple-light", "stipple-dense",
      "scumble", "contour",
    ];
    for (const name of expected) {
      expect(PATTERN_PRESETS[name]).toBeDefined();
    }
  });

  describe("hatch presets", () => {
    it("hatch-light has correct parameters", () => {
      const p = PATTERN_PRESETS["hatch-light"]!;
      expect(p.strategy.type).toBe("hatch");
      if (p.strategy.type === "hatch") {
        expect(p.strategy.angle).toBe(45);
        expect(p.strategy.spacing).toBe(12);
      }
      expect(p.lineWidth).toBe(2);
    });

    it("hatch-medium has tighter spacing than hatch-light", () => {
      const light = PATTERN_PRESETS["hatch-light"]!.strategy as { spacing: number };
      const medium = PATTERN_PRESETS["hatch-medium"]!.strategy as { spacing: number };
      expect(medium.spacing).toBeLessThan(light.spacing);
    });

    it("hatch-dense has tightest spacing", () => {
      const medium = PATTERN_PRESETS["hatch-medium"]!.strategy as { spacing: number };
      const dense = PATTERN_PRESETS["hatch-dense"]!.strategy as { spacing: number };
      expect(dense.spacing).toBeLessThan(medium.spacing);
    });
  });

  describe("crosshatch presets", () => {
    it("crosshatch-light has two angles", () => {
      const p = PATTERN_PRESETS["crosshatch-light"]!;
      expect(p.strategy.type).toBe("crosshatch");
      if (p.strategy.type === "crosshatch") {
        expect(p.strategy.angles).toHaveLength(2);
        expect(p.strategy.passDecay).toBeGreaterThan(0);
        expect(p.strategy.passDecay).toBeLessThanOrEqual(1);
      }
    });

    it("crosshatch-dense has tighter spacing than crosshatch-light", () => {
      const light = PATTERN_PRESETS["crosshatch-light"]!.strategy as { spacing: number };
      const dense = PATTERN_PRESETS["crosshatch-dense"]!.strategy as { spacing: number };
      expect(dense.spacing).toBeLessThan(light.spacing);
    });
  });

  describe("stipple presets", () => {
    it("stipple-light has lower density than stipple-dense", () => {
      const light = PATTERN_PRESETS["stipple-light"]!.strategy as { density: number };
      const dense = PATTERN_PRESETS["stipple-dense"]!.strategy as { density: number };
      expect(light.density).toBeLessThan(dense.density);
    });

    it("stipple-light uses poisson distribution", () => {
      const p = PATTERN_PRESETS["stipple-light"]!;
      if (p.strategy.type === "stipple") {
        expect(p.strategy.distribution).toBe("poisson");
      }
    });
  });

  describe("scumble preset", () => {
    it("scumble has positive density, strokeLength, and curvature", () => {
      const p = PATTERN_PRESETS["scumble"]!;
      expect(p.strategy.type).toBe("scumble");
      if (p.strategy.type === "scumble") {
        expect(p.strategy.density).toBeGreaterThan(0);
        expect(p.strategy.strokeLength).toBeGreaterThan(0);
        expect(p.strategy.curvature).toBeGreaterThanOrEqual(0);
        expect(p.strategy.curvature).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("contour preset", () => {
    it("contour has positive spacing and smoothing in [0,1]", () => {
      const p = PATTERN_PRESETS["contour"]!;
      expect(p.strategy.type).toBe("contour");
      if (p.strategy.type === "contour") {
        expect(p.strategy.spacing).toBeGreaterThan(0);
        expect(p.strategy.smoothing).toBeGreaterThanOrEqual(0);
        expect(p.strategy.smoothing).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe("getPatternPreset", () => {
  it("returns preset for known names", () => {
    expect(getPatternPreset("hatch-medium")).toBeDefined();
    expect(getPatternPreset("contour")).toBeDefined();
  });

  it("returns undefined for unknown names", () => {
    expect(getPatternPreset("nonexistent")).toBeUndefined();
    expect(getPatternPreset("")).toBeUndefined();
  });
});

describe("resolveStrategy", () => {
  it("resolves a preset string to its strategy", () => {
    const result = resolveStrategy("hatch-medium");
    expect(result).not.toBeNull();
    expect(result!.strategy.type).toBe("hatch");
    expect(result!.lineWidth).toBe(3);
  });

  it("returns null for unknown preset name", () => {
    expect(resolveStrategy("not-a-preset")).toBeNull();
  });

  it("passes through a PatternStrategy object unchanged", () => {
    const strategy: PatternStrategy = { type: "stipple", density: 50, distribution: "random" };
    const result = resolveStrategy(strategy);
    expect(result).not.toBeNull();
    expect(result!.strategy).toEqual(strategy);
    expect(result!.lineWidth).toBeUndefined();
  });

  it("returns no lineWidth when resolving a raw strategy object", () => {
    const strategy: PatternStrategy = { type: "contour", spacing: 10, smoothing: 0.2 };
    const result = resolveStrategy(strategy);
    expect(result!.lineWidth).toBeUndefined();
  });
});
