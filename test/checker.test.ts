import { describe, it, expect, vi } from "vitest";
import { checkerLayerType } from "../src/layers/checker.js";

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

describe("checkerLayerType", () => {
  it("has typeId 'patterns:checker'", () => {
    expect(checkerLayerType.typeId).toBe("patterns:checker");
  });

  it("has category 'draw'", () => {
    expect(checkerLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(checkerLayerType.propertyEditorId).toBe("patterns:checker-editor");
  });

  describe("createDefault", () => {
    it("returns correct defaults", () => {
      const d = checkerLayerType.createDefault();
      expect(d.cellSize).toBe(30);
      expect(d.angle).toBe(0);
      expect(d.opacity).toBe(1);
      expect(JSON.parse(d.colors as string)).toEqual(["#000000", "#ffffff"]);
    });

    it("returns new object each call", () => {
      expect(checkerLayerType.createDefault()).not.toBe(checkerLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(checkerLayerType.validate!(checkerLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid colors JSON", () => {
      const d = checkerLayerType.createDefault();
      d.colors = "bad";
      const errors = checkerLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "colors")).toBe(true);
    });

    it("returns error when colors has fewer than 2 entries", () => {
      const d = checkerLayerType.createDefault();
      d.colors = '["#000"]';
      const errors = checkerLayerType.validate!(d);
      expect(errors).not.toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = checkerLayerType.createDefault();
      d.region = "bad";
      const errors = checkerLayerType.validate!(d);
      expect(errors).not.toBeNull();
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        checkerLayerType.render(checkerLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore (2x — clip + rotation)", () => {
      const ctx = createMockCtx();
      checkerLayerType.render(checkerLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);
    });

    it("draws cells using fillRect", () => {
      const ctx = createMockCtx();
      checkerLayerType.render(checkerLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    });

    it("applies rotation when angle is non-zero", () => {
      const ctx = createMockCtx();
      const props = { ...checkerLayerType.createDefault(), angle: 45 };
      checkerLayerType.render(props, ctx, BOUNDS, {} as never);
      expect(ctx.translate).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      checkerLayerType.render(checkerLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...checkerLayerType.createDefault(), colors: "bad", region: "bad" };
      expect(() => {
        checkerLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...checkerLayerType.createDefault(),
        region: '{"type":"polygon","points":[{"x":50,"y":50},{"x":300,"y":50},{"x":300,"y":250},{"x":50,"y":250}]}',
      };
      expect(() => {
        checkerLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });
  });
});
