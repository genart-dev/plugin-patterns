import { describe, it, expect, vi } from "vitest";
import { starLayerType } from "../src/layers/star.js";

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

describe("starLayerType", () => {
  it("has typeId 'patterns:star'", () => {
    expect(starLayerType.typeId).toBe("patterns:star");
  });

  it("has category 'draw'", () => {
    expect(starLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(starLayerType.propertyEditorId).toBe("patterns:star-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = starLayerType.createDefault();
      expect(d.style).toBe("six-pointed");
      expect(d.size).toBe(28);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#ecf0f1");
      expect(d.gap).toBe(2);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(starLayerType.createDefault()).not.toBe(starLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(starLayerType.validate!(starLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = starLayerType.createDefault();
      d.region = "bad json";
      const errors = starLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = starLayerType.createDefault();
      d.style = "bogus";
      const errors = starLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        starLayerType.render(starLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      starLayerType.render(starLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      starLayerType.render(starLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...starLayerType.createDefault(), region: "bad" };
      expect(() => {
        starLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...starLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        starLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    const styles = ["six-pointed", "eight-pointed", "plus-grid", "plus-offset", "lattice"];
    for (const style of styles) {
      it(`renders style '${style}' without throwing`, () => {
        const ctx = createMockCtx();
        const props = { ...starLayerType.createDefault(), style };
        expect(() => {
          starLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      });
    }

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...starLayerType.createDefault(), rotation: 45 };
      expect(() => {
        starLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
