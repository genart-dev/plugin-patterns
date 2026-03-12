import { describe, it, expect, vi } from "vitest";
import { triangleLayerType } from "../src/layers/triangle.js";

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
    translate: vi.fn(),
    rotate: vi.fn(),
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300 };

describe("triangleLayerType", () => {
  it("has typeId 'patterns:triangle'", () => {
    expect(triangleLayerType.typeId).toBe("patterns:triangle");
  });

  it("has category 'draw'", () => {
    expect(triangleLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(triangleLayerType.propertyEditorId).toBe("patterns:triangle-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = triangleLayerType.createDefault();
      expect(d.style).toBe("equilateral");
      expect(d.size).toBe(30);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#ecf0f1");
      expect(d.gap).toBe(1);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(triangleLayerType.createDefault()).not.toBe(triangleLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(triangleLayerType.validate!(triangleLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = triangleLayerType.createDefault();
      d.region = "bad json";
      const errors = triangleLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = triangleLayerType.createDefault();
      d.style = "bogus";
      const errors = triangleLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        triangleLayerType.render(triangleLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      triangleLayerType.render(triangleLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      triangleLayerType.render(triangleLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...triangleLayerType.createDefault(), region: "bad" };
      expect(() => {
        triangleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...triangleLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        triangleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    const styles = ["equilateral", "pinwheel", "arrow", "kaleidoscope", "inverted", "strip"];
    for (const style of styles) {
      it(`renders style '${style}' without throwing`, () => {
        const ctx = createMockCtx();
        const props = { ...triangleLayerType.createDefault(), style };
        expect(() => {
          triangleLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      });
    }

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...triangleLayerType.createDefault(), rotation: 45 };
      expect(() => {
        triangleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
