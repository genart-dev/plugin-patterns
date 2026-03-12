import { describe, it, expect, vi } from "vitest";
import { tileLayerType } from "../src/layers/tile.js";

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
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300, rotation: 0, scaleX: 1, scaleY: 1 };
const RESOURCES = { getFont: () => null, getImage: () => null, theme: "light" as const, pixelRatio: 1 };

describe("tileLayerType", () => {
  it("has typeId 'patterns:tile'", () => {
    expect(tileLayerType.typeId).toBe("patterns:tile");
  });

  it("has category 'draw'", () => {
    expect(tileLayerType.category).toBe("draw");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const props = tileLayerType.createDefault();
      expect(props).toHaveProperty("tileShape", "brick");
      expect(props).toHaveProperty("size", 30);
      expect(props).toHaveProperty("color1", "#c0392b");
      expect(props).toHaveProperty("color2", "#ecf0f1");
      expect(props).toHaveProperty("gap", 2);
      expect(props).toHaveProperty("rotation", 0);
      expect(props).toHaveProperty("opacity", 1);
    });
  });

  describe("render", () => {
    const tileShapes = ["brick", "basketweave", "hex", "scale", "moroccan", "ogee", "lantern", "basketweave-tight"];

    for (const shape of tileShapes) {
      it(`renders ${shape} without error`, () => {
        const ctx = createMockCtx();
        const props = { ...tileLayerType.createDefault(), tileShape: shape };
        expect(() => {
          tileLayerType.render(props, ctx, BOUNDS, RESOURCES);
        }).not.toThrow();
      });
    }

    it("skips render for zero-size bounds", () => {
      const ctx = createMockCtx();
      const props = tileLayerType.createDefault();
      tileLayerType.render(props, ctx, { ...BOUNDS, width: 0 }, RESOURCES);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("applies rotation", () => {
      const ctx = createMockCtx();
      const props = { ...tileLayerType.createDefault(), rotation: 45 };
      tileLayerType.render(props, ctx, BOUNDS, RESOURCES);
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("falls back to brick for unknown shape", () => {
      const ctx = createMockCtx();
      const props = { ...tileLayerType.createDefault(), tileShape: "unknown" };
      expect(() => {
        tileLayerType.render(props, ctx, BOUNDS, RESOURCES);
      }).not.toThrow();
    });
  });

  describe("validate", () => {
    it("returns null for valid defaults", () => {
      expect(tileLayerType.validate(tileLayerType.createDefault())).toBeNull();
    });

    it("detects invalid region JSON", () => {
      const props = { ...tileLayerType.createDefault(), region: "{bad" };
      const result = tileLayerType.validate(props);
      expect(result).not.toBeNull();
    });

    it("detects invalid tile shape", () => {
      const props = { ...tileLayerType.createDefault(), tileShape: "invalid" };
      const result = tileLayerType.validate(props);
      expect(result).not.toBeNull();
      expect(result![0]!.property).toBe("tileShape");
    });
  });
});
