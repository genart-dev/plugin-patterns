import { describe, it, expect, vi } from "vitest";
import { chainlinkLayerType } from "../src/layers/chainlink.js";

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

describe("chainlinkLayerType", () => {
  it("has typeId patterns:chainlink", () => {
    expect(chainlinkLayerType.typeId).toBe("patterns:chainlink");
  });

  it("has category draw", () => {
    expect(chainlinkLayerType.category).toBe("draw");
  });

  it("createDefault returns valid properties", () => {
    const props = chainlinkLayerType.createDefault();
    expect(props).toBeDefined();
    expect(props.style).toBeDefined();
    expect(props.size).toBeGreaterThan(0);
    expect(props.color1).toBeTruthy();
    expect(props.color2).toBeTruthy();
    expect(props.opacity).toBe(1);
  });

  it("renders with default properties without throwing", () => {
    const ctx = mockCtx();
    const props = chainlinkLayerType.createDefault();
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("skips render for zero-size bounds", () => {
    const ctx = mockCtx();
    const props = chainlinkLayerType.createDefault();
    chainlinkLayerType.render(props, ctx, { x: 0, y: 0, width: 0, height: 0 }, resources);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it("renders style 'circle' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...chainlinkLayerType.createDefault(), style: "circle" };
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'oval' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...chainlinkLayerType.createDefault(), style: "oval" };
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("renders style 'double' without throwing", () => {
    const ctx = mockCtx();
    const props = { ...chainlinkLayerType.createDefault(), style: "double" };
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });

  it("validate returns null for valid properties", () => {
    const props = chainlinkLayerType.createDefault();
    expect(chainlinkLayerType.validate!(props)).toBeNull();
  });

  it("validate rejects invalid style", () => {
    const props = { ...chainlinkLayerType.createDefault(), style: "invalid-style" };
    const errors = chainlinkLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "style")).toBe(true);
  });

  it("validate rejects invalid region JSON", () => {
    const props = { ...chainlinkLayerType.createDefault(), region: "not json" };
    const errors = chainlinkLayerType.validate!(props);
    expect(errors).not.toBeNull();
    expect(errors!.some(e => e.property === "region")).toBe(true);
  });

  it("renders with rotation", () => {
    const ctx = mockCtx();
    const props = { ...chainlinkLayerType.createDefault(), rotation: 45 };
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
    expect(ctx.rotate).toHaveBeenCalled();
  });

  it("renders with custom opacity", () => {
    const ctx = mockCtx();
    const props = { ...chainlinkLayerType.createDefault(), opacity: 0.5 };
    expect(() => chainlinkLayerType.render(props, ctx, bounds, resources)).not.toThrow();
  });
});
