import { describe, it, expect, vi } from "vitest";
import { plaidLayerType } from "../src/layers/plaid.js";

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
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    bezierCurveTo: vi.fn(),
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300 };

describe("plaidLayerType", () => {
  it("has typeId 'patterns:plaid'", () => {
    expect(plaidLayerType.typeId).toBe("patterns:plaid");
  });

  it("has category 'draw'", () => {
    expect(plaidLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(plaidLayerType.propertyEditorId).toBe("patterns:plaid-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = plaidLayerType.createDefault();
      expect(d.style).toBe("tartan");
      expect(d.size).toBe(40);
      expect(d.color1).toBe("#c0392b");
      expect(d.color2).toBe("#1a5276");
      expect(d.color3).toBe("#27ae60");
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(plaidLayerType.createDefault()).not.toBe(plaidLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(plaidLayerType.validate!(plaidLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = plaidLayerType.createDefault();
      d.region = "bad json";
      const errors = plaidLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = plaidLayerType.createDefault();
      d.style = "bogus";
      const errors = plaidLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        plaidLayerType.render(plaidLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      plaidLayerType.render(plaidLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      plaidLayerType.render(plaidLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), region: "bad" };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...plaidLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("renders style 'tartan' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), style: "tartan" };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'buffalo-plaid' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), style: "buffalo-plaid" };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'madras' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), style: "madras" };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'windowpane' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), style: "windowpane" };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...plaidLayerType.createDefault(), rotation: 45 };
      expect(() => {
        plaidLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
