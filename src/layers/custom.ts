import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import type { PatternRegion, CustomPatternDef, DrawCommand } from "../core/types.js";
import { applyRegionClip } from "../core/region-utils.js";

// ---------------------------------------------------------------------------
// Property schema
// ---------------------------------------------------------------------------

const CUSTOM_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "patternId",
    label: "Pattern ID",
    type: "string",
    default: "",
    group: "custom",
  },
  {
    key: "scale",
    label: "Scale",
    type: "number",
    default: 1,
    min: 0.1,
    max: 10,
    step: 0.1,
    group: "custom",
  },
  {
    key: "rotation",
    label: "Rotation",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
    group: "custom",
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    default: "#000000",
    group: "custom",
  },
  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    default: "#ffffff",
    group: "custom",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "custom",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "custom",
  },
];

// ---------------------------------------------------------------------------
// Draw command renderer
// ---------------------------------------------------------------------------

function renderDrawCommand(
  ctx: CanvasRenderingContext2D,
  cmd: DrawCommand,
  color: string,
): void {
  switch (cmd.type) {
    case "line":
      ctx.beginPath();
      ctx.moveTo(cmd.x1, cmd.y1);
      ctx.lineTo(cmd.x2, cmd.y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = cmd.lineWidth ?? 1;
      ctx.stroke();
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(cmd.cx, cmd.cy, cmd.r, 0, Math.PI * 2);
      if (cmd.fill !== false) {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (cmd.stroke !== false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.stroke();
      }
      break;
    case "rect":
      if (cmd.fill !== false) {
        ctx.fillStyle = color;
        ctx.fillRect(cmd.x, cmd.y, cmd.width, cmd.height);
      }
      if (cmd.stroke !== false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.strokeRect(cmd.x, cmd.y, cmd.width, cmd.height);
      }
      break;
    case "arc":
      ctx.beginPath();
      ctx.arc(cmd.cx, cmd.cy, cmd.r, cmd.startAngle, cmd.endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = cmd.lineWidth ?? 1;
      ctx.stroke();
      break;
    case "path": {
      if (cmd.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(cmd.points[0]!.x, cmd.points[0]!.y);
      for (let i = 1; i < cmd.points.length; i++) {
        ctx.lineTo(cmd.points[i]!.x, cmd.points[i]!.y);
      }
      if (cmd.closed) ctx.closePath();
      if (cmd.fill) {
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = cmd.lineWidth ?? 1;
      ctx.stroke();
      break;
    }
    case "polygon": {
      if (cmd.points.length < 3) break;
      ctx.beginPath();
      ctx.moveTo(cmd.points[0]!.x, cmd.points[0]!.y);
      for (let i = 1; i < cmd.points.length; i++) {
        ctx.lineTo(cmd.points[i]!.x, cmd.points[i]!.y);
      }
      ctx.closePath();
      if (cmd.fill !== false) {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (cmd.stroke !== false) {
        ctx.strokeStyle = color;
        ctx.lineWidth = cmd.lineWidth ?? 1;
        ctx.stroke();
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Resolve custom pattern from sketch data
// ---------------------------------------------------------------------------

function resolvePattern(patternId: string): CustomPatternDef | null {
  // Custom patterns are stored in globalThis.__genart_patterns (injected by compositor)
  const patterns =
    (globalThis as Record<string, unknown>).__genart_patterns as
      Record<string, CustomPatternDef> | undefined;
  if (!patterns) return null;
  return patterns[patternId] ?? null;
}

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const customLayerType: LayerTypeDefinition = {
  typeId: "patterns:custom",
  displayName: "Custom Pattern",
  icon: "pencil",
  category: "draw",
  properties: CUSTOM_PROPERTIES,
  propertyEditorId: "patterns:custom-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of CUSTOM_PROPERTIES) {
      props[schema.key] = schema.default;
    }
    return props;
  },

  render(
    properties: LayerProperties,
    ctx: CanvasRenderingContext2D,
    bounds: LayerBounds,
    _resources: RenderResources,
  ): void {
    const w = Math.ceil(bounds.width);
    const h = Math.ceil(bounds.height);
    if (w <= 0 || h <= 0) return;

    const patternId = (properties.patternId as string) ?? "";
    const scale = (properties.scale as number) ?? 1;
    const rotation = ((properties.rotation as number) ?? 0) * (Math.PI / 180);
    const color = (properties.color as string) ?? "#000000";
    const backgroundColor = (properties.backgroundColor as string) ?? "#ffffff";
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    if (!patternId) {
      // No pattern defined — draw placeholder crosshatch
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = layerOpacity * 0.3;
      const spacing = 20;
      for (let i = 0; i < bounds.width + bounds.height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(bounds.x + i, bounds.y);
        ctx.lineTo(bounds.x, bounds.y + i);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    const pattern = resolvePattern(patternId);
    if (!pattern) {
      ctx.restore();
      return;
    }

    const unitW = pattern.width * scale;
    const unitH = pattern.height * scale;
    if (unitW <= 0 || unitH <= 0) {
      ctx.restore();
      return;
    }

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);

    const cols = Math.ceil((2 * diagonal) / unitW) + 2;
    const rows = Math.ceil((2 * diagonal) / unitH) + 2;
    const halfW = (cols * unitW) / 2;
    const halfH = (rows * unitH) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileX = -halfW + col * unitW;
        const tileY = -halfH + row * unitH;

        ctx.save();
        ctx.translate(tileX, tileY);
        ctx.scale(scale, scale);

        for (const cmd of pattern.commands) {
          renderDrawCommand(ctx, cmd, color);
        }

        ctx.restore();
      }
    }

    ctx.restore();
    ctx.restore();
  },

  validate(properties: LayerProperties): ValidationError[] | null {
    const errors: ValidationError[] = [];

    const regionVal = properties.region;
    if (typeof regionVal === "string" && regionVal.trim() !== "") {
      try {
        JSON.parse(regionVal);
      } catch {
        errors.push({ property: "region", message: "region must be valid JSON" });
      }
    }

    return errors.length > 0 ? errors : null;
  },
};
