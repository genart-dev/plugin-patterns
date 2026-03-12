import { describe, it, expect, vi } from "vitest";
import { octagonLayerType } from "../src/layers/octagon.js";

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

describe("octagonLayerType", () => {
  it("has typeId patterns:octagon", () => {
    expect(octagonLayerType.typeId).toBe("patterns:octagon");
  });

  it("has category draw", () => {
    expect(octagonLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = octagonLayerType.createDefault();
    expect(props).toBeDefined();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
    expect(props.opacity).toBe(1);
  });

  it("renders with default properties without throwing", () => {
    const ctx = mockCtx();
    const props = octagonLayerType.createDefault();
    expect(() => octagonLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("skips render for zero-size bounds", () => {
    const ctx = mockCtx();
    const props = octagonLayerType.createDefault();
    octagonLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 0 }, resources);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it("renders style 'octagon-square' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...octagonLayerType.createDefault(), style: "octagon-square" };
    expect(() => octagonLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'outline' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...octagonLayerType.createDefault(), style: "outline" };
    expect(() => octagonLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("validate returns null for valid properties", () => {
    const props = octagonLayerType.createDefault();
    expect(octagonLayerType.validate!(props)).toBeNull();
  });

  it("validate rejects invalid style", () => {
    const props = { ...octagonLayerType.createDefault(), style: "invalid-style" };
    const errors = octagonLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "style")).toBe(true);
  });

  it("validate rejects invalid region JSON", () => {
    const props = { ...octagonLayerType.createDefault(), region: "not json" };
    const errors = octagonLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "region")).toBe(true);
  });

  it("renders with rotation", () => {
    const ctx = mockCtx();
    const props = { ...octagonLayerType.createDefault(), rotation: 45 };
    expect(() => octagonLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.rotate).toHaveBeenCalled();
  });

  it("renders with custom opacity", () => {
    const ctx = mockCtx();
    const props = { ...octagonLayerType.createDefault(), opacity: 0.5 };
    expect(() => octagonLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });
});
