import { describe, it, expect, vi } from "vitest";
import { memphisLayerType } from "../src/layers/memphis.js";

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

describe("memphisLayerType", () => {
  it("has typeId 'patterns:memphis'", () => {
    expect(memphisLayerType.typeId).toBe("patterns:memphis");
  });

  it("has category 'draw'", () => {
    expect(memphisLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = memphisLayerType.createDefault();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
  });

  it("validate returns null for default properties", () => {
    const props = memphisLayerType.createDefault();
    expect(memphisLayerType.validate!(props)).toBeNull();
  });

  it("validate catches invalid region JSON", () => {
    const props = memphisLayerType.createDefault();
    props.region = "{bad json";
    const errors = memphisLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("region");
  });

  it("validate catches invalid style", () => {
    const props = memphisLayerType.createDefault();
    props.style = "nonexistent-style";
    const errors = memphisLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors![0].property).toBe("style");
  });

  describe("render", () => {
    it("renders with default properties", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it("skips render for zero-size bounds", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      memphisLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 100 }, resources);
      expect(ctx.save).not.toHaveBeenCalled();
    });

    it("renders style 'classic'", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.style = "classic";
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'confetti'", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.style = "confetti";
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'geometric'", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.style = "geometric";
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("renders style 'squiggle'", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.style = "squiggle";
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });

    it("applies rotation", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.rotation = 45;
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it("applies opacity", () => {
      const ctx = mockCtx();
      const props = memphisLayerType.createDefault();
      props.opacity = 0.5;
      memphisLayerType.render(props, ctx, bounds, resources);
      expect(ctx.save).toHaveBeenCalled();
    });
  });
});
