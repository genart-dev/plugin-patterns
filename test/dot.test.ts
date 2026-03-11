import { describe, it, expect, vi } from "vitest";
import { dotLayerType } from "../src/layers/dot.js";

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
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300 };

describe("dotLayerType", () => {
  it("has typeId 'patterns:dot'", () => {
    expect(dotLayerType.typeId).toBe("patterns:dot");
  });

  it("has category 'draw'", () => {
    expect(dotLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(dotLayerType.propertyEditorId).toBe("patterns:dot-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys", () => {
      const d = dotLayerType.createDefault();
      expect(d.spacing).toBe(24);
      expect(d.radius).toBe(6);
      expect(d.offset).toBe(false);
      expect(d.color).toBe("#000000");
      expect(d.backgroundColor).toBe("#ffffff");
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(dotLayerType.createDefault()).not.toBe(dotLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(dotLayerType.validate!(dotLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = dotLayerType.createDefault();
      d.region = "bad json";
      const errors = dotLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        dotLayerType.render(dotLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      dotLayerType.render(dotLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("fills background rectangle", () => {
      const ctx = createMockCtx();
      dotLayerType.render(dotLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it("draws dots using arc + fill", () => {
      const ctx = createMockCtx();
      dotLayerType.render(dotLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect((ctx.arc as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
      expect((ctx.fill as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    });

    it("renders hex offset grid", () => {
      const ctx = createMockCtx();
      const props = { ...dotLayerType.createDefault(), offset: true };
      expect(() => {
        dotLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      dotLayerType.render(dotLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...dotLayerType.createDefault(), region: "bad" };
      expect(() => {
        dotLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...dotLayerType.createDefault(),
        region: '{"type":"rect","x":50,"y":50,"width":200,"height":150}',
      };
      expect(() => {
        dotLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });
  });
});
