import { describe, it, expect } from "vitest";
import { PATTERN_PRESETS, GEOMETRIC_PRESETS, getPatternPreset, getGeometricPreset, resolveStrategy } from "../src/core/presets.js";
import type { PatternStrategy } from "../src/core/types.js";

describe("PATTERN_PRESETS", () => {
  it("has exactly 11 presets", () => {
    expect(Object.keys(PATTERN_PRESETS)).toHaveLength(11);
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
  it("has exactly 142 presets", () => {
    expect(Object.keys(GEOMETRIC_PRESETS)).toHaveLength(142);
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

  describe("crosshatch-geo presets (4)", () => {
    const names = ["fine-crosshatch", "bold-crosshatch", "diamond-mesh", "screen"];

    it("contains all crosshatch-geo presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:crosshatch-geo");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:crosshatch-geo") {
          expect(p.angle1).toBeGreaterThanOrEqual(0);
          expect(p.angle2).toBeGreaterThanOrEqual(0);
          expect(p.spacing).toBeGreaterThan(0);
          expect(p.lineWidth).toBeGreaterThan(0);
          expect(p.color).toBeTruthy();
          expect(p.backgroundColor).toBeTruthy();
        }
      }
    });
  });

  describe("herringbone presets (4)", () => {
    const names = ["classic-herringbone", "chevron", "twill", "parquet"];

    it("contains all herringbone presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:herringbone");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:herringbone") {
          expect(p.blockWidth).toBeGreaterThan(0);
          expect(p.blockHeight).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("tile presets (5)", () => {
    const names = ["brick", "basketweave", "hexagonal", "fish-scale", "moroccan"];

    it("contains all tile presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:tile");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:tile") {
          expect(p.tileShape).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });

    it("each tile preset has a valid tileShape", () => {
      const validShapes = ["brick", "basketweave", "hex", "scale", "moroccan", "ogee", "lantern", "basketweave-tight"];
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:tile") {
          expect(validShapes).toContain(p.tileShape);
        }
      }
    });
  });

  describe("triangle presets (6)", () => {
    const names = ["equilateral-grid", "pinwheel", "arrow-tessellation", "kaleidoscope", "inverted-triangles", "triangle-strip"];

    it("contains all triangle presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:triangle");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:triangle") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("diamond presets (5)", () => {
    const names = ["simple-diamond", "argyle", "nested-diamond", "adjointed-diamonds", "diamond-lattice"];

    it("contains all diamond presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:diamond");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:diamond") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });

    it("argyle has a third color", () => {
      const p = GEOMETRIC_PRESETS["argyle"]!;
      if (p.layerType === "patterns:diamond") {
        expect(p.color3).toBeTruthy();
      }
    });
  });

  describe("hexagon presets (5)", () => {
    const names = ["honeycomb", "interlocked-hex", "hex-flower", "hex-grid", "overlapping-hex"];

    it("contains all hexagon presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:hexagon");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:hexagon") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("star presets (5)", () => {
    const names = ["six-pointed", "eight-pointed", "plus-grid", "plus-offset", "star-lattice"];

    it("contains all star presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:star");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:star") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("circle presets (6)", () => {
    const names = ["concentric-rings", "overlapping-circles", "packed-circles", "semicircle-row", "quarter-turn", "bullseye"];

    it("contains all circle presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:circle");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:circle") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("japanese presets (6)", () => {
    const names = ["asanoha", "seigaiha", "shippo", "bishamon-kikko", "yagasuri", "kumiko"];

    it("contains all japanese presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:japanese");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:japanese") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("lattice presets (5)", () => {
    const names = ["greek-key", "chinese-fret", "double-meander", "chinese-window", "interlocking-fret"];

    it("contains all lattice presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:lattice");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:lattice") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("plaid presets (4)", () => {
    const names = ["tartan", "buffalo-plaid", "madras", "windowpane"];

    it("contains all plaid presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:plaid");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:plaid") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });

    it("tartan has a third color", () => {
      const p = GEOMETRIC_PRESETS["tartan"]!;
      if (p.layerType === "patterns:plaid") {
        expect(p.color3).toBeTruthy();
      }
    });
  });

  describe("cube presets (3)", () => {
    const names = ["isometric-cube", "stacked-cubes", "tumbling-blocks"];

    it("contains all cube presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:cube");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:cube") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.color3).toBeTruthy();
        }
      }
    });
  });

  describe("leaf presets (4)", () => {
    const names = ["simple-leaf", "fern-row", "tropical-scatter", "vine-trail"];

    it("contains all leaf presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:leaf");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:leaf") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.gap).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("floral presets (5)", () => {
    const names = ["daisy", "rosette", "cherry-blossom", "sunflower", "abstract-flower"];

    it("contains all floral presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:floral");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:floral") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.petalCount).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("memphis presets (4)", () => {
    const names = ["memphis-classic", "confetti-burst", "geometric-scatter", "squiggle-field"];

    it("contains all memphis presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:memphis");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:memphis") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.density).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("eye presets (4)", () => {
    const names = ["vesica-piscis", "evil-eye", "almond-lattice", "nested-eyes"];

    it("contains all eye presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:eye");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:eye") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("spiral presets (4)", () => {
    const names = ["tight-spiral", "scrollwork", "double-spiral", "batik-swirl"];

    it("contains all spiral presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:spiral");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:spiral") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("terrazzo presets (3)", () => {
    const names = ["terrazzo-classic", "terrazzo-bold", "blob-scatter"];

    it("contains all terrazzo presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:terrazzo");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:terrazzo") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("square presets (5)", () => {
    const names = ["nested-squares", "rotated-squares", "squares-and-stars", "squares-and-circles", "offset-squares"];

    it("contains all square presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:square");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:square") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.gap).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("octagon presets (2)", () => {
    const names = ["octagon-square", "octagon-outline"];

    it("contains all octagon presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:octagon");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:octagon") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("scale presets (4)", () => {
    const names = ["fishscale-classic", "scallop-shell", "overlapping-scales", "pointed-scales"];

    it("contains all scale presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:scale");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:scale") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("chainlink presets (3)", () => {
    const names = ["chainlink-fence", "chain-mail", "interlocking-rings"];

    it("contains all chainlink presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:chainlink");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:chainlink") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("ethnic presets (6)", () => {
    const names = ["tribal-zigzag", "african-kente", "egyptian-lotus", "mexican-step", "songket-diamond", "tribal-arrow"];

    it("contains all ethnic presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:ethnic");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:ethnic") {
          expect(p.style).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
          expect(p.lineWidth).toBeGreaterThan(0);
        }
      }
    });
  });

  // Batch 5 — expanded presets for existing types

  describe("wave expanded presets (4)", () => {
    const names = ["deep-wave", "nested-wave", "square-wave", "sawtooth-wave"];

    it("contains all wave expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:wave");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:wave") {
          expect(p.amplitude).toBeGreaterThan(0);
          expect(p.frequency).toBeGreaterThan(0);
          expect(p.lineWidth).toBeGreaterThan(0);
          expect(p.color).toBeTruthy();
          expect(p.spacing).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("herringbone expanded presets (3)", () => {
    const names = ["wide-chevron", "thin-chevron", "double-chevron"];

    it("contains all herringbone expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:herringbone");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:herringbone") {
          expect(p.blockWidth).toBeGreaterThan(0);
          expect(p.blockHeight).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("tile expanded presets (3)", () => {
    const names = ["ogee-tile", "lantern-tile", "basketweave-tight"];

    it("contains all tile expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:tile");
      }
    });

    it("all have required fields", () => {
      for (const name of names) {
        const p = GEOMETRIC_PRESETS[name]!;
        if (p.layerType === "patterns:tile") {
          expect(p.tileShape).toBeTruthy();
          expect(p.size).toBeGreaterThan(0);
          expect(p.color1).toBeTruthy();
          expect(p.color2).toBeTruthy();
        }
      }
    });
  });

  describe("stripe expanded presets (2)", () => {
    const names = ["railroad", "diagonal-stripe"];

    it("contains all stripe expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:stripe");
      }
    });
  });

  describe("crosshatch-geo expanded presets (2)", () => {
    const names = ["triple-crosshatch", "wide-mesh"];

    it("contains all crosshatch-geo expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:crosshatch-geo");
      }
    });
  });

  describe("checker expanded presets (2)", () => {
    const names = ["checkerboard-diagonal", "pixel-grid"];

    it("contains all checker expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:checker");
      }
    });
  });

  describe("dot expanded presets (2)", () => {
    const names = ["bubble", "ring-dot"];

    it("contains all dot expanded presets", () => {
      for (const name of names) {
        expect(GEOMETRIC_PRESETS[name]).toBeDefined();
        expect(GEOMETRIC_PRESETS[name]!.layerType).toBe("patterns:dot");
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
    expect(getGeometricPreset("equilateral-grid")).toBeDefined();
    expect(getGeometricPreset("argyle")).toBeDefined();
    expect(getGeometricPreset("honeycomb")).toBeDefined();
    expect(getGeometricPreset("six-pointed")).toBeDefined();
    expect(getGeometricPreset("concentric-rings")).toBeDefined();
    expect(getGeometricPreset("asanoha")).toBeDefined();
    expect(getGeometricPreset("greek-key")).toBeDefined();
    expect(getGeometricPreset("tartan")).toBeDefined();
    expect(getGeometricPreset("isometric-cube")).toBeDefined();
    expect(getGeometricPreset("simple-leaf")).toBeDefined();
    expect(getGeometricPreset("daisy")).toBeDefined();
    expect(getGeometricPreset("memphis-classic")).toBeDefined();
    expect(getGeometricPreset("vesica-piscis")).toBeDefined();
    expect(getGeometricPreset("tight-spiral")).toBeDefined();
    expect(getGeometricPreset("terrazzo-classic")).toBeDefined();
    expect(getGeometricPreset("nested-squares")).toBeDefined();
    expect(getGeometricPreset("octagon-square")).toBeDefined();
    expect(getGeometricPreset("fishscale-classic")).toBeDefined();
    expect(getGeometricPreset("chainlink-fence")).toBeDefined();
    expect(getGeometricPreset("tribal-zigzag")).toBeDefined();
    expect(getGeometricPreset("deep-wave")).toBeDefined();
    expect(getGeometricPreset("wide-chevron")).toBeDefined();
    expect(getGeometricPreset("ogee-tile")).toBeDefined();
    expect(getGeometricPreset("railroad")).toBeDefined();
    expect(getGeometricPreset("triple-crosshatch")).toBeDefined();
    expect(getGeometricPreset("checkerboard-diagonal")).toBeDefined();
    expect(getGeometricPreset("bubble")).toBeDefined();
  });

  it("returns undefined for unknown names", () => {
    expect(getGeometricPreset("nonexistent")).toBeUndefined();
    expect(getGeometricPreset("")).toBeUndefined();
  });
});
