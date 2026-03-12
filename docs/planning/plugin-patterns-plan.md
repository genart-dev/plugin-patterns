# Plugin Patterns — Implementation Plan (ADR 075)

## Phase 0: Scaffold + Extract (DONE)
- Extracted `fill/` subsystem from plugin-painting → `plugin-patterns/src/core/`
- 1 layer type (`patterns:fill`), 9 presets, 102 tests
- `painting:fill` deprecated in plugin-painting with console.warn

## Phase 1: Geometric Pattern Layer Types (DONE)
- 4 new layer types: `patterns:stripe`, `patterns:dot`, `patterns:checker`, `patterns:wave`
- 22 geometric presets (6 stripe, 6 dot, 5 checker, 5 wave)
- `GeometricPreset` discriminated union types
- 189 tests passing, build clean

## Phase 1.5: README + Example Gallery (NEXT)

Create a proper README and example files for every preset. Each preset gets a
`.genart` file that renders to a thumbnail via the CLI.

### Directory structure

```
plugin-patterns/
  README.md                        # Full README with preset gallery table
  examples/
    patterns-gallery.genart-workspace   # Workspace referencing all example sketches
    stripe/
      pinstripe.genart
      pinstripe.png
      ticking.genart
      ticking.png
      awning.genart
      awning.png
      nautical.genart
      nautical.png
      candy.genart
      candy.png
      barber-pole.genart
      barber-pole.png
    dot/
      polka-small.genart
      polka-small.png
      polka-large.genart
      polka-large.png
      halftone.genart
      halftone.png
      hex-dot.genart
      hex-dot.png
      confetti.genart
      confetti.png
      sprinkle.genart
      sprinkle.png
    checker/
      checker-small.genart
      checker-small.png
      checker-large.genart
      checker-large.png
      gingham.genart
      gingham.png
      buffalo-check.genart
      buffalo-check.png
      houndstooth.genart
      houndstooth.png
    wave/
      gentle-wave.genart
      gentle-wave.png
      choppy.genart
      choppy.png
      zigzag.genart
      zigzag.png
      scallop.genart
      scallop.png
      ogee.genart
      ogee.png
    fill/
      hatch-light.genart
      hatch-light.png
      hatch-medium.genart
      hatch-medium.png
      hatch-dense.genart
      hatch-dense.png
      crosshatch-light.genart
      crosshatch-light.png
      crosshatch-dense.genart
      crosshatch-dense.png
      stipple-light.genart
      stipple-light.png
      stipple-dense.genart
      stipple-dense.png
      scumble.genart
      scumble.png
      contour.genart
      contour.png
```

### .genart file template (design-layers-only sketch)

Each preset example file is a minimal `.genart` file with:
- `genart: "1.3"` (layers support)
- `renderer: { type: "canvas2d" }` — algorithm not needed for layer-only sketches
- `canvas: { width: 600, height: 600 }` — square thumbnails
- `algorithm: ""` — empty (layer-only rendering)
- `layers: [{ ... }]` — single layer using the preset properties
- `state.seed: 42` — deterministic

**Stripe preset example** (pinstripe):
```json
{
  "genart": "1.3",
  "id": "patterns-pinstripe",
  "title": "Pinstripe Pattern",
  "created": "2026-03-11T00:00:00.000Z",
  "modified": "2026-03-11T00:00:00.000Z",
  "renderer": { "type": "canvas2d" },
  "canvas": { "width": 600, "height": 600 },
  "parameters": [],
  "colors": [],
  "state": { "seed": 42, "params": {}, "colorPalette": [] },
  "algorithm": "",
  "layers": [
    {
      "id": "pattern-layer",
      "type": "patterns:stripe",
      "name": "Pinstripe",
      "visible": true,
      "locked": false,
      "opacity": 1,
      "blendMode": "normal",
      "transform": {
        "x": 0, "y": 0,
        "width": 600, "height": 600,
        "rotation": 0, "scaleX": 1, "scaleY": 1,
        "anchorX": 0, "anchorY": 0
      },
      "properties": {
        "angle": 90,
        "spacing": 12,
        "lineWidth": 1,
        "colors": "[\"#1a1a2e\",\"#f0f0f0\"]",
        "dashPattern": "[]",
        "region": "{\"type\":\"bounds\"}",
        "opacity": 1
      }
    }
  ]
}
```

### Thumbnail rendering

Use the CLI to batch-render all `.genart` files:

```bash
# Render one:
npx @genart-dev/cli render examples/stripe/pinstripe.genart \
  -o examples/stripe/pinstripe.png --width 600 --height 600

# Render all (batch script):
node render-examples.cjs
```

**render-examples.cjs** — Node script that:
1. Globs `examples/**/*.genart`
2. For each file, runs `npx @genart-dev/cli render <file> -o <file>.png`
3. Reports results

### .genart-workspace file

Single workspace referencing all 31 preset examples, laid out in a grid
organized by category (stripe row, dot row, checker row, wave row, fill row):

```json
{
  "genart-workspace": "1.0",
  "id": "patterns-gallery",
  "title": "Pattern Preset Gallery",
  "created": "2026-03-11T00:00:00.000Z",
  "modified": "2026-03-11T00:00:00.000Z",
  "viewport": { "x": 0, "y": 0, "zoom": 0.5 },
  "sketches": [
    { "file": "stripe/pinstripe.genart", "position": { "x": 0, "y": 0 } },
    { "file": "stripe/ticking.genart", "position": { "x": 700, "y": 0 } },
    ...
  ]
}
```

### README.md structure

```markdown
# @genart-dev/plugin-patterns

Geometric pattern fills and decorative tiling for genart.dev.

## Install
## Layer Types (5)
  - patterns:fill — hatch, crosshatch, stipple, scumble, contour
  - patterns:stripe — parallel colored bands
  - patterns:dot — regular/offset dot grids
  - patterns:checker — alternating squares
  - patterns:wave — sine/triangle/square/sawtooth wave rows

## Presets (31)

### Stripe (6)
| Preset | Preview | Angle | Spacing | Colors |
|--------|---------|-------|---------|--------|
| pinstripe | ![](examples/stripe/pinstripe.png) | 90° | 12px | navy/white |
| ... | | | | |

### Dot (6)
(same table format)

### Checker (5)
### Wave (5)
### Fill (9)

## Properties Reference
  (table per layer type: property, type, default, range)

## Usage
  (TypeScript import, MCP tool examples)

## License
```

### Tasks

1. Create `render-examples.cjs` script
2. Generate all 31 `.genart` files (one per preset)
3. Generate `patterns-gallery.genart-workspace`
4. Render all thumbnails via CLI
5. Write `README.md` with preset gallery tables
6. Commit and push

## Phase 2: MCP Tools + Remaining Types

- 7 MCP tools: add_pattern, update_pattern, list_pattern_presets, create_pattern, set_pattern_region, set_pattern_shading, tile_pattern
- 4 remaining layer types: crosshatch-geo, herringbone, tile, custom
- ~19 more presets (crosshatch-geo 4, herringbone 4, tile 5, multi 6)
- Custom pattern creation system (create_pattern → sketch.patterns field)

## Phase 3: Integration + Publish

- Wire into desktop app, web app, VSCode (add to externalizeDepsPlugin.exclude, next.config.mjs resolve.modules)
- Publish to npm as `@genart-dev/plugin-patterns`
- Add to mcp-server tool registration
- Documentation on docs.genart.dev
