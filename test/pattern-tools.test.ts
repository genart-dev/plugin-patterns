import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listPatternPresetsTool,
  addPatternTool,
  updatePatternTool,
  setPatternRegionTool,
  setPatternShadingTool,
  tilePatternTool,
  createPatternTool,
  patternMcpTools,
} from "../src/pattern-tools.js";

// Mock McpToolContext
function createMockContext(layers: Record<string, unknown>[] = []) {
  const layerMap = new Map<string, Record<string, unknown>>();
  for (const l of layers) {
    layerMap.set(l.id as string, l);
  }

  let thirdParty: Record<string, unknown>[] = [];

  return {
    canvasWidth: 600,
    canvasHeight: 600,
    layers: {
      getAll: vi.fn(() => [...layerMap.values()]),
      get: vi.fn((id: string) => layerMap.get(id) ?? null),
      add: vi.fn((layer: Record<string, unknown>, index?: number) => {
        layerMap.set(layer.id as string, layer);
      }),
      remove: vi.fn((id: string) => layerMap.delete(id)),
      updateProperties: vi.fn((id: string, props: Record<string, unknown>) => {
        const layer = layerMap.get(id);
        if (layer) {
          layer.properties = { ...(layer.properties as Record<string, unknown>), ...props };
        }
      }),
      updateBlend: vi.fn(),
      updateMeta: vi.fn(),
      updateTransform: vi.fn(),
      reorder: vi.fn(),
      duplicate: vi.fn(),
      count: layerMap.size,
    },
    sketchState: {
      seed: 42,
      params: {},
      colorPalette: [],
      canvasWidth: 600,
      canvasHeight: 600,
      rendererId: "canvas2d",
    },
    sketch: {
      getThirdParty: vi.fn(() => thirdParty),
      setThirdParty: vi.fn((tp: Record<string, unknown>[]) => { thirdParty = tp; }),
      getSymbols: vi.fn(() => ({})),
      setSymbols: vi.fn(),
      getComponents: vi.fn(() => ({})),
      setComponents: vi.fn(),
      getRenderer: vi.fn(() => "canvas2d"),
      getGenartVersion: vi.fn(() => "1.0"),
      setGenartVersion: vi.fn(),
    },
    resolveAsset: vi.fn(async () => null),
    captureComposite: vi.fn(async () => Buffer.from("")),
    emitChange: vi.fn(),
  };
}

describe("patternMcpTools", () => {
  it("exports 7 tools", () => {
    expect(patternMcpTools).toHaveLength(7);
  });

  it("all tools have name, description, inputSchema, handler", () => {
    for (const tool of patternMcpTools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeTruthy();
      expect(typeof tool.handler).toBe("function");
    }
  });
});

describe("list_pattern_presets", () => {
  it("returns all presets when category is 'all'", async () => {
    const ctx = createMockContext();
    const result = await listPatternPresetsTool.handler({ category: "all" }, ctx as any);
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.totalPresets).toBeGreaterThan(30);
  });

  it("filters by category", async () => {
    const ctx = createMockContext();
    const result = await listPatternPresetsTool.handler({ category: "tile" }, ctx as any);
    const data = JSON.parse(result.content[0]!.text);
    expect(data.totalPresets).toBe(8);
  });

  it("returns fill presets when category is 'fill'", async () => {
    const ctx = createMockContext();
    const result = await listPatternPresetsTool.handler({ category: "fill" }, ctx as any);
    const data = JSON.parse(result.content[0]!.text);
    expect(data.totalPresets).toBe(11);
  });
});

