import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { customLayerType } from "../src/layers/custom.js";

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

describe("customLayerType", () => {
  it("has typeId 'patterns:custom'", () => {
    expect(customLayerType.typeId).toBe("patterns:custom");
  });

  describe("createDefault", () => {
    it("returns expected properties", () => {
      const props = customLayerType.createDefault();
      expect(props).toHaveProperty("patternId", "");
      expect(props).toHaveProperty("scale", 1);
      expect(props).toHaveProperty("rotation", 0);
      expect(props).toHaveProperty("color", "#000000");
      expect(props).toHaveProperty("backgroundColor", "#ffffff");
      expect(props).toHaveProperty("opacity", 1);
    });
  });

  describe("render", () => {
    it("renders placeholder when no patternId", () => {
      const ctx = createMockCtx();
      const props = customLayerType.createDefault();
      expect(() => {
        customLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("renders nothing when patternId set but pattern not found", () => {
      const ctx = createMockCtx();
      const props = { ...customLayerType.createDefault(), patternId: "nonexistent" };
      expect(() => {
        customLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
    });

    it("renders tiled pattern from globalThis.__genart_patterns", () => {
      const g = globalThis as Record<string, unknown>;
      g.__genart_patterns = {
        "test-pat": {
          id: "test-pat",
          name: "Test",
          width: 20,
          height: 20,
          commands: [
            { type: "rect", x: 0, y: 0, width: 10, height: 10, fill: true },
          ],
        },
      };

      const ctx = createMockCtx();
      const props = { ...customLayerType.createDefault(), patternId: "test-pat" };
      expect(() => {
        customLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();

      delete g.__genart_patterns;
    });

    it("skips render for zero-size bounds", () => {
      const ctx = createMockCtx();
      const props = customLayerType.createDefault();
      customLayerType.render(props, ctx, { ...BOUNDS, width: 0 }, RESOURCES);
      expect(ctx.save).not.toHaveBeenCalled();
    });
  });

  describe("validate", () => {
    it("returns null for valid defaults", () => {
      expect(customLayerType.validate(customLayerType.createDefault())).toBeNull();
    });

    it("detects invalid region JSON", () => {
      const props = { ...customLayerType.createDefault(), region: "invalid" };
      const result = customLayerType.validate(props);
      expect(result).not.toBeNull();
    });
  });
});
