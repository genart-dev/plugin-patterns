import { describe, it, expect } from "vitest";
import patternsPlugin from "../src/index.js";

describe("patternsPlugin", () => {
  it("has id 'patterns'", () => {
    expect(patternsPlugin.id).toBe("patterns");
  });

  it("registers 29 layer types", () => {
    expect(patternsPlugin.layerTypes).toHaveLength(29);
  });

  it("registers all expected typeIds", () => {
    const ids = patternsPlugin.layerTypes.map((lt) => lt.typeId);
    expect(ids).toContain("patterns:fill");
    expect(ids).toContain("patterns:stripe");
    expect(ids).toContain("patterns:dot");
    expect(ids).toContain("patterns:checker");
    expect(ids).toContain("patterns:wave");
    expect(ids).toContain("patterns:crosshatch-geo");
    expect(ids).toContain("patterns:herringbone");
    expect(ids).toContain("patterns:tile");
    expect(ids).toContain("patterns:custom");
    expect(ids).toContain("patterns:triangle");
    expect(ids).toContain("patterns:diamond");
    expect(ids).toContain("patterns:hexagon");
    expect(ids).toContain("patterns:star");
    expect(ids).toContain("patterns:circle");
    expect(ids).toContain("patterns:japanese");
    expect(ids).toContain("patterns:lattice");
    expect(ids).toContain("patterns:plaid");
    expect(ids).toContain("patterns:cube");
    expect(ids).toContain("patterns:leaf");
    expect(ids).toContain("patterns:floral");
    expect(ids).toContain("patterns:memphis");
    expect(ids).toContain("patterns:eye");
    expect(ids).toContain("patterns:spiral");
    expect(ids).toContain("patterns:terrazzo");
    expect(ids).toContain("patterns:square");
    expect(ids).toContain("patterns:octagon");
    expect(ids).toContain("patterns:scale");
    expect(ids).toContain("patterns:chainlink");
    expect(ids).toContain("patterns:ethnic");
  });

  it("registers 7 MCP tools", () => {
    expect(patternsPlugin.mcpTools).toHaveLength(7);
  });

  it("MCP tools have unique names", () => {
    const names = patternsPlugin.mcpTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all layer types have propertyEditorId", () => {
    for (const lt of patternsPlugin.layerTypes) {
      expect(lt.propertyEditorId).toBeTruthy();
    }
  });

  it("all layer types have category 'draw'", () => {
    for (const lt of patternsPlugin.layerTypes) {
      expect(lt.category).toBe("draw");
    }
  });
});
