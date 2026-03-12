import type {
  McpToolDefinition,
  McpToolContext,
  McpToolResult,
  JsonSchema,
  DesignLayer,
  LayerTransform,
} from "@genart-dev/core";
import { fillLayerType } from "./layers/fill.js";
import { stripeLayerType } from "./layers/stripe.js";
import { dotLayerType } from "./layers/dot.js";
import { checkerLayerType } from "./layers/checker.js";
import { waveLayerType } from "./layers/wave.js";
import { crosshatchGeoLayerType } from "./layers/crosshatch-geo.js";
import { herringboneLayerType } from "./layers/herringbone.js";
import { tileLayerType } from "./layers/tile.js";
import { customLayerType } from "./layers/custom.js";
import {
  PATTERN_PRESETS,
  GEOMETRIC_PRESETS,
  getPatternPreset,
  getGeometricPreset,
} from "./core/presets.js";
import type { CustomPatternDef, DrawCommand } from "./core/types.js";

function textResult(text: string): McpToolResult {
  return { content: [{ type: "text", text }] };
}

function errorResult(text: string): McpToolResult {
  return { content: [{ type: "text", text }], isError: true };
}

function generateLayerId(): string {
  return `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function fullCanvasTransform(ctx: McpToolContext): LayerTransform {
  return {
    x: 0,
    y: 0,
    width: ctx.canvasWidth,
    height: ctx.canvasHeight,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    anchorX: 0,
    anchorY: 0,
  };
}

// Layer type lookup by typeId
const LAYER_TYPES: Record<string, typeof fillLayerType> = {
  "patterns:fill": fillLayerType,
  "patterns:stripe": stripeLayerType,
  "patterns:dot": dotLayerType,
  "patterns:checker": checkerLayerType,
  "patterns:wave": waveLayerType,
  "patterns:crosshatch-geo": crosshatchGeoLayerType,
  "patterns:herringbone": herringboneLayerType,
  "patterns:tile": tileLayerType,
  "patterns:custom": customLayerType,
};

const ALL_LAYER_TYPE_IDS = Object.keys(LAYER_TYPES);

// ---------------------------------------------------------------------------
// 1. list_pattern_presets
// ---------------------------------------------------------------------------

export const listPatternPresetsTool: McpToolDefinition = {
  name: "list_pattern_presets",
  description:
    "List all available pattern presets grouped by category, with descriptions. " +
    "Use this to discover presets before adding a pattern layer.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["fill", "stripe", "dot", "checker", "wave", "crosshatch-geo", "herringbone", "tile", "all"],
        description: 'Filter by category. Default: "all".',
      },
    },
  } satisfies JsonSchema,

  async handler(input: Record<string, unknown>): Promise<McpToolResult> {
    const category = (input.category as string) ?? "all";

    const groups: Record<string, Record<string, unknown>> = {};

    if (category === "all" || category === "fill") {
      groups["fill (patterns:fill)"] = {};
      for (const [name, preset] of Object.entries(PATTERN_PRESETS)) {
        groups["fill (patterns:fill)"]![name] = {
          strategy: preset.strategy.type,
          lineWidth: preset.lineWidth,
        };
      }
    }

    if (category === "all" || category !== "fill") {
      for (const [name, preset] of Object.entries(GEOMETRIC_PRESETS)) {
        const lt = preset.layerType;
        const cat = lt.replace("patterns:", "");
        if (category !== "all" && category !== cat) continue;
        const groupKey = `${cat} (${lt})`;
        if (!groups[groupKey]) groups[groupKey] = {};
        groups[groupKey]![name] = { ...preset };
      }
    }

    const totalCount =
      Object.values(groups).reduce((sum, g) => sum + Object.keys(g).length, 0);

    return textResult(
      JSON.stringify({ totalPresets: totalCount, groups }, null, 2),
    );
  },
};

// ---------------------------------------------------------------------------
// 2. add_pattern
// ---------------------------------------------------------------------------

export const addPatternTool: McpToolDefinition = {
  name: "add_pattern",
  description:
    "Add a pattern layer to the sketch. Specify a layer type and either a preset name or manual properties. " +
    "Layer types: patterns:fill, patterns:stripe, patterns:dot, patterns:checker, patterns:wave, " +
    "patterns:crosshatch-geo, patterns:herringbone, patterns:tile, patterns:custom.",
  inputSchema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ALL_LAYER_TYPE_IDS,
        description: "Pattern layer type.",
      },
      preset: {
        type: "string",
        description: "Preset name (from list_pattern_presets). If provided, properties from the preset are used as defaults.",
      },
      properties: {
        type: "object",
        description: "Manual property overrides (key-value pairs). These override preset values.",
        additionalProperties: true,
      },
      name: {
        type: "string",
        description: "Layer name (default: auto-generated from type/preset).",
      },
      opacity: {
        type: "number",
        description: "Layer opacity 0–1 (default: 1).",
      },
      index: {
        type: "number",
        description: "Layer stack position (default: top).",
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const presetName = input.preset as string | undefined;
    let layerTypeId = input.type as string | undefined;
    const manualProps = (input.properties as Record<string, unknown>) ?? {};
    const layerName = input.name as string | undefined;
    const opacity = input.opacity as number | undefined;
    const index = input.index as number | undefined;

    // Resolve preset → determine layer type + base properties
    let baseProps: Record<string, unknown> = {};

    if (presetName) {
      // Try fill presets first
      const fillPreset = getPatternPreset(presetName);
      if (fillPreset) {
        layerTypeId = layerTypeId ?? "patterns:fill";
        baseProps = {
          strategy: JSON.stringify(fillPreset.strategy),
          lineWidth: fillPreset.lineWidth,
        };
      } else {
        // Try geometric presets
        const geoPreset = getGeometricPreset(presetName);
        if (geoPreset) {
          layerTypeId = layerTypeId ?? geoPreset.layerType;
          // Spread preset values, converting arrays/objects to JSON strings
          for (const [key, value] of Object.entries(geoPreset)) {
            if (key === "layerType") continue;
            if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
              baseProps[key] = JSON.stringify(value);
            } else {
              baseProps[key] = value;
            }
          }
        } else {
          return errorResult(
            `Unknown preset "${presetName}". Use list_pattern_presets to see available presets.`,
          );
        }
      }
    }

    if (!layerTypeId) {
      return errorResult(
        "Either type or preset must be specified.",
      );
    }

    const layerTypeDef = LAYER_TYPES[layerTypeId];
    if (!layerTypeDef) {
      return errorResult(
        `Unknown layer type "${layerTypeId}". Valid types: ${ALL_LAYER_TYPE_IDS.join(", ")}`,
      );
    }

    // Build properties: defaults → preset → manual overrides
    const defaults = layerTypeDef.createDefault();
    const properties: Record<string, unknown> = { ...defaults };

    // Apply preset values
    for (const [key, value] of Object.entries(baseProps)) {
      properties[key] = value;
    }

    // Apply manual overrides (convert objects/arrays to JSON strings for string properties)
    for (const [key, value] of Object.entries(manualProps)) {
      if (typeof value === "object" && value !== null) {
        properties[key] = JSON.stringify(value);
      } else {
        properties[key] = value;
      }
    }

    if (opacity !== undefined) {
      properties.opacity = opacity;
    }

    const layerId = generateLayerId();
    const displayName =
      layerName ?? (presetName ? `${presetName}` : layerTypeDef.displayName);

    const layer: DesignLayer = {
      id: layerId,
      type: layerTypeId,
      name: displayName,
      visible: true,
      locked: false,
      opacity: (opacity as number) ?? 1,
      blendMode: "normal",
      transform: fullCanvasTransform(context),
      properties: properties as Record<string, string | number | boolean | null>,
    };

    context.layers.add(layer, index);
    context.emitChange("layer-added");

    return textResult(
      JSON.stringify({
        layerId,
        type: layerTypeId,
        preset: presetName ?? null,
        name: displayName,
      }),
    );
  },
};

// ---------------------------------------------------------------------------
// 3. update_pattern
// ---------------------------------------------------------------------------

export const updatePatternTool: McpToolDefinition = {
  name: "update_pattern",
  description:
    "Update properties of an existing pattern layer by layer ID.",
  inputSchema: {
    type: "object",
    required: ["layerId"],
    properties: {
      layerId: {
        type: "string",
        description: "The ID of the pattern layer to update.",
      },
      properties: {
        type: "object",
        description: "Property key-value pairs to update. Objects/arrays will be JSON-stringified.",
        additionalProperties: true,
      },
      opacity: {
        type: "number",
        description: "Layer opacity 0–1.",
      },
      visible: {
        type: "boolean",
        description: "Layer visibility.",
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const layerId = input.layerId as string;
    const propsInput = (input.properties as Record<string, unknown>) ?? {};
    const opacity = input.opacity as number | undefined;
    const visible = input.visible as boolean | undefined;

    const layer = context.layers.get(layerId);
    if (!layer) {
      return errorResult(`Layer "${layerId}" not found.`);
    }

    if (!layer.type.startsWith("patterns:")) {
      return errorResult(`Layer "${layerId}" is not a pattern layer (type: ${layer.type}).`);
    }

    // Convert objects/arrays to JSON strings
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(propsInput)) {
      if (typeof value === "object" && value !== null) {
        updates[key] = JSON.stringify(value);
      } else {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      context.layers.updateProperties(
        layerId,
        updates as Record<string, string | number | boolean | null>,
      );
    }

    if (opacity !== undefined || visible !== undefined) {
      const meta: Record<string, unknown> = {};
      if (visible !== undefined) meta.visible = visible;
      if (opacity !== undefined) {
        context.layers.updateBlend(layerId, undefined, opacity);
      }
      if (visible !== undefined) {
        context.layers.updateMeta(layerId, { visible });
      }
    }

    context.emitChange("layer-updated");

    return textResult(
      JSON.stringify({ layerId, updated: Object.keys(updates) }),
    );
  },
};

// ---------------------------------------------------------------------------
// 4. set_pattern_region
// ---------------------------------------------------------------------------

export const setPatternRegionTool: McpToolDefinition = {
  name: "set_pattern_region",
  description:
    "Set the clip region for a pattern layer. Supports bounds (full layer), rect, ellipse, and polygon regions.",
  inputSchema: {
    type: "object",
    required: ["layerId", "region"],
    properties: {
      layerId: {
        type: "string",
        description: "The ID of the pattern layer.",
      },
      region: {
        type: "object",
        description:
          'Region object. Examples: {"type":"bounds"}, ' +
          '{"type":"rect","x":10,"y":10,"width":200,"height":200}, ' +
          '{"type":"ellipse","cx":150,"cy":150,"rx":100,"ry":80}, ' +
          '{"type":"polygon","points":[{"x":0,"y":0},{"x":200,"y":0},{"x":100,"y":200}]}',
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const layerId = input.layerId as string;
    const region = input.region as Record<string, unknown>;

    const layer = context.layers.get(layerId);
    if (!layer) return errorResult(`Layer "${layerId}" not found.`);
    if (!layer.type.startsWith("patterns:"))
      return errorResult(`Layer "${layerId}" is not a pattern layer.`);

    const regionType = region?.type as string;
    if (!["bounds", "rect", "ellipse", "polygon"].includes(regionType)) {
      return errorResult(
        `Invalid region type "${regionType}". Must be: bounds, rect, ellipse, polygon.`,
      );
    }

    context.layers.updateProperties(layerId, {
      region: JSON.stringify(region),
    });
    context.emitChange("layer-updated");

    return textResult(
      JSON.stringify({ layerId, region: regionType }),
    );
  },
};

// ---------------------------------------------------------------------------
// 5. set_pattern_shading
// ---------------------------------------------------------------------------

export const setPatternShadingTool: McpToolDefinition = {
  name: "set_pattern_shading",
  description:
    "Set value-based shading on a patterns:fill layer. Shading varies opacity/density/weight " +
    "spatially using uniform, linear, radial, noise, or algorithm-driven functions.",
  inputSchema: {
    type: "object",
    required: ["layerId", "shading"],
    properties: {
      layerId: {
        type: "string",
        description: "The ID of a patterns:fill layer.",
      },
      shading: {
        type: "object",
        description:
          'Shading function. Examples: {"type":"uniform"}, ' +
          '{"type":"linear","angle":0,"range":[0.2,1.0]}, ' +
          '{"type":"radial","cx":0.5,"cy":0.5,"range":[0.1,1.0]}, ' +
          '{"type":"noise","seed":42,"scale":0.02,"range":[0.3,1.0]}, ' +
          '{"type":"algorithm","channel":"values","range":[0.0,1.0]}',
      },
      affects: {
        type: "array",
        items: { type: "string", enum: ["density", "weight", "opacity"] },
        description: 'What the shading modulates. Default: ["density"].',
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const layerId = input.layerId as string;
    const shading = input.shading as Record<string, unknown>;
    const affects = (input.affects as string[]) ?? ["density"];

    const layer = context.layers.get(layerId);
    if (!layer) return errorResult(`Layer "${layerId}" not found.`);
    if (layer.type !== "patterns:fill") {
      return errorResult(
        `Shading is only supported on patterns:fill layers (this layer is ${layer.type}).`,
      );
    }

    const shadingType = shading?.type as string;
    if (!["uniform", "linear", "radial", "noise", "algorithm"].includes(shadingType)) {
      return errorResult(
        `Invalid shading type "${shadingType}". Must be: uniform, linear, radial, noise, algorithm.`,
      );
    }

    context.layers.updateProperties(layerId, {
      shading: JSON.stringify(shading),
      shadingAffects: JSON.stringify(affects),
    });
    context.emitChange("layer-updated");

    return textResult(
      JSON.stringify({ layerId, shading: shadingType, affects }),
    );
  },
};

// ---------------------------------------------------------------------------
// 6. tile_pattern
// ---------------------------------------------------------------------------

export const tilePatternTool: McpToolDefinition = {
  name: "tile_pattern",
  description:
    "Configure seamless tiling for a patterns:tile layer — set tile shape, size, gap, rotation, and colors.",
  inputSchema: {
    type: "object",
    required: ["layerId"],
    properties: {
      layerId: {
        type: "string",
        description: "The ID of a patterns:tile layer.",
      },
      tileShape: {
        type: "string",
        enum: ["brick", "basketweave", "hex", "scale", "moroccan"],
        description: "Tile geometry.",
      },
      size: {
        type: "number",
        description: "Tile size in pixels (8–200).",
      },
      gap: {
        type: "number",
        description: "Gap between tiles in pixels (0–20).",
      },
      rotation: {
        type: "number",
        description: "Pattern rotation in degrees (0–360).",
      },
      color1: {
        type: "string",
        description: "Primary tile color (hex).",
      },
      color2: {
        type: "string",
        description: "Background/mortar color (hex).",
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const layerId = input.layerId as string;

    const layer = context.layers.get(layerId);
    if (!layer) return errorResult(`Layer "${layerId}" not found.`);
    if (layer.type !== "patterns:tile") {
      return errorResult(
        `tile_pattern only works on patterns:tile layers (this is ${layer.type}). ` +
        "Use update_pattern for other layer types.",
      );
    }

    const updates: Record<string, string | number | boolean | null> = {};
    if (input.tileShape !== undefined) updates.tileShape = input.tileShape as string;
    if (input.size !== undefined) updates.size = input.size as number;
    if (input.gap !== undefined) updates.gap = input.gap as number;
    if (input.rotation !== undefined) updates.rotation = input.rotation as number;
    if (input.color1 !== undefined) updates.color1 = input.color1 as string;
    if (input.color2 !== undefined) updates.color2 = input.color2 as string;

    if (Object.keys(updates).length === 0) {
      return errorResult("No properties specified to update.");
    }

    context.layers.updateProperties(layerId, updates);
    context.emitChange("layer-updated");

    return textResult(
      JSON.stringify({ layerId, updated: Object.keys(updates) }),
    );
  },
};

// ---------------------------------------------------------------------------
// 7. create_pattern
// ---------------------------------------------------------------------------

const MAX_COMMANDS = 200;
const MAX_PATTERN_SIZE = 10240; // 10KB

const VALID_COMMAND_TYPES = ["line", "circle", "rect", "arc", "path", "polygon"];

function validateCommands(commands: unknown[]): string | null {
  if (!Array.isArray(commands)) return "commands must be an array";
  if (commands.length > MAX_COMMANDS) return `commands exceeds limit of ${MAX_COMMANDS}`;

  const serialized = JSON.stringify(commands);
  if (serialized.length > MAX_PATTERN_SIZE) {
    return `pattern data exceeds ${MAX_PATTERN_SIZE} bytes (got ${serialized.length})`;
  }

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i] as Record<string, unknown>;
    if (!cmd || typeof cmd !== "object") return `command[${i}] is not an object`;
    if (!VALID_COMMAND_TYPES.includes(cmd.type as string)) {
      return `command[${i}] has invalid type "${cmd.type}". Valid: ${VALID_COMMAND_TYPES.join(", ")}`;
    }
  }

  return null;
}

export const createPatternTool: McpToolDefinition = {
  name: "create_pattern",
  description:
    "Create a custom repeating pattern from drawing commands. The pattern is stored in the sketch " +
    "and can be used by a patterns:custom layer via its patternId. " +
    "Commands: line, circle, rect, arc, path, polygon. Max 200 commands, 10KB limit. " +
    "Coordinates are in unit-cell space (0 to width/height).",
  inputSchema: {
    type: "object",
    required: ["name", "width", "height", "commands"],
    properties: {
      name: {
        type: "string",
        description: "Human-readable name for the pattern.",
      },
      width: {
        type: "number",
        description: "Unit cell width (local coordinates).",
      },
      height: {
        type: "number",
        description: "Unit cell height (local coordinates).",
      },
      commands: {
        type: "array",
        description:
          'Drawing commands array. Examples: ' +
          '{"type":"line","x1":0,"y1":0,"x2":20,"y2":20,"lineWidth":1}, ' +
          '{"type":"circle","cx":10,"cy":10,"r":5,"fill":true}, ' +
          '{"type":"rect","x":0,"y":0,"width":10,"height":10,"fill":true}, ' +
          '{"type":"arc","cx":10,"cy":10,"r":8,"startAngle":0,"endAngle":3.14}, ' +
          '{"type":"path","points":[{"x":0,"y":0},{"x":10,"y":5},{"x":0,"y":10}],"closed":true,"fill":true}, ' +
          '{"type":"polygon","points":[{"x":0,"y":0},{"x":10,"y":0},{"x":5,"y":10}],"fill":true}',
        items: { type: "object" },
      },
      addLayer: {
        type: "boolean",
        description: "Also add a patterns:custom layer using this pattern (default: true).",
      },
    },
  } satisfies JsonSchema,

  async handler(
    input: Record<string, unknown>,
    context: McpToolContext,
  ): Promise<McpToolResult> {
    const name = input.name as string;
    const width = input.width as number;
    const height = input.height as number;
    const commands = input.commands as unknown[];
    const addLayer = (input.addLayer as boolean) ?? true;

    if (!name || typeof name !== "string") {
      return errorResult("name is required and must be a string.");
    }
    if (!width || width <= 0) return errorResult("width must be positive.");
    if (!height || height <= 0) return errorResult("height must be positive.");

    const validationError = validateCommands(commands);
    if (validationError) return errorResult(validationError);

    // Generate a unique pattern ID
    const patternId = `pat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const patternDef: CustomPatternDef = {
      id: patternId,
      name,
      width,
      height,
      commands: commands as DrawCommand[],
    };

    // Store in sketch's thirdParty (patterns namespace)
    const thirdParty = [...context.sketch.getThirdParty()];
    let patternsEntry = thirdParty.find(
      (e) => (e as Record<string, unknown>).__namespace === "patterns",
    ) as Record<string, unknown> | undefined;

    if (!patternsEntry) {
      patternsEntry = { __namespace: "patterns", patterns: {} };
      thirdParty.push(patternsEntry);
    }

    const patterns = (patternsEntry.patterns ?? {}) as Record<string, unknown>;
    patterns[patternId] = patternDef;
    patternsEntry.patterns = patterns;

    context.sketch.setThirdParty(thirdParty);

    let layerId: string | null = null;

    if (addLayer) {
      layerId = generateLayerId();
      const defaults = customLayerType.createDefault();

      const layer: DesignLayer = {
        id: layerId,
        type: "patterns:custom",
        name: name,
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: "normal",
        transform: fullCanvasTransform(context),
        properties: {
          ...defaults,
          patternId,
        },
      };

      context.layers.add(layer);
      context.emitChange("layer-added");
    }

    context.emitChange("sketch-updated");

    return textResult(
      JSON.stringify({
        patternId,
        name,
        width,
        height,
        commandCount: commands.length,
        layerId,
      }),
    );
  },
};

// ---------------------------------------------------------------------------
// Export all tools
// ---------------------------------------------------------------------------

export const patternMcpTools: McpToolDefinition[] = [
  listPatternPresetsTool,
  addPatternTool,
  updatePatternTool,
  setPatternRegionTool,
  setPatternShadingTool,
  tilePatternTool,
  createPatternTool,
];
