# Foximation

A browser-based animation editor where you animate text, shapes, images, and videos — frame by frame, right in your browser. Think of it as your own mini After Effects, but it runs in a tab.

## Quick Start

```bash
# Install a simple server (one time)
npm install -g serve

# Launch
serve public

# Open http://localhost:3000 in your browser
```

That's it. No build step, no bundlers, no waiting. Open and start animating.

**Alternative** (if you prefer Express):
```bash
npm install
node index.js
# Open http://localhost:8080
```

---

## What Can You Do With This?

### Animate Individual Letters

Every character is its own object. Grab a letter, move it, scale it, rotate it, skew it — and set keyframes on the timeline. Each letter animates independently. Spell out a word and make it dance.

### Draw Vector Shapes

Switch to vector mode and draw bezier curves directly on the canvas. Create custom shapes, edit control points, style them with fills and strokes. Everything you draw is animatable.

### Drop In Images and Videos

Drag an image or video file onto the canvas (or paste from clipboard). It becomes an object you can move, scale, rotate, and animate just like everything else. Videos sync their playback to the timeline.

### Clone Anything

Hold Alt and drag any object — you get a linked clone. Change the original, the clone follows. Perfect for creating patterns or repeating elements without the overhead.

### Timeline Animation

The bottom panel is a full keyframe timeline:
- Click on a frame to place a keyframe
- Move an object, add another keyframe — the in-between frames are interpolated automatically
- Choose easing curves (linear, sine, cubic) to control how the motion feels
- Drag keyframes around to retime your animation
- Hit **Space** to play/pause

### Professional Editing Tools

- **Resize handles** on corners and edges — scale objects precisely
- **Rotation handles** — grab the corners to spin. Hold **Shift** to snap to 15-degree increments
- **Multi-select** — Ctrl+click to select multiple objects, or drag a selection rectangle
- **Group transforms** — move, scale, and rotate multiple objects together
- **Properties panel** — fine-tune position, rotation, scale, opacity, and colors with number inputs

### Color Picker with OKLCH

Not just RGB. The color picker supports OKLCH — a perceptually uniform color space. That means colors you pick *look* evenly spaced to your eyes, not just mathematically evenly spaced. Fancy? Yes. Useful? Absolutely.

---

## The Interface

```
+--toolbar--+---------- canvas ----------+-properties-+
|           |                            |            |
|  modes:   |     your animation         |  position  |
|  select   |     lives here             |  rotation  |
|  text     |                            |  scale     |
|  vector   |                            |  color     |
|           |                            |  opacity   |
+-elements--+                            |            |
|           |                            |            |
|  object   +----------------------------+------------+
|  tree     |       timeline / keyframes              |
|           |  [====|====o========|===o====]           |
+-----------+-----------------------------------------+
```

- **Left**: Toolbar (switch modes) + Elements tree (your object hierarchy)
- **Center**: Canvas (where you create) + Timeline (where you animate)
- **Right**: Properties panel (fine-tune values)

All panels are resizable — drag the borders to make space where you need it.

---

## Editing Modes

| Mode | What It Does |
|------|-------------|
| **Select** | Click objects to select them. Drag to move. Use handles to resize and rotate. |
| **Text** | Click on the canvas to type. Each character becomes its own animatable object. |
| **Vector** | Click to place bezier points. Draw custom shapes with curves. Edit existing paths. |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play / Pause animation |
| **Ctrl + Click** | Add to selection |
| **Alt + Drag** | Clone the object |
| **Shift + Rotate** | Snap rotation to 15 degrees |
| **Drag & Drop file** | Import image or video |
| **Ctrl + V** | Paste image from clipboard |

---

## How Animation Works

1. **Move the playhead** to a frame on the timeline
2. **Change something** — position, rotation, scale, color, anything
3. **A keyframe appears** at that frame
4. **Move the playhead** to a different frame and change the same property
5. **The frames in between are calculated automatically** — this is called interpolation
6. Press **Space** and watch it move

You can choose how the in-between is calculated:
- **Linear** — constant speed, robot-like
- **Ease In** — starts slow, speeds up (like dropping a ball)
- **Ease Out** — starts fast, slows down (like rolling to a stop)
- **Ease In-Out** — slow start, fast middle, slow end (smooth and natural)

---

## Tech Stack

Built with vanilla JavaScript — no frameworks, no build tools, no dependencies beyond the browser.

| Layer | What |
|-------|------|
| Rendering | Canvas 2D API with custom scene graph |
| Fonts | OpenType.js for glyph-level text rendering |
| Animation | Custom tween engine with easing curves |
| UI | Vanilla DOM with reactive Store bindings |
| Math | Custom Point, Transform, BezierRect primitives |
| Colors | OKLCH perceptual color space |
| Server | Express (or any static file server) |

---

## Project Structure

```
public/
  index.html              <- entry point
  js/
    engine/               <- game loop, camera, rendering, scene graph
    object/               <- canvas objects (text, vector, image, video, frames)
    tween/                <- animation engine (keyframes, easing, timeline UI)
    modes/                <- interaction modes (select, text, vector)
    ui/                   <- panels (properties, elements tree, toolbar, inputs)
  fonts/                  <- OpenType.js + font files
  icons/                  <- gizmo SVG icons
```

66 JavaScript files, zero build configuration. Every file is a `<script>` tag loaded in order. Old school, fast to iterate, nothing to debug but your own code.
