import { describe, it, expect, vi } from "vitest";
import { fillLayerType } from "../src/layers/fill.js";

// ---------------------------------------------------------------------------
// Canvas mock
// ---------------------------------------------------------------------------

function createMockCtx(width = 400, height = 300) {
  const ctx: Record<string, unknown> = {
    canvas: { width, height },
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    lineWidth: 1,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineCap: "butt",
    lineJoin: "miter",
    save: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
  };

  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300 };

// ---------------------------------------------------------------------------
// fillLayerType
// ---------------------------------------------------------------------------

describe("fillLayerType", () => {
  it("has typeId 'patterns:fill'", () => {
    expect(fillLayerType.typeId).toBe("patterns:fill");
  });

  it("has category 'draw'", () => {
    expect(fillLayerType.category).toBe("draw");
  });

  it("has displayName 'Pattern Fill'", () => {
    expect(fillLayerType.displayName).toBe("Pattern Fill");
  });

  describe("createDefault", () => {
    it("returns all expected property keys with correct defaults", () => {
      const d = fillLayerType.createDefault();
      expect(d.color).toBe("#000000");
      expect(d.lineWidth).toBe(2);
      expect(d.seed).toBe(42);
      expect(d.opacity).toBe(1);
      expect(JSON.parse(d.region as string)).toEqual({ type: "bounds" });
      expect(JSON.parse(d.strategy as string).type).toBe("hatch");
      expect(JSON.parse(d.shading as string)).toEqual({ type: "uniform" });
      expect(JSON.parse(d.shadingAffects as string)).toEqual(["density"]);
    });

    it("returns new object each call", () => {
      const a = fillLayerType.createDefault();
      const b = fillLayerType.createDefault();
      expect(a).not.toBe(b);
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      const d = fillLayerType.createDefault();
      expect(fillLayerType.validate!(d)).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = fillLayerType.createDefault();
      d.region = "not json{";
      const errors = fillLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid strategy JSON", () => {
      const d = fillLayerType.createDefault();
      d.strategy = "{bad}";
      const errors = fillLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("strategy");
    });

    it("returns error for invalid shading JSON", () => {
      const d = fillLayerType.createDefault();
      d.shading = "not-json";
      const errors = fillLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("shading");
    });

    it("returns multiple errors for multiple invalid fields", () => {
      const d = fillLayerType.createDefault();
      d.region = "bad";
      d.strategy = "bad";
      const errors = fillLayerType.validate!(d);
      expect(errors!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        fillLayerType.render(fillLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls ctx.save and ctx.restore", () => {
      const ctx = createMockCtx();
      fillLayerType.render(fillLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("renders all strategy types without throwing", () => {
      const strategies = [
        '{"type":"hatch","angle":45,"spacing":10}',
        '{"type":"crosshatch","angles":[45,135],"spacing":10,"passDecay":0.7}',
        '{"type":"stipple","density":20,"distribution":"random"}',
        '{"type":"scumble","density":10,"strokeLength":15,"curvature":0.4}',
        '{"type":"contour","spacing":10,"smoothing":0.2}',
      ];
      for (const strategy of strategies) {
        const ctx = createMockCtx();
        const props = { ...fillLayerType.createDefault(), strategy };
        expect(() => {
          fillLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      }
    });

    it("renders all region types without throwing", () => {
      const regions = [
        '{"type":"bounds"}',
        '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
        '{"type":"ellipse","cx":200,"cy":150,"rx":80,"ry":60}',
        '{"type":"polygon","points":[{"x":50,"y":50},{"x":300,"y":50},{"x":300,"y":250},{"x":50,"y":250}]}',
      ];
      for (const region of regions) {
        const ctx = createMockCtx();
        const props = { ...fillLayerType.createDefault(), region };
        expect(() => {
          fillLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      }
    });

    it("renders all shading types without throwing", () => {
      const shadings = [
        '{"type":"uniform"}',
        '{"type":"linear","angle":45,"range":[0.2,1.0]}',
        '{"type":"radial","cx":0.5,"cy":0.5,"range":[0.0,1.0]}',
        '{"type":"noise","seed":0,"scale":1,"range":[0.3,1.0]}',
      ];
      for (const shading of shadings) {
        const ctx = createMockCtx();
        const props = { ...fillLayerType.createDefault(), shading };
        expect(() => {
          fillLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      }
    });

    it("handles malformed JSON properties gracefully (no throw)", () => {
      const ctx = createMockCtx();
      const props = {
        ...fillLayerType.createDefault(),
        region: "bad json",
        strategy: "also bad",
        shading: "{",
      };
      expect(() => {
        fillLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      const zeroBounds = { x: 0, y: 0, width: 0, height: 0 };
      expect(() => {
        fillLayerType.render(fillLayerType.createDefault(), ctx, zeroBounds, {} as never);
      }).not.toThrow();
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("uses the render cache on repeated identical renders", () => {
      const props = { ...fillLayerType.createDefault(), seed: 88887 };
      const ctx1 = createMockCtx();
      fillLayerType.render(props, ctx1, BOUNDS, {} as never);
      const saveCount1 = (ctx1.save as ReturnType<typeof vi.fn>).mock.calls.length;

      const ctx2 = createMockCtx();
      fillLayerType.render(props, ctx2, BOUNDS, {} as never);
      const saveCount2 = (ctx2.save as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(saveCount2).toBe(saveCount1);
    });
  });
});
