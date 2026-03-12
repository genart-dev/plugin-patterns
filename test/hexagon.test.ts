import { describe, it, expect, vi } from "vitest";
import { hexagonLayerType } from "../src/layers/hexagon.js";

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

describe("hexagonLayerType", () => {
  it("has typeId 'patterns:hexagon'", () => {
    expect(hexagonLayerType.typeId).toBe("patterns:hexagon");
  });

  it("has category 'draw'", () => {
    expect(hexagonLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(hexagonLayerType.propertyEditorId).toBe("patterns:hexagon-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = hexagonLayerType.createDefault();
      expect(d.style).toBe("honeycomb");
      expect(d.size).toBe(24);
      expect(d.color1).toBe("#f39c12");
      expect(d.color2).toBe("#fef9e7");
      expect(d.gap).toBe(2);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(hexagonLayerType.createDefault()).not.toBe(hexagonLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(hexagonLayerType.validate!(hexagonLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = hexagonLayerType.createDefault();
      d.region = "bad json";
      const errors = hexagonLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = hexagonLayerType.createDefault();
      d.style = "bogus";
      const errors = hexagonLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        hexagonLayerType.render(hexagonLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      hexagonLayerType.render(hexagonLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      hexagonLayerType.render(hexagonLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...hexagonLayerType.createDefault(), region: "bad" };
      expect(() => {
        hexagonLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...hexagonLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        hexagonLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    const styles = ["honeycomb", "interlocked", "flower", "grid", "overlapping"];
    for (const style of styles) {
      it(`renders style '${style}' without throwing`, () => {
        const ctx = createMockCtx();
        const props = { ...hexagonLayerType.createDefault(), style };
        expect(() => {
          hexagonLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      });
    }

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...hexagonLayerType.createDefault(), rotation: 45 };
      expect(() => {
        hexagonLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
