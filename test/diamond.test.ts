import { describe, it, expect, vi } from "vitest";
import { diamondLayerType } from "../src/layers/diamond.js";

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

describe("diamondLayerType", () => {
  it("has typeId 'patterns:diamond'", () => {
    expect(diamondLayerType.typeId).toBe("patterns:diamond");
  });

  it("has category 'draw'", () => {
    expect(diamondLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(diamondLayerType.propertyEditorId).toBe("patterns:diamond-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = diamondLayerType.createDefault();
      expect(d.style).toBe("simple");
      expect(d.size).toBe(30);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#ecf0f1");
      expect(d.color3).toBe("#1a5276");
      expect(d.gap).toBe(2);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(diamondLayerType.createDefault()).not.toBe(diamondLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(diamondLayerType.validate!(diamondLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = diamondLayerType.createDefault();
      d.region = "bad json";
      const errors = diamondLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = diamondLayerType.createDefault();
      d.style = "bogus";
      const errors = diamondLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        diamondLayerType.render(diamondLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      diamondLayerType.render(diamondLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      diamondLayerType.render(diamondLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...diamondLayerType.createDefault(), region: "bad" };
      expect(() => {
        diamondLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...diamondLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        diamondLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    const styles = ["simple", "argyle", "nested", "adjointed", "lattice"];
    for (const style of styles) {
      it(`renders style '${style}' without throwing`, () => {
        const ctx = createMockCtx();
        const props = { ...diamondLayerType.createDefault(), style };
        expect(() => {
          diamondLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      });
    }

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...diamondLayerType.createDefault(), rotation: 45 };
      expect(() => {
        diamondLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
