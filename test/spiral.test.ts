import { describe, it, expect, vi } from "vitest";
import { spiralLayerType } from "../src/layers/spiral.js";

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

describe("spiralLayerType", () => {
  it("has typeId 'patterns:spiral'", () => {
    expect(spiralLayerType.typeId).toBe("patterns:spiral");
  });

  it("has category 'draw'", () => {
    expect(spiralLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = spiralLayerType.createDefault();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
  });

  it("validate returns null for default properties", () => {
    const props = spiralLayerType.createDefault();
    expect(spiralLayerType.validate!(props)).toBeNull();
  });

  it("validate catches invalid region JSON", () => {
    const props = spiralLayerType.createDefault();
    props.region = "{bad json";
    const errors = spiralLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("region");
  });

  it("validate catches invalid style", () => {
    const props = spiralLayerType.createDefault();
    props.style = "nonexistent-style";
    const errors = spiralLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("style");
  });

  describe("render", () => {
    it("renders with default properties", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render for zero-size bounds", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      spiralLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 100 }, resources);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("renders style 'archimedean'", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.style = "archimedean";
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'logarithmic'", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.style = "logarithmic";
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'scroll'", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.style = "scroll";
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'double'", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.style = "double";
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("applies rotation", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.rotation = 45;
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("applies opacity", () => {
      const ctx = mockCtx();
      const props = spiralLayerType.createDefault();
      props.opacity = 0.5;
      spiralLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });
  });
});
