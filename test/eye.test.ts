import { describe, it, expect, vi } from "vitest";
import { eyeLayerType } from "../src/layers/eye.js";

function mockCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    clip: vi.fn(),
    rect: vi.fn(),
    strokeRect: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    ellipse: vi.fn(),
    set fillStyle(_v: string) {},
    set strokeStyle(_v: string) {},
    set lineWidth(_v: number) {},
    set globalAlpha(_v: number) {},
    get globalAlpha() { return 1; },
    set lineCap(_v: CanvasLineCap) {},
  } as unknown as CanvasRenderingContext2D;
}

const bounds = { x: 0, y: 0, width: 200, height: 200 };
const resources = {} as any;

describe("eyeLayerType", () => {
  it("has typeId 'patterns:eye'", () => {
    expect(eyeLayerType.typeId).toBe("patterns:eye");
  });

  it("has category 'draw'", () => {
    expect(eyeLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = eyeLayerType.createDefault();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
  });

  it("validate returns null for default properties", () => {
    const props = eyeLayerType.createDefault();
    expect(eyeLayerType.validate!(props)).toBeNull();
  });

  it("validate catches invalid region JSON", () => {
    const props = eyeLayerType.createDefault();
    props.region = "{bad json";
    const errors = eyeLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("region");
  });

  it("validate catches invalid style", () => {
    const props = eyeLayerType.createDefault();
    props.style = "nonexistent-style";
    const errors = eyeLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("style");
  });

  describe("render", () => {
    it("renders with default properties", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render for zero-size bounds", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      eyeLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 100 }, resources);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("renders style 'vesica'", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.style = "vesica";
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'pointed'", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.style = "pointed";
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'almond'", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.style = "almond";
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'double'", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.style = "double";
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("applies rotation", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.rotation = 45;
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("applies opacity", () => {
      const ctx = mockCtx();
      const props = eyeLayerType.createDefault();
      props.opacity = 0.5;
      eyeLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });
  });
});
