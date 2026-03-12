import { describe, it, expect, vi } from "vitest";
import { herringboneLayerType } from "../src/layers/herringbone.js";

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
    setLineDash: vi.fn(),
    scale: vi.fn(),
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 };
const RESOURCES = { getFont: () => null, getImage: () => null, theme: "light" as const, pixelRatio: 1 };

describe("herringboneLayerType", () => {
  it("has typeId 'patterns:herringbone'", () => {
    expect(herringboneLayerType.typeId).toBe("patterns:herringbone");
  });

  it("has category 'draw'", () => {
    expect(herringboneLayerType.category).toBe("draw");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const props = herringboneLayerType.createDefault();
      expect(props).toHaveProperty("blockWidth", 30);
      expect(props).toHaveProperty("blockHeight", 10);
      expect(props).toHaveProperty("angle", 45);
      expect(props).toHaveProperty("color1", "#2c3e50");
      expect(props).toHaveProperty("color2", "#ecf0f1");
      expect(props).toHaveProperty("gap", 1);
      expect(props).toHaveProperty("opacity", 1);
    });
  });

  describe("render", () => {
    it("renders without error with default properties", () => {
      const ctx = createMockCtx();
      const props = herringboneLayerType.createDefault();
      expect(() => {
        herringboneLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
    });

    it("fills background color", () => {
      const ctx = createMockCtx();
      const props = herringboneLayerType.createDefault();
      herringboneLayerType.render(props, ctx, BOUNDS, RESOURCES);
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it("skips render for zero-size bounds", () => {
      const ctx = createMockCtx();
      const props = herringboneLayerType.createDefault();
      herringboneLayerType.render(props, ctx, { ...BOUNDS, height: 0 }, RESOURCES);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("applies opacity", () => {
      const ctx = createMockCtx();
      const props = { ...herringboneLayerType.createDefault(), opacity: 0.5 };
      herringboneLayerType.render(props, ctx, BOUNDS, RESOURCES);
      expect(ctx.globalAlpha).toBe(0.5);
    });
  });

  describe("validate", () => {
    it("returns null for valid defaults", () => {
      expect(herringboneLayerType.validate(herringboneLayerType.createDefault())).toBeNull();
    });

    it("detects invalid region JSON", () => {
      const props = { ...herringboneLayerType.createDefault(), region: "bad json" };
      const result = herringboneLayerType.validate(props);
      expect(result).not.toBeNull();
    });
  });
});
