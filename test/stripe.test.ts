import { describe, it, expect, vi } from "vitest";
import { stripeLayerType } from "../src/layers/stripe.js";

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
    setLineDash: vi.fn(),
  };
  return ctx as unknown as CanvasRenderingContext2D;
}

const BOUNDS = { x: 0, y: 0, width: 400, height: 300 };

describe("stripeLayerType", () => {
  it("has typeId 'patterns:stripe'", () => {
    expect(stripeLayerType.typeId).toBe("patterns:stripe");
  });

  it("has category 'draw'", () => {
    expect(stripeLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(stripeLayerType.propertyEditorId).toBe("patterns:stripe-editor");
  });

  describe("createDefault", () => {
    it("returns all expected property keys with correct defaults", () => {
      const d = stripeLayerType.createDefault();
      expect(d.angle).toBe(0);
      expect(d.spacing).toBe(20);
      expect(d.lineWidth).toBe(10);
      expect(d.opacity).toBe(1);
      expect(JSON.parse(d.colors as string)).toEqual(["#000000", "#ffffff"]);
      expect(JSON.parse(d.dashPattern as string)).toEqual([]);
      expect(JSON.parse(d.region as string)).toEqual({ type: "bounds" });
    });

    it("returns new object each call", () => {
      expect(stripeLayerType.createDefault()).not.toBe(stripeLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(stripeLayerType.validate!(stripeLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid colors JSON", () => {
      const d = stripeLayerType.createDefault();
      d.colors = "not json{";
      const errors = stripeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "colors")).toBe(true);
    });

    it("returns error when colors has fewer than 2 entries", () => {
      const d = stripeLayerType.createDefault();
      d.colors = '["#000"]';
      const errors = stripeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "colors")).toBe(true);
    });

    it("returns error for invalid region JSON", () => {
      const d = stripeLayerType.createDefault();
      d.region = "bad";
      const errors = stripeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "region")).toBe(true);
    });

    it("returns error for invalid dashPattern JSON", () => {
      const d = stripeLayerType.createDefault();
      d.dashPattern = "{bad}";
      const errors = stripeLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "dashPattern")).toBe(true);
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        stripeLayerType.render(stripeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls ctx.save and ctx.restore (2x — region clip + rotation)", () => {
      const ctx = createMockCtx();
      stripeLayerType.render(stripeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);
    });

    it("applies rotation via translate + rotate", () => {
      const ctx = createMockCtx();
      const props = { ...stripeLayerType.createDefault(), angle: 45 };
      stripeLayerType.render(props, ctx, BOUNDS, {} as never);
      expect(ctx.translate).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("draws fillRect for each band", () => {
      const ctx = createMockCtx();
      stripeLayerType.render(stripeLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    });

    it("sets line dash when dashPattern is provided", () => {
      const ctx = createMockCtx();
      const props = { ...stripeLayerType.createDefault(), dashPattern: "[5,3]" };
      stripeLayerType.render(props, ctx, BOUNDS, {} as never);
      expect(ctx.setLineDash).toHaveBeenCalled();
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      stripeLayerType.render(stripeLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...stripeLayerType.createDefault(), colors: "bad", region: "bad" };
      expect(() => {
        stripeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with 3+ colors cycling", () => {
      const ctx = createMockCtx();
      const props = { ...stripeLayerType.createDefault(), colors: '["#f00","#0f0","#00f"]' };
      expect(() => {
        stripeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...stripeLayerType.createDefault(),
        region: '{"type":"ellipse","cx":200,"cy":150,"rx":100,"ry":80}',
      };
      expect(() => {
        stripeLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });
  });
});
