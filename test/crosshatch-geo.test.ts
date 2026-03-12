import { describe, it, expect, vi } from "vitest";
import { crosshatchGeoLayerType } from "../src/layers/crosshatch-geo.js";

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

describe("crosshatchGeoLayerType", () => {
  it("has typeId 'patterns:crosshatch-geo'", () => {
    expect(crosshatchGeoLayerType.typeId).toBe("patterns:crosshatch-geo");
  });

  it("has category 'draw'", () => {
    expect(crosshatchGeoLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(crosshatchGeoLayerType.propertyEditorId).toBe("patterns:crosshatch-geo-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const props = crosshatchGeoLayerType.createDefault();
      expect(props).toHaveProperty("angle1", 45);
      expect(props).toHaveProperty("angle2", 135);
      expect(props).toHaveProperty("spacing", 10);
      expect(props).toHaveProperty("lineWidth", 1);
      expect(props).toHaveProperty("color", "#000000");
      expect(props).toHaveProperty("backgroundColor", "#ffffff");
      expect(props).toHaveProperty("opacity", 1);
    });
  });

  describe("render", () => {
    it("renders without error with default properties", () => {
      const ctx = createMockCtx();
      const props = crosshatchGeoLayerType.createDefault();
      expect(() => {
        crosshatchGeoLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
    });

    it("calls save/restore for clipping", () => {
      const ctx = createMockCtx();
      const props = crosshatchGeoLayerType.createDefault();
      crosshatchGeoLayerType.render(props, ctx, BOUNDS, RESOURCES);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("draws background and strokes", () => {
      const ctx = createMockCtx();
      const props = crosshatchGeoLayerType.createDefault();
      crosshatchGeoLayerType.render(props, ctx, BOUNDS, RESOURCES);
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it("skips render for zero-size bounds", () => {
      const ctx = createMockCtx();
      const props = crosshatchGeoLayerType.createDefault();
      crosshatchGeoLayerType.render(props, ctx, { ...BOUNDS, width: 0 }, RESOURCES);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("uses custom angles", () => {
      const ctx = createMockCtx();
      const props = { ...crosshatchGeoLayerType.createDefault(), angle1: 0, angle2: 90 };
      expect(() => {
        crosshatchGeoLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
      expect(ctx.rotate).toHaveBeenCalled();
    });
  });

  describe("validate", () => {
    it("returns null for valid defaults", () => {
      const result = crosshatchGeoLayerType.validate(crosshatchGeoLayerType.createDefault());
      expect(result).toBeNull();
    });

    it("detects invalid region JSON", () => {
      const props = { ...crosshatchGeoLayerType.createDefault(), region: "{invalid" };
      const result = crosshatchGeoLayerType.validate(props);
      expect(result).not.toBeNull();
      expect(result![0]!.property).toBe("region");
    });
  });
});