describe("add_pattern", () => {
  it("adds a layer from a fill preset", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler(
      { preset: "hatch-light" },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.type).toBe("patterns:fill");
    expect(data.preset).toBe("hatch-light");
    expect(ctx.layers.add).toHaveBeenCalled();
  });

  it("adds a layer from a geometric preset", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler(
      { preset: "brick" },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.type).toBe("patterns:tile");
  });

  it("adds a layer by type with manual properties", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler(
      { type: "patterns:stripe", properties: { angle: 90, spacing: 15 } },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.type).toBe("patterns:stripe");
  });

  it("errors on unknown preset", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler(
      { preset: "nonexistent-preset" },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors when neither type nor preset given", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler({}, ctx as any);
    expect(result.isError).toBe(true);
  });

  it("errors on unknown layer type", async () => {
    const ctx = createMockContext();
    const result = await addPatternTool.handler(
      { type: "patterns:unknown" },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});

describe("update_pattern", () => {
  it("updates layer properties", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:stripe", properties: { angle: 0 } },
    ]);
    const result = await updatePatternTool.handler(
      { layerId: "layer-1", properties: { angle: 45 } },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    expect(ctx.layers.updateProperties).toHaveBeenCalledWith("layer-1", { angle: 45 });
  });

  it("errors on missing layer", async () => {
    const ctx = createMockContext();
    const result = await updatePatternTool.handler(
      { layerId: "missing", properties: { angle: 45 } },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors on non-pattern layer", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "composite:solid", properties: {} },
    ]);
    const result = await updatePatternTool.handler(
      { layerId: "layer-1", properties: { angle: 45 } },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});

describe("set_pattern_region", () => {
  it("sets a rect region", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:fill", properties: {} },
    ]);
    const result = await setPatternRegionTool.handler(
      { layerId: "layer-1", region: { type: "rect", x: 10, y: 10, width: 100, height: 100 } },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    expect(ctx.layers.updateProperties).toHaveBeenCalled();
  });

  it("errors on invalid region type", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:fill", properties: {} },
    ]);
    const result = await setPatternRegionTool.handler(
      { layerId: "layer-1", region: { type: "invalid" } },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});

describe("set_pattern_shading", () => {
  it("sets linear shading on fill layer", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:fill", properties: {} },
    ]);
    const result = await setPatternShadingTool.handler(
      { layerId: "layer-1", shading: { type: "linear", angle: 0, range: [0.2, 1] } },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
  });

  it("errors on non-fill layer", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:stripe", properties: {} },
    ]);
    const result = await setPatternShadingTool.handler(
      { layerId: "layer-1", shading: { type: "uniform" } },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors on invalid shading type", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:fill", properties: {} },
    ]);
    const result = await setPatternShadingTool.handler(
      { layerId: "layer-1", shading: { type: "invalid" } },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});

describe("tile_pattern", () => {
  it("updates tile layer properties", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:tile", properties: { tileShape: "brick" } },
    ]);
    const result = await tilePatternTool.handler(
      { layerId: "layer-1", tileShape: "hex", size: 30 },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    expect(ctx.layers.updateProperties).toHaveBeenCalled();
  });

  it("errors on non-tile layer", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:stripe", properties: {} },
    ]);
    const result = await tilePatternTool.handler(
      { layerId: "layer-1", tileShape: "hex" },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors when no properties specified", async () => {
    const ctx = createMockContext([
      { id: "layer-1", type: "patterns:tile", properties: {} },
    ]);
    const result = await tilePatternTool.handler(
      { layerId: "layer-1" },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});

describe("create_pattern", () => {
  it("creates a custom pattern and adds a layer", async () => {
    const ctx = createMockContext();
    const result = await createPatternTool.handler(
      {
        name: "Test Grid",
        width: 20,
        height: 20,
        commands: [
          { type: "line", x1: 0, y1: 0, x2: 20, y2: 20 },
          { type: "circle", cx: 10, cy: 10, r: 5, fill: true },
        ],
      },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.patternId).toBeTruthy();
    expect(data.commandCount).toBe(2);
    expect(data.layerId).toBeTruthy();
    expect(ctx.layers.add).toHaveBeenCalled();
    expect(ctx.sketch.setThirdParty).toHaveBeenCalled();
  });

  it("creates pattern without adding layer when addLayer=false", async () => {
    const ctx = createMockContext();
    const result = await createPatternTool.handler(
      {
        name: "No Layer",
        width: 10,
        height: 10,
        commands: [{ type: "rect", x: 0, y: 0, width: 10, height: 10, fill: true }],
        addLayer: false,
      },
      ctx as any,
    );
    expect(result.isError).toBeFalsy();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.layerId).toBeNull();
    expect(ctx.layers.add).not.toHaveBeenCalled();
  });

  it("errors on invalid width", async () => {
    const ctx = createMockContext();
    const result = await createPatternTool.handler(
      { name: "Bad", width: 0, height: 10, commands: [] },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors on too many commands", async () => {
    const ctx = createMockContext();
    const commands = Array.from({ length: 201 }, () => ({ type: "line", x1: 0, y1: 0, x2: 1, y2: 1 }));
    const result = await createPatternTool.handler(
      { name: "TooMany", width: 10, height: 10, commands },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });

  it("errors on invalid command type", async () => {
    const ctx = createMockContext();
    const result = await createPatternTool.handler(
      { name: "Bad", width: 10, height: 10, commands: [{ type: "invalid" }] },
      ctx as any,
    );
    expect(result.isError).toBe(true);
  });
});
