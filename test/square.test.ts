import { describe, it, expect, vi } from "vitest";
import { squareLayerType } from "../src/layers/square.js";

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

describe("squareLayerType", () => {
  it("has typeId patterns:square", () => {
    expect(squareLayerType.typeId).toBe("patterns:square");
  });

  it("has category draw", () => {
    expect(squareLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = squareLayerType.createDefault();
    expect(props).toBeDefined();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
    expect(props.opacity).toBe(1);
  });

  it("renders with default properties without throwing", () => {
    const ctx = mockCtx();
    const props = squareLayerType.createDefault();
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("skips render for zero-size bounds", () => {
    const ctx = mockCtx();
    const props = squareLayerType.createDefault();
    squareLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 0 }, resources);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it("renders style 'nested' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), style: "nested" };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'rotated' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), style: "rotated" };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'offset' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), style: "offset" };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'stars-and-squares' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), style: "stars-and-squares" };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'circles-and-squares' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), style: "circles-and-squares" };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("validate returns null for valid properties", () => {
    const props = squareLayerType.createDefault();
    expect(squareLayerType.validate!(props)).toBeNull();
  });

  it("validate rejects invalid style", () => {
    const props = { ...squareLayerType.createDefault(), style: "invalid-style" };
    const errors = squareLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "style")).toBe(true);
  });

  it("validate rejects invalid region JSON", () => {
    const props = { ...squareLayerType.createDefault(), region: "not json" };
    const errors = squareLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "region")).toBe(true);
  });

  it("renders with rotation", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), rotation: 45 };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.rotate).toHaveBeenCalled();
  });

  it("renders with custom opacity", () => {
    const ctx = mockCtx();
    const props = { ...squareLayerType.createDefault(), opacity: 0.5 };
    expect(() => squareLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });
});
