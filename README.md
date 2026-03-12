# @genart-dev/plugin-patterns

Decorative pattern fills as design layers for [genart.dev](https://genart.dev) — 153 presets across 28 layer types, from geometric tessellations to cultural motifs. Renders with Canvas2D primitives — no brush engine dependency.

Part of [genart.dev](https://genart.dev) — a generative art platform with an MCP server, desktop app, and IDE extensions.

## Install

```bash
npm install @genart-dev/plugin-patterns
```

## Usage

```typescript
import patternsPlugin from "@genart-dev/plugin-patterns";
import { createDefaultRegistry } from "@genart-dev/core";

const registry = createDefaultRegistry();
registry.registerPlugin(patternsPlugin);

// Or access individual exports
import {
  GEOMETRIC_PRESETS,
  PATTERN_PRESETS,
  getGeometricPreset,
  getPatternPreset,
} from "@genart-dev/plugin-patterns";

const awning = getGeometricPreset("awning");
// { layerType: "patterns:stripe", angle: 90, spacing: 30, lineWidth: 30, colors: ["#c0392b", "#ffffff"] }

const hatchLight = getPatternPreset("hatch-light");
// { strategy: { type: "hatch", angle: 45, spacing: 12 }, lineWidth: 2 }
```

## Layer Types (29)

| Type | Category | Presets | Description |
|---|---|---|---|
| `patterns:fill` | Illustration fills | 11 | Hatch, crosshatch, stipple, scumble, contour |
| `patterns:stripe` | Core geometric | 8 | Parallel lines/bands at any angle |
| `patterns:dot` | Core geometric | 8 | Regular/offset dot grids |
| `patterns:checker` | Core geometric | 7 | Alternating squares, optionally rotated |
| `patterns:wave` | Core geometric | 9 | Sine, triangle, square, sawtooth rows |
| `patterns:crosshatch-geo` | Core geometric | 6 | Clean geometric crosshatch |
| `patterns:herringbone` | Core geometric | 7 | Interlocking V-pattern / zigzag blocks |
| `patterns:tile` | Core geometric | 8 | Seamless repeating tiles (brick, hex, moroccan, etc.) |
| `patterns:triangle` | Geometric | 6 | Equilateral, pinwheel, arrow, kaleidoscope |
| `patterns:diamond` | Geometric | 5 | Simple, argyle, nested, adjointed, lattice |
| `patterns:hexagon` | Geometric | 5 | Honeycomb, interlocked, flower, grid |
| `patterns:star` | Geometric | 5 | Six-pointed, eight-pointed, plus-grid |
| `patterns:circle` | Geometric | 6 | Concentric, overlapping, packed, semicircle |
| `patterns:square` | Geometric | 5 | Nested, rotated, offset, stars-and-squares |
| `patterns:octagon` | Geometric | 2 | Octagon-square, outline |
| `patterns:scale` | Geometric | 4 | Fishscale, scallop, overlapping, pointed |
| `patterns:chainlink` | Geometric | 3 | Circle, oval, double |
| `patterns:japanese` | Cultural | 6 | Asanoha, seigaiha, shippo, bishamon-kikko, yagasuri, kumiko |
| `patterns:lattice` | Cultural | 5 | Greek key, Chinese fret, double meander |
| `patterns:plaid` | Cultural | 4 | Tartan, buffalo plaid, madras, windowpane |
| `patterns:cube` | Cultural | 3 | Isometric, stacked, tumbling blocks |
| `patterns:ethnic` | Cultural | 6 | Tribal zigzag, kente, lotus, step, songket, arrow |
| `patterns:leaf` | Organic | 4 | Simple leaf, fern row, tropical scatter, vine trail |
| `patterns:floral` | Organic | 5 | Daisy, rosette, cherry blossom, sunflower |
| `patterns:memphis` | Organic | 4 | Classic, confetti, geometric, squiggle |
| `patterns:eye` | Organic | 4 | Vesica, pointed, almond, double |
| `patterns:spiral` | Organic | 4 | Archimedean, logarithmic, scroll, double |
| `patterns:terrazzo` | Organic | 3 | Classic, bold, blob |
| `patterns:custom` | Custom | — | Agent-created from drawing commands |

All layer types support `region` (JSON clip region), `opacity`, and standard layer transform properties.

## Presets (153)

### Fill (11)

[![Fill gallery](galleries/fill-gallery.png)](#fill-11)

| Preview | ID | Name | Strategy |
|---|---|---|---|
| [![](examples/fill/hatch-light.png)](examples/fill/hatch-light.png) | `hatch-light` | Light Hatch | hatch 45° sp:12 |
| [![](examples/fill/hatch-medium.png)](examples/fill/hatch-medium.png) | `hatch-medium` | Medium Hatch | hatch 45° sp:8 |
| [![](examples/fill/hatch-dense.png)](examples/fill/hatch-dense.png) | `hatch-dense` | Dense Hatch | hatch 45° sp:4 |
| [![](examples/fill/crosshatch-light.png)](examples/fill/crosshatch-light.png) | `crosshatch-light` | Light Crosshatch | crosshatch 45°/135° sp:12 |
| [![](examples/fill/crosshatch-dense.png)](examples/fill/crosshatch-dense.png) | `crosshatch-dense` | Dense Crosshatch | crosshatch 45°/135° sp:5 |
| [![](examples/fill/crosshatch-triple.png)](examples/fill/crosshatch-triple.png) | `crosshatch-triple` | Triple Crosshatch | crosshatch 3-angle sp:6 |
| [![](examples/fill/stipple-light.png)](examples/fill/stipple-light.png) | `stipple-light` | Light Stipple | stipple density:15 |
| [![](examples/fill/stipple-dense.png)](examples/fill/stipple-dense.png) | `stipple-dense` | Dense Stipple | stipple density:60 |
| [![](examples/fill/stipple-gradient.png)](examples/fill/stipple-gradient.png) | `stipple-gradient` | Gradient Stipple | stipple density:gradient |
| [![](examples/fill/scumble.png)](examples/fill/scumble.png) | `scumble` | Scumble | scumble density:12 |
| [![](examples/fill/contour.png)](examples/fill/contour.png) | `contour` | Contour | contour sp:6 smooth:0.3 |

### Stripe (8)

[![Stripe gallery](galleries/stripe-gallery.png)](#stripe-8)

| Preview | ID | Name | Angle | Spacing | Colors |
|---|---|---|---|---|---|
| [![](examples/stripe/pinstripe.png)](examples/stripe/pinstripe.png) | `pinstripe` | Pinstripe | 90 | 12 | navy / white |
| [![](examples/stripe/ticking.png)](examples/stripe/ticking.png) | `ticking` | Ticking | 90 | 20 | dark blue / light grey |
| [![](examples/stripe/awning.png)](examples/stripe/awning.png) | `awning` | Awning | 90 | 30 | red / white |
| [![](examples/stripe/nautical.png)](examples/stripe/nautical.png) | `nautical` | Nautical | 0 | 16 | dark blue / white |
| [![](examples/stripe/candy.png)](examples/stripe/candy.png) | `candy` | Candy | 45 | 14 | red / white (4-color) |
| [![](examples/stripe/barber-pole.png)](examples/stripe/barber-pole.png) | `barber-pole` | Barber Pole | 30 | 12 | red / white / blue / white |
| [![](examples/stripe/railroad.png)](examples/stripe/railroad.png) | `railroad` | Railroad | 0 | 8 | black / white |
| [![](examples/stripe/diagonal-stripe.png)](examples/stripe/diagonal-stripe.png) | `diagonal-stripe` | Diagonal Stripe | 45 | 10 | black / white |

### Dot (8)

[![Dot gallery](galleries/dot-gallery.png)](#dot-8)

| Preview | ID | Name | Spacing | Hex Offset | Colors |
|---|---|---|---|---|---|
| [![](examples/dot/polka-small.png)](examples/dot/polka-small.png) | `polka-small` | Small Polka | 20 | no | dark / white bg |
| [![](examples/dot/polka-large.png)](examples/dot/polka-large.png) | `polka-large` | Large Polka | 40 | no | red / white bg |
| [![](examples/dot/halftone.png)](examples/dot/halftone.png) | `halftone` | Halftone | 8 | yes | black / white bg |
| [![](examples/dot/hex-dot.png)](examples/dot/hex-dot.png) | `hex-dot` | Hex Dot | 24 | yes | purple / light bg |
| [![](examples/dot/confetti.png)](examples/dot/confetti.png) | `confetti` | Confetti | 16 | yes | orange / cream bg |
| [![](examples/dot/sprinkle.png)](examples/dot/sprinkle.png) | `sprinkle` | Sprinkle | 12 | no | green / mint bg |
| [![](examples/dot/bubble.png)](examples/dot/bubble.png) | `bubble` | Bubble | 28 | yes | blue / light bg |
| [![](examples/dot/ring-dot.png)](examples/dot/ring-dot.png) | `ring-dot` | Ring Dot | 20 | no | dark / cream bg |

### Checker (7)

[![Checker gallery](galleries/checker-gallery.png)](#checker-7)

| Preview | ID | Name | Cell Size | Angle | Colors |
|---|---|---|---|---|---|
| [![](examples/checker/checker-small.png)](examples/checker/checker-small.png) | `checker-small` | Small Checker | 16 | 0 | black / white |
| [![](examples/checker/checker-large.png)](examples/checker/checker-large.png) | `checker-large` | Large Checker | 48 | 0 | black / white |
| [![](examples/checker/gingham.png)](examples/checker/gingham.png) | `gingham` | Gingham | 20 | 0 | blue / light blue |
| [![](examples/checker/buffalo-check.png)](examples/checker/buffalo-check.png) | `buffalo-check` | Buffalo Check | 36 | 0 | red / dark |
| [![](examples/checker/houndstooth.png)](examples/checker/houndstooth.png) | `houndstooth` | Houndstooth | 12 | 45 | dark blue / light |
| [![](examples/checker/checkerboard-diagonal.png)](examples/checker/checkerboard-diagonal.png) | `checkerboard-diagonal` | Diagonal Checker | 24 | 45 | black / white |
| [![](examples/checker/pixel-grid.png)](examples/checker/pixel-grid.png) | `pixel-grid` | Pixel Grid | 8 | 0 | grey / white |

### Wave (9)

[![Wave gallery](galleries/wave-gallery.png)](#wave-9)

| Preview | ID | Name | Waveform |
|---|---|---|---|
| [![](examples/wave/gentle-wave.png)](examples/wave/gentle-wave.png) | `gentle-wave` | Gentle Wave | sine |
| [![](examples/wave/choppy.png)](examples/wave/choppy.png) | `choppy` | Choppy | sine |
| [![](examples/wave/zigzag.png)](examples/wave/zigzag.png) | `zigzag` | Zigzag | triangle |
| [![](examples/wave/scallop.png)](examples/wave/scallop.png) | `scallop` | Scallop | sine |
| [![](examples/wave/ogee.png)](examples/wave/ogee.png) | `ogee` | Ogee | sine |
| [![](examples/wave/deep-wave.png)](examples/wave/deep-wave.png) | `deep-wave` | Deep Wave | sine |
| [![](examples/wave/nested-wave.png)](examples/wave/nested-wave.png) | `nested-wave` | Nested Wave | sine |
| [![](examples/wave/square-wave.png)](examples/wave/square-wave.png) | `square-wave` | Square Wave | square |
| [![](examples/wave/sawtooth-wave.png)](examples/wave/sawtooth-wave.png) | `sawtooth-wave` | Sawtooth Wave | sawtooth |

### Crosshatch (6)

[![Crosshatch gallery](galleries/crosshatch-geo-gallery.png)](#crosshatch-6)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/crosshatch-geo/fine-crosshatch.png)](examples/crosshatch-geo/fine-crosshatch.png) | `fine-crosshatch` | Fine Crosshatch | Tight clean crosshatch |
| [![](examples/crosshatch-geo/bold-crosshatch.png)](examples/crosshatch-geo/bold-crosshatch.png) | `bold-crosshatch` | Bold Crosshatch | Heavy weight crosshatch |
| [![](examples/crosshatch-geo/diamond-mesh.png)](examples/crosshatch-geo/diamond-mesh.png) | `diamond-mesh` | Diamond Mesh | Diamond-angle crosshatch |
| [![](examples/crosshatch-geo/screen.png)](examples/crosshatch-geo/screen.png) | `screen` | Screen | Fine screen pattern |
| [![](examples/crosshatch-geo/triple-crosshatch.png)](examples/crosshatch-geo/triple-crosshatch.png) | `triple-crosshatch` | Triple Crosshatch | Three-angle crosshatch |
| [![](examples/crosshatch-geo/wide-mesh.png)](examples/crosshatch-geo/wide-mesh.png) | `wide-mesh` | Wide Mesh | Wide-spaced mesh |

### Herringbone (7)

[![Herringbone gallery](galleries/herringbone-gallery.png)](#herringbone-7)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/herringbone/classic-herringbone.png)](examples/herringbone/classic-herringbone.png) | `classic-herringbone` | Classic Herringbone | Traditional V-pattern |
| [![](examples/herringbone/chevron.png)](examples/herringbone/chevron.png) | `chevron` | Chevron | Wide chevron |
| [![](examples/herringbone/twill.png)](examples/herringbone/twill.png) | `twill` | Twill | Diagonal twill weave |
| [![](examples/herringbone/parquet.png)](examples/herringbone/parquet.png) | `parquet` | Parquet | Parquet flooring |
| [![](examples/herringbone/wide-chevron.png)](examples/herringbone/wide-chevron.png) | `wide-chevron` | Wide Chevron | Extra-wide chevron |
| [![](examples/herringbone/thin-chevron.png)](examples/herringbone/thin-chevron.png) | `thin-chevron` | Thin Chevron | Narrow chevron |
| [![](examples/herringbone/double-chevron.png)](examples/herringbone/double-chevron.png) | `double-chevron` | Double Chevron | Nested chevron |

### Tile (8)

[![Tile gallery](galleries/tile-gallery.png)](#tile-8)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/tile/brick.png)](examples/tile/brick.png) | `brick` | Brick | Offset brick wall |
| [![](examples/tile/basketweave.png)](examples/tile/basketweave.png) | `basketweave` | Basketweave | Woven basket pattern |
| [![](examples/tile/hexagonal.png)](examples/tile/hexagonal.png) | `hexagonal` | Hexagonal Tile | Hex tile grid |
| [![](examples/tile/fish-scale.png)](examples/tile/fish-scale.png) | `fish-scale` | Fish Scale | Overlapping scales |
| [![](examples/tile/moroccan.png)](examples/tile/moroccan.png) | `moroccan` | Moroccan | Moroccan tile |
| [![](examples/tile/ogee-tile.png)](examples/tile/ogee-tile.png) | `ogee-tile` | Ogee Tile | Ogee shape tiles |
| [![](examples/tile/lantern-tile.png)](examples/tile/lantern-tile.png) | `lantern-tile` | Lantern Tile | Lantern shape |
| [![](examples/tile/basketweave-tight.png)](examples/tile/basketweave-tight.png) | `basketweave-tight` | Basketweave Tight | Tight basketweave |

### Triangle (6)

[![Triangle gallery](galleries/triangle-gallery.png)](#triangle-6)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/triangle/equilateral-grid.png)](examples/triangle/equilateral-grid.png) | `equilateral-grid` | Equilateral Grid | Tessellating equilateral triangles |
| [![](examples/triangle/pinwheel.png)](examples/triangle/pinwheel.png) | `pinwheel` | Pinwheel | Rotating triangle pinwheel |
| [![](examples/triangle/arrow-tessellation.png)](examples/triangle/arrow-tessellation.png) | `arrow-tessellation` | Arrow Tessellation | Arrow-shaped triangle tiling |
| [![](examples/triangle/kaleidoscope.png)](examples/triangle/kaleidoscope.png) | `kaleidoscope` | Kaleidoscope | Kaleidoscope symmetry |
| [![](examples/triangle/inverted-triangles.png)](examples/triangle/inverted-triangles.png) | `inverted-triangles` | Inverted Triangles | Alternating up/down |
| [![](examples/triangle/triangle-strip.png)](examples/triangle/triangle-strip.png) | `triangle-strip` | Triangle Strip | Horizontal triangle strip |

### Diamond (5)

[![Diamond gallery](galleries/diamond-gallery.png)](#diamond-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/diamond/simple-diamond.png)](examples/diamond/simple-diamond.png) | `simple-diamond` | Simple Diamond | Basic diamond grid |
| [![](examples/diamond/argyle.png)](examples/diamond/argyle.png) | `argyle` | Argyle | Classic argyle |
| [![](examples/diamond/nested-diamond.png)](examples/diamond/nested-diamond.png) | `nested-diamond` | Nested Diamond | Concentric diamonds |
| [![](examples/diamond/adjointed-diamonds.png)](examples/diamond/adjointed-diamonds.png) | `adjointed-diamonds` | Adjointed Diamonds | Interlocking diamonds |
| [![](examples/diamond/diamond-lattice.png)](examples/diamond/diamond-lattice.png) | `diamond-lattice` | Diamond Lattice | Open diamond lattice |

### Hexagon (5)

[![Hexagon gallery](galleries/hexagon-gallery.png)](#hexagon-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/hexagon/honeycomb.png)](examples/hexagon/honeycomb.png) | `honeycomb` | Honeycomb | Classic honeycomb |
| [![](examples/hexagon/interlocked-hex.png)](examples/hexagon/interlocked-hex.png) | `interlocked-hex` | Interlocked Hex | Interlocking hexagons |
| [![](examples/hexagon/hex-flower.png)](examples/hexagon/hex-flower.png) | `hex-flower` | Hex Flower | Flower-shaped hex cluster |
| [![](examples/hexagon/hex-grid.png)](examples/hexagon/hex-grid.png) | `hex-grid` | Hex Grid | Regular hex grid |
| [![](examples/hexagon/overlapping-hex.png)](examples/hexagon/overlapping-hex.png) | `overlapping-hex` | Overlapping Hex | Overlapping hexagons |

### Star (5)

[![Star gallery](galleries/star-gallery.png)](#star-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/star/six-pointed.png)](examples/star/six-pointed.png) | `six-pointed` | Six-Pointed Star | Star of David pattern |
| [![](examples/star/eight-pointed.png)](examples/star/eight-pointed.png) | `eight-pointed` | Eight-Pointed Star | Compass rose style |
| [![](examples/star/plus-grid.png)](examples/star/plus-grid.png) | `plus-grid` | Plus Grid | Plus sign grid |
| [![](examples/star/plus-offset.png)](examples/star/plus-offset.png) | `plus-offset` | Plus Offset | Offset plus signs |
| [![](examples/star/star-lattice.png)](examples/star/star-lattice.png) | `star-lattice` | Star Lattice | Connected star lattice |

### Circle (6)

[![Circle gallery](galleries/circle-gallery.png)](#circle-6)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/circle/concentric-rings.png)](examples/circle/concentric-rings.png) | `concentric-rings` | Concentric Rings | Nested circles |
| [![](examples/circle/overlapping-circles.png)](examples/circle/overlapping-circles.png) | `overlapping-circles` | Overlapping Circles | Overlapping transparent circles |
| [![](examples/circle/packed-circles.png)](examples/circle/packed-circles.png) | `packed-circles` | Packed Circles | Tightly packed circles |
| [![](examples/circle/semicircle-row.png)](examples/circle/semicircle-row.png) | `semicircle-row` | Semicircle Row | Alternating semicircle rows |
| [![](examples/circle/quarter-turn.png)](examples/circle/quarter-turn.png) | `quarter-turn` | Quarter Turn | Quarter-circle arcs |
| [![](examples/circle/bullseye.png)](examples/circle/bullseye.png) | `bullseye` | Bullseye | Target/bullseye pattern |

### Japanese (6)

[![Japanese gallery](galleries/japanese-gallery.png)](#japanese-6)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/japanese/asanoha.png)](examples/japanese/asanoha.png) | `asanoha` | Asanoha | Hemp leaf star pattern |
| [![](examples/japanese/seigaiha.png)](examples/japanese/seigaiha.png) | `seigaiha` | Seigaiha | Blue ocean waves |
| [![](examples/japanese/shippo.png)](examples/japanese/shippo.png) | `shippo` | Shippo | Seven treasures / interlocking circles |
| [![](examples/japanese/bishamon-kikko.png)](examples/japanese/bishamon-kikko.png) | `bishamon-kikko` | Bishamon Kikko | Tortoiseshell armor |
| [![](examples/japanese/yagasuri.png)](examples/japanese/yagasuri.png) | `yagasuri` | Yagasuri | Arrow feather fletching |
| [![](examples/japanese/kumiko.png)](examples/japanese/kumiko.png) | `kumiko` | Kumiko | Woodwork lattice |

### Lattice (5)

[![Lattice gallery](galleries/lattice-gallery.png)](#lattice-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/lattice/greek-key.png)](examples/lattice/greek-key.png) | `greek-key` | Greek Key | Meander / Greek fret |
| [![](examples/lattice/chinese-fret.png)](examples/lattice/chinese-fret.png) | `chinese-fret` | Chinese Fret | Chinese window fret |
| [![](examples/lattice/double-meander.png)](examples/lattice/double-meander.png) | `double-meander` | Double Meander | Interlocking meanders |
| [![](examples/lattice/chinese-window.png)](examples/lattice/chinese-window.png) | `chinese-window` | Chinese Window | Ornate window lattice |
| [![](examples/lattice/interlocking-fret.png)](examples/lattice/interlocking-fret.png) | `interlocking-fret` | Interlocking Fret | Interlocking L-shapes |

### Plaid (4)

[![Plaid gallery](galleries/plaid-gallery.png)](#plaid-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/plaid/tartan.png)](examples/plaid/tartan.png) | `tartan` | Tartan | Scottish tartan |
| [![](examples/plaid/buffalo-plaid.png)](examples/plaid/buffalo-plaid.png) | `buffalo-plaid` | Buffalo Plaid | Classic buffalo plaid |
| [![](examples/plaid/madras.png)](examples/plaid/madras.png) | `madras` | Madras | Madras cotton plaid |
| [![](examples/plaid/windowpane.png)](examples/plaid/windowpane.png) | `windowpane` | Windowpane | Windowpane check |

### Cube (3)

[![Cube gallery](galleries/cube-gallery.png)](#cube-3)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/cube/isometric-cube.png)](examples/cube/isometric-cube.png) | `isometric-cube` | Isometric Cube | 3D isometric cubes |
| [![](examples/cube/stacked-cubes.png)](examples/cube/stacked-cubes.png) | `stacked-cubes` | Stacked Cubes | Stacked cube illusion |
| [![](examples/cube/tumbling-blocks.png)](examples/cube/tumbling-blocks.png) | `tumbling-blocks` | Tumbling Blocks | Classic tumbling blocks |

### Leaf (4)

[![Leaf gallery](galleries/leaf-gallery.png)](#leaf-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/leaf/simple-leaf.png)](examples/leaf/simple-leaf.png) | `simple-leaf` | Simple Leaf | Repeating leaf motif |
| [![](examples/leaf/fern-row.png)](examples/leaf/fern-row.png) | `fern-row` | Fern Row | Alternating fern fronds |
| [![](examples/leaf/tropical-scatter.png)](examples/leaf/tropical-scatter.png) | `tropical-scatter` | Tropical Scatter | Scattered tropical leaves |
| [![](examples/leaf/vine-trail.png)](examples/leaf/vine-trail.png) | `vine-trail` | Vine Trail | Trailing vine pattern |

### Floral (5)

[![Floral gallery](galleries/floral-gallery.png)](#floral-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/floral/daisy.png)](examples/floral/daisy.png) | `daisy` | Daisy | Simple daisy repeat |
| [![](examples/floral/rosette.png)](examples/floral/rosette.png) | `rosette` | Rosette | Geometric rosette |
| [![](examples/floral/cherry-blossom.png)](examples/floral/cherry-blossom.png) | `cherry-blossom` | Cherry Blossom | Delicate blossom scatter |
| [![](examples/floral/sunflower.png)](examples/floral/sunflower.png) | `sunflower` | Sunflower | Bold sunflower grid |
| [![](examples/floral/abstract-flower.png)](examples/floral/abstract-flower.png) | `abstract-flower` | Abstract Flower | Abstract floral motif |

### Memphis (4)

[![Memphis gallery](galleries/memphis-gallery.png)](#memphis-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/memphis/memphis-classic.png)](examples/memphis/memphis-classic.png) | `memphis-classic` | Memphis Classic | 80s Memphis style |
| [![](examples/memphis/confetti-burst.png)](examples/memphis/confetti-burst.png) | `confetti-burst` | Confetti Burst | Scattered confetti |
| [![](examples/memphis/geometric-scatter.png)](examples/memphis/geometric-scatter.png) | `geometric-scatter` | Geometric Scatter | Mixed geometric shapes |
| [![](examples/memphis/squiggle-field.png)](examples/memphis/squiggle-field.png) | `squiggle-field` | Squiggle Field | Random squiggle fill |

### Eye (4)

[![Eye gallery](galleries/eye-gallery.png)](#eye-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/eye/vesica-piscis.png)](examples/eye/vesica-piscis.png) | `vesica-piscis` | Vesica Piscis | Vesica eye shape |
| [![](examples/eye/evil-eye.png)](examples/eye/evil-eye.png) | `evil-eye` | Evil Eye | Nested eye motif |
| [![](examples/eye/almond-lattice.png)](examples/eye/almond-lattice.png) | `almond-lattice` | Almond Lattice | Almond-shaped lattice |
| [![](examples/eye/nested-eyes.png)](examples/eye/nested-eyes.png) | `nested-eyes` | Nested Eyes | Concentric eye shapes |

### Spiral (4)

[![Spiral gallery](galleries/spiral-gallery.png)](#spiral-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/spiral/tight-spiral.png)](examples/spiral/tight-spiral.png) | `tight-spiral` | Tight Spiral | Dense Archimedean spiral |
| [![](examples/spiral/scrollwork.png)](examples/spiral/scrollwork.png) | `scrollwork` | Scrollwork | Ornamental scroll |
| [![](examples/spiral/double-spiral.png)](examples/spiral/double-spiral.png) | `double-spiral` | Double Spiral | Mirrored double spiral |
| [![](examples/spiral/batik-swirl.png)](examples/spiral/batik-swirl.png) | `batik-swirl` | Batik Swirl | Batik-style swirl |

### Terrazzo (3)

[![Terrazzo gallery](galleries/terrazzo-gallery.png)](#terrazzo-3)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/terrazzo/terrazzo-classic.png)](examples/terrazzo/terrazzo-classic.png) | `terrazzo-classic` | Terrazzo Classic | Classic terrazzo chips |
| [![](examples/terrazzo/terrazzo-bold.png)](examples/terrazzo/terrazzo-bold.png) | `terrazzo-bold` | Terrazzo Bold | Large bold chips |
| [![](examples/terrazzo/blob-scatter.png)](examples/terrazzo/blob-scatter.png) | `blob-scatter` | Blob Scatter | Organic blob scatter |

### Square (5)

[![Square gallery](galleries/square-gallery.png)](#square-5)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/square/nested-squares.png)](examples/square/nested-squares.png) | `nested-squares` | Nested Squares | Concentric squares |
| [![](examples/square/rotated-squares.png)](examples/square/rotated-squares.png) | `rotated-squares` | Rotated Squares | 45° rotated square grid |
| [![](examples/square/squares-and-stars.png)](examples/square/squares-and-stars.png) | `squares-and-stars` | Squares & Stars | Alternating squares and stars |
| [![](examples/square/squares-and-circles.png)](examples/square/squares-and-circles.png) | `squares-and-circles` | Squares & Circles | Mixed square/circle grid |
| [![](examples/square/offset-squares.png)](examples/square/offset-squares.png) | `offset-squares` | Offset Squares | Half-step offset |

### Octagon (2)

[![Octagon gallery](galleries/octagon-gallery.png)](#octagon-2)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/octagon/octagon-square.png)](examples/octagon/octagon-square.png) | `octagon-square` | Octagon & Square | Classic octagon-square tiling |
| [![](examples/octagon/octagon-outline.png)](examples/octagon/octagon-outline.png) | `octagon-outline` | Octagon Outline | Outlined octagon grid |

### Scale (4)

[![Scale gallery](galleries/scale-gallery.png)](#scale-4)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/scale/fishscale-classic.png)](examples/scale/fishscale-classic.png) | `fishscale-classic` | Fishscale Classic | Overlapping fishscales |
| [![](examples/scale/scallop-shell.png)](examples/scale/scallop-shell.png) | `scallop-shell` | Scallop Shell | Shell-shaped scallop |
| [![](examples/scale/overlapping-scales.png)](examples/scale/overlapping-scales.png) | `overlapping-scales` | Overlapping Scales | Layered scale pattern |
| [![](examples/scale/pointed-scales.png)](examples/scale/pointed-scales.png) | `pointed-scales` | Pointed Scales | Pointed scale variant |

### Chainlink (3)

[![Chainlink gallery](galleries/chainlink-gallery.png)](#chainlink-3)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/chainlink/chainlink-fence.png)](examples/chainlink/chainlink-fence.png) | `chainlink-fence` | Chainlink Fence | Classic chainlink |
| [![](examples/chainlink/chain-mail.png)](examples/chainlink/chain-mail.png) | `chain-mail` | Chain Mail | Interlocking rings |
| [![](examples/chainlink/interlocking-rings.png)](examples/chainlink/interlocking-rings.png) | `interlocking-rings` | Interlocking Rings | Decorative ring links |

### Ethnic (6)

[![Ethnic gallery](galleries/ethnic-gallery.png)](#ethnic-6)

| Preview | ID | Name | Description |
|---|---|---|---|
| [![](examples/ethnic/tribal-zigzag.png)](examples/ethnic/tribal-zigzag.png) | `tribal-zigzag` | Tribal Zigzag | Bold zigzag bands |
| [![](examples/ethnic/african-kente.png)](examples/ethnic/african-kente.png) | `african-kente` | African Kente | Kente cloth stripes |
| [![](examples/ethnic/egyptian-lotus.png)](examples/ethnic/egyptian-lotus.png) | `egyptian-lotus` | Egyptian Lotus | Lotus motif repeat |
| [![](examples/ethnic/mexican-step.png)](examples/ethnic/mexican-step.png) | `mexican-step` | Mexican Step | Stepped geometric |
| [![](examples/ethnic/songket-diamond.png)](examples/ethnic/songket-diamond.png) | `songket-diamond` | Songket Diamond | Woven diamond brocade |
| [![](examples/ethnic/tribal-arrow.png)](examples/ethnic/tribal-arrow.png) | `tribal-arrow` | Tribal Arrow | Arrow point rows |

## MCP Tools (7)

Exposed to AI agents through the MCP server when this plugin is registered:

| Tool | Description |
|---|---|
| `list_pattern_presets` | List all presets grouped by category |
| `add_pattern` | Add a pattern layer (by type + preset or manual properties) |
| `update_pattern` | Update pattern layer properties by layer ID |
| `set_pattern_region` | Set clip region (bounds, rect, ellipse, polygon) |
| `set_pattern_shading` | Set value-based shading (patterns:fill only) |
| `tile_pattern` | Configure tile layer (shape, size, gap, rotation, colors) |
| `create_pattern` | Create custom pattern from drawing commands |

## Custom Patterns

The `patterns:custom` layer type lets agents create entirely new patterns from drawing commands:

```typescript
import { patternMcpTools } from "@genart-dev/plugin-patterns";

// DrawCommand types: line, circle, rect, arc, path, polygon
// Stored in sketch thirdParty, resolved at render time
// Tiles the unit cell with scale/rotation/color override
```

## Examples

The `examples/` directory contains 153 `.genart` files (one per preset) with matching `.png` thumbnails. Open `examples/patterns-gallery.genart-workspace` to view all presets in a grid layout.

To re-render thumbnails:

```bash
node render-examples.cjs
```

To regenerate gallery images:

```bash
bash generate-galleries.sh
```

## Related Packages

| Package | Purpose |
|---|---|
| [`@genart-dev/core`](https://github.com/genart-dev/core) | Plugin host, layer system (dependency) |
| [`@genart-dev/mcp-server`](https://github.com/genart-dev/mcp-server) | MCP server that surfaces plugin tools to AI agents |

## Support

Questions, bugs, or feedback — [support@genart.dev](mailto:support@genart.dev) or [open an issue](https://github.com/genart-dev/plugin-patterns/issues).

## License

MIT
