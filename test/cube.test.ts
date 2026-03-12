import { describe, it, expect, vi } from "vitest";
import { cubeLayerType } from "../src/layers/cube.js";

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

describe("cubeLayerType", () => {
  it("has typeId 'patterns:cube'", () => {
    expect(cubeLayerType.typeId).toBe("patterns:cube");
  });

  it("has category 'draw'", () => {
    expect(cubeLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(cubeLayerType.propertyEditorId).toBe("patterns:cube-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = cubeLayerType.createDefault();
      expect(d.style).toBe("isometric");
      expect(d.size).toBe(30);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#5d6d7e");
      expect(d.color3).toBe("#85929e");
      expect(d.gap).toBe(1);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(cubeLayerType.createDefault()).not.toBe(cubeLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(cubeLayerType.validate!(cubeLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = cubeLayerType.createDefault();
      d.region = "bad json";
      const errors = cubeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = cubeLayerType.createDefault();
      d.style = "bogus";
      const errors = cubeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        cubeLayerType.render(cubeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      cubeLayerType.render(cubeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      cubeLayerType.render(cubeLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...cubeLayerType.createDefault(), region: "bad" };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...cubeLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("renders style 'isometric' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...cubeLayerType.createDefault(), style: "isometric" };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'stacked' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...cubeLayerType.createDefault(), style: "stacked" };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'tumbling-blocks' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...cubeLayerType.createDefault(), style: "tumbling-blocks" };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...cubeLayerType.createDefault(), rotation: 45 };
      expect(() => {
        cubeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
