import { Application } from "pixi.js";
import { Layout } from "./classes";
import {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  FIT_PADDING,
  MIN_SCALE,
  MAX_SCALE,
  BOTTOM_SCREEN_MARGIN,
} from "./config";

const gameScene = document.getElementById("app");

const app = new Application();
const layout = new Layout();

function fitLayoutToScreen() {
  const rawScale =
    Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT) *
    FIT_PADDING;
  const scale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE);

  layout.container.pivot.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
  layout.container.scale.set(scale);
  layout.container.position.set(window.innerWidth / 2, window.innerHeight / 2);

  layout.uiContainer.scale.set(scale);
  layout.uiContainer.position.set(
    window.innerWidth / 2,
    window.innerHeight - BOTTOM_SCREEN_MARGIN - layout.uiContainer.pivot.y * scale
  );
}

async function init() {
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.max(window.devicePixelRatio, 1),
    autoDensity: true,
  });

  gameScene?.appendChild(app.canvas);
  (globalThis as any).__PIXI_APP__ = app;

  layout.init();
  app.stage.addChild(layout.container, layout.uiContainer);

  fitLayoutToScreen();
  window.addEventListener("resize", fitLayoutToScreen);
}

init();
