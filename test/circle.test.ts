import { describe, it, expect, vi } from "vitest";
import { circleLayerType } from "../src/layers/circle.js";

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

describe("circleLayerType", () => {
  it("has typeId 'patterns:circle'", () => {
    expect(circleLayerType.typeId).toBe("patterns:circle");
  });

  it("has category 'draw'", () => {
    expect(circleLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(circleLayerType.propertyEditorId).toBe("patterns:circle-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = circleLayerType.createDefault();
      expect(d.style).toBe("concentric");
      expect(d.size).toBe(40);
      expect(d.color1).toBe("#2c3e50");
      expect(d.color2).toBe("#ecf0f1");
      expect(d.lineWidth).toBe(2);
      expect(d.gap).toBe(6);
      expect(d.rotation).toBe(0);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(circleLayerType.createDefault()).not.toBe(circleLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(circleLayerType.validate!(circleLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = circleLayerType.createDefault();
      d.region = "bad json";
      const errors = circleLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid style", () => {
      const d = circleLayerType.createDefault();
      d.style = "bogus";
      const errors = circleLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("style");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        circleLayerType.render(circleLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      circleLayerType.render(circleLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      circleLayerType.render(circleLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...circleLayerType.createDefault(), region: "bad" };
      expect(() => {
        circleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...circleLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        circleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });

    const styles = ["concentric", "overlapping", "packed", "semicircle", "quarter-turn", "bullseye"];
    for (const style of styles) {
      it(`renders style '${style}' without throwing`, () => {
        const ctx = createMockCtx();
        const props = { ...circleLayerType.createDefault(), style };
        expect(() => {
          circleLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      });
    }

    it("renders with rotation", () => {
      const ctx = createMockCtx();
      const props = { ...circleLayerType.createDefault(), rotation: 45 };
      expect(() => {
        circleLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });
});
