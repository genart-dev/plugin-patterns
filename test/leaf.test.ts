import { describe, it, expect, vi } from "vitest";
import { leafLayerType } from "../src/layers/leaf.js";

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

describe("leafLayerType", () => {
  it("has typeId 'patterns:leaf'", () => {
    expect(leafLayerType.typeId).toBe("patterns:leaf");
  });

  it("has category 'draw'", () => {
    expect(leafLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(leafLayerType.propertyEditorId).toBe("patterns:leaf-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = leafLayerType.createDefault();
      expect(d.style).toBe("simple-leaf");
      expect(d.size).toBe(28);
      expect(d.color1).toBe("#27ae60");
      expect(d.color2).toBe("#eafaf1");
      expect(d.gap).toBe(8);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(leafLayerType.createDefault()).not.toBe(leafLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(leafLayerType.validate!(leafLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = leafLayerType.createDefault();
      d.region = "bad json";
      const errors = leafLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = leafLayerType.createDefault();
      d.style = "bogus";
      const errors = leafLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        leafLayerType.render(leafLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      leafLayerType.render(leafLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      leafLayerType.render(leafLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), region: "bad" };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...leafLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("renders style 'simple-leaf' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), style: "simple-leaf" };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'fern-row' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), style: "fern-row" };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'tropical-scatter' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), style: "tropical-scatter" };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'vine-trail' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), style: "vine-trail" };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...leafLayerType.createDefault(), rotation: 45 };
      expect(() => {
        leafLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
