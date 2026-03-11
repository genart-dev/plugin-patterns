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

const WAVE_PROPERTIES: LayerPropertySchema[] = [
  {
    key: "amplitude",
    label: "Amplitude",
    type: "number",
    default: 15,
    min: 1,
    max: 200,
    step: 1,
    group: "wave",
  },
  {
    key: "frequency",
    label: "Frequency",
    type: "number",
    default: 3,
    min: 0.1,
    max: 50,
    step: 0.1,
    group: "wave",
  },
  {
    key: "phase",
    label: "Phase",
    type: "number",
    default: 0,
    min: 0,
    max: 6.2832,
    step: 0.01,
    group: "wave",
  },
  {
    key: "lineWidth",
    label: "Line Width",
    type: "number",
    default: 2,
    min: 0.5,
    max: 50,
    step: 0.5,
    group: "wave",
  },
  {
    key: "waveform",
    label: "Waveform",
    type: "string",
    default: "sine",
    group: "wave",
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    default: "#000000",
    group: "wave",
  },
  {
    key: "spacing",
    label: "Row Spacing",
    type: "number",
    default: 30,
    min: 5,
    max: 200,
    step: 1,
    group: "wave",
  },
  {
    key: "region",
    label: "Region (JSON)",
    type: "string",
    default: '{"type":"bounds"}',
    group: "wave",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "number",
    default: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: "wave",
  },
];

// ---------------------------------------------------------------------------
// Waveform functions: map normalized x (0–1) to y displacement (-1 to 1)
// ---------------------------------------------------------------------------

type WaveformFn = (t: number) => number;

const WAVEFORMS: Record<string, WaveformFn> = {
  sine: (t) => Math.sin(t),
  triangle: (t) => {
    const mod = ((t / (2 * Math.PI)) % 1 + 1) % 1;
    return mod < 0.5 ? 4 * mod - 1 : 3 - 4 * mod;
  },
  square: (t) => {
    const mod = ((t / (2 * Math.PI)) % 1 + 1) % 1;
    return mod < 0.5 ? 1 : -1;
  },
  sawtooth: (t) => {
    const mod = ((t / (2 * Math.PI)) % 1 + 1) % 1;
    return 2 * mod - 1;
  },
};

// ---------------------------------------------------------------------------
// Layer type definition
// ---------------------------------------------------------------------------

export const waveLayerType: LayerTypeDefinition = {
  typeId: "patterns:wave",
  displayName: "Wave Pattern",
  icon: "waves",
  category: "draw",
  properties: WAVE_PROPERTIES,
  propertyEditorId: "patterns:wave-editor",

  createDefault(): LayerProperties {
    const props: LayerProperties = {};
    for (const schema of WAVE_PROPERTIES) {
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

    const amplitude = (properties.amplitude as number) ?? 15;
    const frequency = (properties.frequency as number) ?? 3;
    const phase = (properties.phase as number) ?? 0;
    const lineWidth = (properties.lineWidth as number) ?? 2;
    const waveformName = (properties.waveform as string) ?? "sine";
    const color = (properties.color as string) ?? "#000000";
    const spacing = (properties.spacing as number) ?? 30;
    const layerOpacity = (properties.opacity as number) ?? 1;

    let region: PatternRegion = { type: "bounds" };
    try {
      region = JSON.parse((properties.region as string) ?? '{"type":"bounds"}') as PatternRegion;
    } catch { /* use bounds */ }

    const waveformFn = WAVEFORMS[waveformName] ?? WAVEFORMS.sine!;

    ctx.save();
    ctx.globalAlpha = layerOpacity;
    applyRegionClip(region, bounds, ctx);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rows = Math.ceil(bounds.height / spacing) + 2;
    const step = 2; // px per segment for smooth curves

    for (let row = 0; row < rows; row++) {
      const baseY = bounds.y + row * spacing;
      ctx.beginPath();

      for (let px = 0; px <= bounds.width; px += step) {
        const x = bounds.x + px;
        const t = (px / bounds.width) * frequency * 2 * Math.PI + phase;
        const y = baseY + waveformFn(t) * amplitude;

        if (px === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

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

    const waveform = properties.waveform as string;
    if (waveform && !WAVEFORMS[waveform]) {
      errors.push({
        property: "waveform",
        message: `waveform must be one of: ${Object.keys(WAVEFORMS).join(", ")}`,
      });
    }

    return errors.length > 0 ? errors : null;
  },
};
