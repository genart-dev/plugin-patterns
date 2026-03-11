# @genart-dev/plugin-patterns

Decorative pattern fills as design layers for genart sketches. Provides geometric and illustration-style pattern types that render with Canvas2D primitives — no brush engine dependency.

## Install

```bash
npm install @genart-dev/plugin-patterns
```

## Layer Types

| Type | Description | Key Properties |
|------|-------------|----------------|
| `patterns:fill` | Hatch, crosshatch, stipple, scumble, contour | `strategy` (JSON), `lineWidth`, `color`, `shading` |
| `patterns:stripe` | Parallel lines/bands at any angle | `angle`, `spacing`, `lineWidth`, `colors` (JSON array) |
| `patterns:dot` | Regular/offset dot grids | `spacing`, `radius`, `offset` (hex), `color`, `backgroundColor` |
| `patterns:checker` | Alternating squares, optionally rotated | `cellSize`, `colors` (JSON array), `angle` |
| `patterns:wave` | Sine, triangle, square, sawtooth rows | `amplitude`, `frequency`, `waveform`, `color`, `spacing` |

All layer types also support `region` (JSON clip region), `opacity`, and standard layer transform properties.

## Presets

### Stripe (6)

| Preset | Preview | Angle | Spacing | Line Width | Colors |
|--------|---------|-------|---------|------------|--------|
| pinstripe | ![](examples/stripe/pinstripe.png) | 90 | 12 | 1 | navy / white |
| ticking | ![](examples/stripe/ticking.png) | 90 | 20 | 3 | dark blue / light grey |
| awning | ![](examples/stripe/awning.png) | 90 | 30 | 30 | red / white |
| nautical | ![](examples/stripe/nautical.png) | 0 | 16 | 8 | dark blue / white |
| candy | ![](examples/stripe/candy.png) | 45 | 14 | 14 | red / white (4-color) |
| barber-pole | ![](examples/stripe/barber-pole.png) | 30 | 12 | 12 | red / white / blue / white |

### Dot (6)

| Preset | Preview | Spacing | Radius | Hex Offset | Colors |
|--------|---------|---------|--------|------------|--------|
| polka-small | ![](examples/dot/polka-small.png) | 20 | 4 | no | dark / white bg |
| polka-large | ![](examples/dot/polka-large.png) | 40 | 12 | no | red / white bg |
| halftone | ![](examples/dot/halftone.png) | 8 | 3 | yes | black / white bg |
| hex-dot | ![](examples/dot/hex-dot.png) | 24 | 6 | yes | purple / light bg |
| confetti | ![](examples/dot/confetti.png) | 16 | 3 | yes | orange / cream bg |
| sprinkle | ![](examples/dot/sprinkle.png) | 12 | 2 | no | green / mint bg |

### Checker (5)

| Preset | Preview | Cell Size | Angle | Colors |
|--------|---------|-----------|-------|--------|
| checker-small | ![](examples/checker/checker-small.png) | 16 | 0 | black / white |
| checker-large | ![](examples/checker/checker-large.png) | 48 | 0 | black / white |
| gingham | ![](examples/checker/gingham.png) | 20 | 0 | blue / light blue |
| buffalo-check | ![](examples/checker/buffalo-check.png) | 36 | 0 | red / dark |
| houndstooth | ![](examples/checker/houndstooth.png) | 12 | 45 | dark blue / light |

### Wave (5)

| Preset | Preview | Amplitude | Frequency | Waveform | Color |
|--------|---------|-----------|-----------|----------|-------|
| gentle-wave | ![](examples/wave/gentle-wave.png) | 12 | 2 | sine | blue |
| choppy | ![](examples/wave/choppy.png) | 8 | 8 | sine | dark |
| zigzag | ![](examples/wave/zigzag.png) | 10 | 6 | triangle | red |
| scallop | ![](examples/wave/scallop.png) | 15 | 4 | sine | teal |
| ogee | ![](examples/wave/ogee.png) | 20 | 2 | sine | purple |

### Fill (9)

| Preset | Preview | Strategy | Line Width |
|--------|---------|----------|------------|
| hatch-light | ![](examples/fill/hatch-light.png) | hatch 45° sp:12 | 2 |
| hatch-medium | ![](examples/fill/hatch-medium.png) | hatch 45° sp:8 | 3 |
| hatch-dense | ![](examples/fill/hatch-dense.png) | hatch 45° sp:4 | 2 |
| crosshatch-light | ![](examples/fill/crosshatch-light.png) | crosshatch 45°/135° sp:12 | 2 |
| crosshatch-dense | ![](examples/fill/crosshatch-dense.png) | crosshatch 45°/135° sp:5 | 2 |
| stipple-light | ![](examples/fill/stipple-light.png) | stipple density:15 poisson | 2 |
| stipple-dense | ![](examples/fill/stipple-dense.png) | stipple density:60 poisson | 2 |
| scumble | ![](examples/fill/scumble.png) | scumble density:12 | 3 |
| contour | ![](examples/fill/contour.png) | contour sp:6 smooth:0.3 | 2 |

## Usage

```typescript
import patternsPlugin from "@genart-dev/plugin-patterns";

// Access layer types
const stripe = patternsPlugin.layerTypes.find(lt => lt.typeId === "patterns:stripe");

// Access presets
import { getGeometricPreset, getPatternPreset } from "@genart-dev/plugin-patterns";

const awning = getGeometricPreset("awning");
// { layerType: "patterns:stripe", angle: 90, spacing: 30, lineWidth: 30, colors: ["#c0392b", "#ffffff"] }

const hatchLight = getPatternPreset("hatch-light");
// { strategy: { type: "hatch", angle: 45, spacing: 12 }, lineWidth: 2 }
```

## Examples

The `examples/` directory contains 31 `.genart` files (one per preset) with matching `.png` thumbnails. Open `examples/patterns-gallery.genart-workspace` to view all presets in a grid layout.

To re-render thumbnails:

```bash
node render-examples.cjs
```

## License

MIT
