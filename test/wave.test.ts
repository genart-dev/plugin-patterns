import { describe, it, expect, vi } from "vitest";
import { waveLayerType } from "../src/layers/wave.js";

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

describe("waveLayerType", () => {
  it("has typeId 'patterns:wave'", () => {
    expect(waveLayerType.typeId).toBe("patterns:wave");
  });

  it("has category 'draw'", () => {
    expect(waveLayerType.category).toBe("draw");
  });

  it("has propertyEditorId", () => {
    expect(waveLayerType.propertyEditorId).toBe("patterns:wave-editor");
  });

  describe("createDefault", () => {
    it("returns correct defaults", () => {
      const d = waveLayerType.createDefault();
      expect(d.amplitude).toBe(15);
      expect(d.frequency).toBe(3);
      expect(d.phase).toBe(0);
      expect(d.lineWidth).toBe(2);
      expect(d.waveform).toBe("sine");
      expect(d.color).toBe("#000000");
      expect(d.spacing).toBe(30);
      expect(d.opacity).toBe(1);
    });

    it("returns new object each call", () => {
      expect(waveLayerType.createDefault()).not.toBe(waveLayerType.createDefault());
    });
  });

  describe("validate", () => {
    it("returns null for default properties", () => {
      expect(waveLayerType.validate!(waveLayerType.createDefault())).toBeNull();
    });

    it("returns error for invalid region JSON", () => {
      const d = waveLayerType.createDefault();
      d.region = "bad";
      const errors = waveLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors![0]!.property).toBe("region");
    });

    it("returns error for invalid waveform", () => {
      const d = waveLayerType.createDefault();
      d.waveform = "wobble";
      const errors = waveLayerType.validate!(d);
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.property === "waveform")).toBe(true);
    });

    it("accepts all valid waveforms", () => {
      for (const wf of ["sine", "triangle", "square", "sawtooth"]) {
        const d = waveLayerType.createDefault();
        d.waveform = wf;
        expect(waveLayerType.validate!(d)).toBeNull();
      }
    });
  });

  describe("render", () => {
    it("renders without throwing for default properties", () => {
      const ctx = createMockCtx();
      expect(() => {
        waveLayerType.render(waveLayerType.createDefault(), ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("calls save/restore", () => {
      const ctx = createMockCtx();
      waveLayerType.render(waveLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("draws wave lines using moveTo + lineTo + stroke", () => {
      const ctx = createMockCtx();
      waveLayerType.render(waveLayerType.createDefault(), ctx, BOUNDS, {} as never);
      expect((ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
      expect((ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
      expect((ctx.stroke as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    });

    it("renders all waveform types without throwing", () => {
      for (const wf of ["sine", "triangle", "square", "sawtooth"]) {
        const ctx = createMockCtx();
        const props = { ...waveLayerType.createDefault(), waveform: wf };
        expect(() => {
          waveLayerType.render(props, ctx, BOUNDS, {} as never);
        }).not.toThrow();
      }
    });

    it("skips render when bounds are zero-size", () => {
      const ctx = createMockCtx();
      waveLayerType.render(waveLayerType.createDefault(), ctx, { x: 0, y: 0, width: 0, height: 0 }, {} as never);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("handles malformed region JSON gracefully", () => {
      const ctx = createMockCtx();
      const props = { ...waveLayerType.createDefault(), region: "bad" };
      expect(() => {
        waveLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("falls back to sine for unknown waveform", () => {
      const ctx = createMockCtx();
      const props = { ...waveLayerType.createDefault(), waveform: "unknown" };
      expect(() => {
        waveLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
    });

    it("renders with region clipping", () => {
      const ctx = createMockCtx();
      const props = {
        ...waveLayerType.createDefault(),
        region: '{"type":"ellipse","cx":200,"cy":150,"rx":100,"ry":80}',
      };
      expect(() => {
        waveLayerType.render(props, ctx, BOUNDS, {} as never);
      }).not.toThrow();
      expect(ctx.clip).toHaveBeenCalled();
    });
  });
});
