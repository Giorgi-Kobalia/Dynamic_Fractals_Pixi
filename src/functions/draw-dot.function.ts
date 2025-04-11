import { Container, Graphics } from "pixi.js";

export const drawDot = function (container: Container, point : {x: number, y: number}) {
  const dot = new Graphics();
  dot.circle(point.x, point.y, 1).fill("gold");

  container.addChild(dot);
};
