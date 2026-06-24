# Dynamic Fractals (Pixi.js)

An interactive fractal generator built with [Pixi.js](https://pixijs.com/) and TypeScript. Recursively draws nested polygons or stars, with on-screen controls to tweak the shape, depth, and corner count in real time.

🔗 Live demo: https://giorgi-kobalia.github.io/Dynamic_Fractals_Pixi/

## Features

- **Recursive shape drawing** — each shape spawns smaller copies of itself at every vertex, down to a configurable depth.
- **Two shape modes** — toggle between regular **polygons** and **stars**.
- **Adjustable corners** (3–12) and **depth** (1–6) via stepper controls.
- **Draw / Reset** button that animates the drawing frame-by-frame using a Pixi `Ticker` and a task queue (instead of drawing everything synchronously).
- **Responsive layout** — the canvas and UI panel scale and re-center automatically on window resize, clamped between a min/max scale.

## Tech Stack

- [Pixi.js v8](https://pixijs.com/) — WebGL/WebGPU 2D rendering
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — dev server & build tool

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Opens a local dev server with hot reload (default: http://localhost:5173).

### Build for production

```bash
npm run build
```

Type-checks the project and outputs a static build to `dist/`.

### Preview the production build

```bash
npm run preview
```

## How It Works

- `src/main.ts` — bootstraps the Pixi `Application`, attaches it to the `#app` element, and keeps the layout fitted to the window on resize.
- `src/classes/layout.class.ts` — owns the UI panel (corner/depth steppers, shape toggle, draw button) and the recursive drawing logic:
  - `startDrawing()` seeds a task queue with the initial shape.
  - `processNextTask()` runs once per tick, drawing one shape and queuing a smaller shape at each of its vertices until the configured depth is reached.
  - `createPolygonPoints()` / `createStarPoints()` compute vertex coordinates for each shape mode.
  - `depthToColor()` alternates stroke color by recursion depth for a layered visual effect.
- `src/config.ts` — layout constants (design resolution, fit padding, scale limits, UI margin).

## Deployment

Pushes to `main` automatically build and deploy the site to **GitHub Pages** via [.github/workflows/static.yml](.github/workflows/static.yml).

## Project Structure

```
src/
├── classes/
│   ├── layout.class.ts   # UI panel + recursive fractal drawing
│   └── index.ts
├── config.ts             # layout/scaling constants
├── main.ts               # Pixi app bootstrap & resize handling
└── style.css
```
