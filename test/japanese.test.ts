import { describe, it, expect, vi } from "vitest";
import { japaneseLayerType } from "../src/layers/japanese.js";

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

describe("japaneseLayerType", () => {
  it("has typeId 'patterns:japanese'", () => {
    expect(japaneseLayerType.typeId).toBe("patterns:japanese");
  });

  it("has category 'draw'", () => {
    expect(japaneseLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(japaneseLayerType.propertyEditorId).toBe("patterns:japanese-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = japaneseLayerType.createDefault();
      expect(d.style).toBe("asanoha");
      expect(d.size).toBe(30);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#f5f5dc");
      expect(d.lineWidth).toBe(1);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(japaneseLayerType.createDefault()).not.toBe(japaneseLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(japaneseLayerType.validate!(japaneseLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = japaneseLayerType.createDefault();
      d.region = "bad json";
      const errors = japaneseLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = japaneseLayerType.createDefault();
      d.style = "bogus";
      const errors = japaneseLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        japaneseLayerType.render(japaneseLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      japaneseLayerType.render(japaneseLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      japaneseLayerType.render(japaneseLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), region: "bad" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...japaneseLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("renders style 'asanoha' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "asanoha" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'seigaiha' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "seigaiha" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'shippo' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "shippo" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'bishamon-kikko' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "bishamon-kikko" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'yagasuri' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "yagasuri" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'kumiko' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), style: "kumiko" };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...japaneseLayerType.createDefault(), rotation: 45 };
      expect(() => {
        japaneseLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
