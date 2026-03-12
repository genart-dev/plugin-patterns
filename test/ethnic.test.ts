import { describe, it, expect, vi } from "vitest";
import { ethnicLayerType } from "../src/layers/ethnic.js";

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

describe("ethnicLayerType", () => {
  it("has typeId patterns:ethnic", () => {
    expect(ethnicLayerType.typeId).toBe("patterns:ethnic");
  });

  it("has category draw", () => {
    expect(ethnicLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = ethnicLayerType.createDefault();
    expect(props).toBeDefined();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
    expect(props.opacity).toBe(1);
  });

  it("renders with default properties without throwing", () => {
    const ctx = mockCtx();
    const props = ethnicLayerType.createDefault();
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("skips render for zero-size bounds", () => {
    const ctx = mockCtx();
    const props = ethnicLayerType.createDefault();
    ethnicLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 0 }, resources);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it("renders style 'tribal-zigzag' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "tribal-zigzag" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'african-kente' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "african-kente" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'egyptian-lotus' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "egyptian-lotus" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'mexican-step' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "mexican-step" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'songket-diamond' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "songket-diamond" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'tribal-arrow' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), style: "tribal-arrow" };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("validate returns null for valid properties", () => {
    const props = ethnicLayerType.createDefault();
    expect(ethnicLayerType.validate!(props)).toBeNull();
  });

  it("validate rejects invalid style", () => {
    const props = { ...ethnicLayerType.createDefault(), style: "invalid-style" };
    const errors = ethnicLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "style")).toBe(true);
  });

  it("validate rejects invalid region JSON", () => {
    const props = { ...ethnicLayerType.createDefault(), region: "not json" };
    const errors = ethnicLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "region")).toBe(true);
  });

  it("renders with rotation", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), rotation: 45 };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.rotate).toHaveBeenCalled();
  });

  it("renders with custom opacity", () => {
    const ctx = mockCtx();
    const props = { ...ethnicLayerType.createDefault(), opacity: 0.5 };
    expect(() => ethnicLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });
});
