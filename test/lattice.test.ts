import { describe, it, expect, vi } from "vitest";
import { latticeLayerType } from "../src/layers/lattice.js";

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

describe("latticeLayerType", () => {
  it("has typeId 'patterns:lattice'", () => {
    expect(latticeLayerType.typeId).toBe("patterns:lattice");
  });

  it("has category 'draw'", () => {
    expect(latticeLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(latticeLayerType.propertyEditorId).toBe("patterns:lattice-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = latticeLayerType.createDefault();
      expect(d.style).toBe("greek-key");
      expect(d.size).toBe(30);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#ecf0f1");
      expect(d.lineWidth).toBe(2);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(latticeLayerType.createDefault()).not.toBe(latticeLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(latticeLayerType.validate!(latticeLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = latticeLayerType.createDefault();
      d.region = "bad json";
      const errors = latticeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = latticeLayerType.createDefault();
      d.style = "bogus";
      const errors = latticeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        latticeLayerType.render(latticeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      latticeLayerType.render(latticeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      latticeLayerType.render(latticeLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), region: "bad" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...latticeLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    it("renders style 'greek-key' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), style: "greek-key" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'chinese-fret' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), style: "chinese-fret" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'double-meander' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), style: "double-meander" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'chinese-window' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), style: "chinese-window" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders style 'interlocking-fret' without throwing", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), style: "interlocking-fret" };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...latticeLayerType.createDefault(), rotation: 45 };
      expect(() => {
        latticeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
