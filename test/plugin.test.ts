import { describe, it, expect } from "vitest";
import patternsPlugin from "../src/index.js";

describe("patternsPlugin", () => {
  it("has id 'patterns'", () => {
    expect(patternsPlugin.id).toBe("patterns");
  });

  it("registers 5 layer types", () => {
    expect(patternsPlugin.layerTypes).toHaveLength(5);
  });

  it("registers all expected typeIds", () => {
    const ids = patternsPlugin.layerTypes.map((lt) => lt.typeId);
    expect(ids).toContain("patterns:fill");
    expect(ids).toContain("patterns:stripe");
    expect(ids).toContain("patterns:dot");
    expect(ids).toContain("patterns:checker");
    expect(ids).toContain("patterns:wave");
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
