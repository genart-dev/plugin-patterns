import { describe, it, expect } from "vitest";
import { PATTERN_PRESETS, GEOMETRIC_PRESETS, getPatternPreset, getGeometricPreset, resolveStrategy } from "../src/core/presets.js";
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

// ---------------------------------------------------------------------------
// Geometric presets
// ---------------------------------------------------------------------------

describe("GEOMETRIC_PRESETS", () => {
  it("has exactly 22 presets", () => {
    expect(Object.keys(GEOMETRIC_PRESETS)).toHaveLength(22);
  });

  describe("stripe presets (6)", () => {
    const stripeNames = ["pinstripe", "ticking", "awning", "nautical", "candy", "barber-pole"];

    it("contains all stripe presets", () => {
      for (const name of stripeNames) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:stripe");
      }
    });

    it("all stripe presets have required fields", () => {
      for (const name of stripeNames) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:stripe") {
          expect(p.angle).toBeGreaterThanOrEqual(0);
          expect(p.spacing).toBeGreaterThan(0);
          expect(p.lineWidth).toBeGreaterThan(0);
          expect(p.colors.length).toBeGreaterThanOrEqual(2);
        }
      }
    });
  });

  describe("dot presets (6)", () => {
    const dotNames = ["polka-small", "polka-large", "halftone", "hex-dot", "confetti", "sprinkle"];

    it("contains all dot presets", () => {
      for (const name of dotNames) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:dot");
      }
    });

    it("all dot presets have required fields", () => {
      for (const name of dotNames) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:dot") {
          expect(p.spacing).toBeGreaterThan(0);
          expect(p.radius).toBeGreaterThan(0);
          expect(typeof p.offset).toBe("boolean");
          expect(p.color).toBeTruthy();
          expect(p.backgroundColor).toBeTruthy();
        }
      }
    });

    it("polka-large has larger radius than polka-small", () => {
      const small = GEOMETRIC_PRESETS["polka-small"]!;
      const large = GEOMETRIC_PRESETS["polka-large"]!;
      if (small.layerType === "patterns:dot" && large.layerType === "patterns:dot") {
        expect(large.radius).toBeGreaterThan(small.radius);
      }
    });

    it("halftone uses hex offset", () => {
      const p = GEOMETRIC_PRESETS["halftone"]!;
      if (p.layerType === "patterns:dot") {
        expect(p.offset).toBe(true);
      }
    });
  });

  describe("checker presets (5)", () => {
    const checkerNames = ["checker-small", "checker-large", "gingham", "buffalo-check", "houndstooth"];

    it("contains all checker presets", () => {
      for (const name of checkerNames) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:checker");
      }
    });

    it("all checker presets have required fields", () => {
      for (const name of checkerNames) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:checker") {
          expect(p.cellSize).toBeGreaterThan(0);
          expect(p.colors.length).toBeGreaterThanOrEqual(2);
          expect(p.angle).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("checker-large has larger cellSize than checker-small", () => {
      const small = GEOMETRIC_PRESETS["checker-small"]!;
      const large = GEOMETRIC_PRESETS["checker-large"]!;
      if (small.layerType === "patterns:checker" && large.layerType === "patterns:checker") {
        expect(large.cellSize).toBeGreaterThan(small.cellSize);
      }
    });
  });

  describe("wave presets (5)", () => {
    const waveNames = ["gentle-wave", "choppy", "zigzag", "scallop", "ogee"];

    it("contains all wave presets", () => {
      for (const name of waveNames) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:wave");
      }
    });

    it("all wave presets have required fields", () => {
      for (const name of waveNames) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:wave") {
          expect(p.amplitude).toBeGreaterThan(0);
          expect(p.frequency).toBeGreaterThan(0);
          expect(p.lineWidth).toBeGreaterThan(0);
          expect(["sine", "triangle", "square", "sawtooth"]).toContain(p.waveform);
          expect(p.color).toBeTruthy();
          expect(p.spacing).toBeGreaterThan(0);
        }
      }
    });

    it("zigzag uses triangle waveform", () => {
      const p = GEOMETRIC_PRESETS["zigzag"]!;
      if (p.layerType === "patterns:wave") {
        expect(p.waveform).toBe("triangle");
      }
    });
  });
});

describe("getGeometricPreset", () => {
  it("returns preset for known names", () => {
    expect(getGeometricPreset("pinstripe")).toBeDefined();
    expect(getGeometricPreset("halftone")).toBeDefined();
    expect(getGeometricPreset("gingham")).toBeDefined();
    expect(getGeometricPreset("zigzag")).toBeDefined();
  });

  it("returns undefined for unknown names", () => {
    expect(getGeometricPreset("nonexistent")).toBeUndefined();
    expect(getGeometricPreset("")).toBeUndefined();
  });
});
