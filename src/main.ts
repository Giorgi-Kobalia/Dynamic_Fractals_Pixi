import { Application } from "pixi.js";
import { Layout } from "./classes";

const gameScene = document.getElementById("app");

const app = new Application();
const layout = new Layout();

async function init() {
  await app.init({
    width: 800,
    height: 850,
    backgroundAlpha: 0,
    antialias: true,
  });

  gameScene?.appendChild(app.canvas);
  (globalThis as any).__PIXI_APP__ = app;

  layout.init();
  app.stage.addChild(layout.container);
}

init();
