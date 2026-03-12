import type {
  LayerTypeDefinition,
  LayerPropertySchema,
  LayerProperties,
  LayerBounds,
  RenderResources,
  ValidationError,
} from "@genart-dev/core";
import type { PatternRegion } from "../core/types.js";
import { applyRegionClip } from "../core/region-utils.js";

// ---------------------------------------------------------------------------
// Property schema
// ---------------------------------------------------------------------------

const HERRINGBONE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "blockWidth",
    label: "Block Width",
    type: "number",
    default: 30,
    min: 4,
    max: 200,
    step: 1,
    group: "herringbone",
  },
  {
    key: "blockHeight",
    label: "Block Height",
    type: "number",
    default: 10,
    min: 2,
    max: 100,
    step: 1,
    group: "herringbone",
  },
  {
    key: "angle",
    label: "Angle",
    type: "number",
    default: 45,
    min: 0,
    max: 360,
    step: 1,
    group: "herringbone",
  },
  {
    key: "color1",
    label: "Color 1",
    type: "color",
    default: "#2c3e50",
    group: "herringbone",
  },
  {
    key: "color2",
    label: "Color 2",
    type: "color",
    default: "#ecf0f1",
    group: "herringbone",
  },
  {
    key: "gap",
    label: "Gap",
    type: "number",
    default: 1,
    min: 0,
    max: 10,
    step: 0.5,
    group: "herringbone",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "herringbone",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "herringbone",
  },
];

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const herringboneLayerType: LayerTypeDefinition = {
  typeId: "patterns:herringbone",
  displayName: "Herringbone Pattern",
  icon: "chevrons",
  category: "draw",
  properties: HERRINGBONE_PROPERTIES,
  propertyEditorId: "patterns:herringbone-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of HERRINGBONE_PROPERTIES) {
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

    const blockWidth = (properties.blockWidth as number) ?? 30;
    const blockHeight = (properties.blockHeight as number) ?? 10;
    const angleDeg = (properties.angle as number) ?? 45;
    const color1 = (properties.color1 as string) ?? "#2c3e50";
    const color2 = (properties.color2 as string) ?? "#ecf0f1";
    const gap = (properties.gap as number) ?? 1;
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    // Fill with color2 as background
    ctx.fillStyle = color2;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const diagonal = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
    const angle = angleDeg * (Math.PI / 180);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Herringbone: alternating V-shaped rows of rectangular blocks.
    // Each row has blocks tilted in alternating directions forming a zigzag.
    const unitW = blockWidth + gap;
    const unitH = blockHeight + gap;
    const cols = Math.ceil((2 * diagonal) / unitW) + 4;
    const rows = Math.ceil((2 * diagonal) / unitH) + 4;
    const halfW = (cols * unitW) / 2;
    const halfH = (rows * unitH) / 2;

    ctx.fillStyle = color1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -halfW + col * unitW;
        const y = -halfH + row * unitH;

        // Alternate direction: even rows shift right, odd rows shift left
        const isEvenRow = row % 2 === 0;
        const offset = isEvenRow ? 0 : unitW / 2;

        ctx.save();
        ctx.translate(x + offset, y);

        // Draw a small rectangle block; alternate rotation per cell
        const isFlipped = (row + col) % 2 === 0;
        if (isFlipped) {
          // Horizontal block
          ctx.fillRect(0, 0, blockWidth, blockHeight);
        } else {
          // Vertical block (rotated 90°)
          ctx.fillRect(0, 0, blockHeight, blockWidth);
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
