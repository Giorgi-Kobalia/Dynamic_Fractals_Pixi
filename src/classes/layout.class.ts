import { Container, Graphics, Text, Ticker } from "pixi.js";

interface DrawTask {
  cx: number;
  cy: number;
  radius: number;
  depth: number;
}

export class Layout {
  public container = new Container();
  public ticker = new Ticker();

  public cornersBg = new Graphics();
  public cornersText = new Text();
  public cornersInputContainer = new Container();

  public depthBg = new Graphics();
  public depthText = new Text();
  public depthInputContainer = new Container();

  public btnBg = new Graphics();
  public btnText = new Text();
  public btnContainer = new Container();

  public allInputsContainer = new Container();
  public drawwingContainer = new Container();

  private taskQueue: DrawTask[] = [];
  private isDrawing = false;
  private maxDepth = 0;
  private cornersAmount = 0;

  init() {
    this.drawAmountInput();
    this.drawDepthInput();
    this.drawBtn();

    this.allInputsContainer.addChild(
      this.cornersInputContainer,
      this.depthInputContainer,
      this.btnContainer
    );

    this.allInputsContainer.pivot.set(
      this.allInputsContainer.width / 2,
      this.allInputsContainer.height / 2
    );

    this.container.addChild(this.drawwingContainer, this.allInputsContainer);

    this.allInputsContainer.position.set(400, 790);

    this.drawwingContainer.sortableChildren = true;
  }

  drawAmountInput() {
    this.cornersBg.roundRect(0, 0, 150, 40, 8).fill("gold");
    this.cornersBg.interactive = true;

    this.cornersText = new Text({
      text: "CORNERS",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0x000000,
      },
    });

    this.cornersText.anchor.set(0.5);
    this.cornersText.position.set(
      this.cornersBg.width / 2,
      this.cornersBg.height / 2
    );

    this.cornersInputContainer.addChild(this.cornersBg, this.cornersText);

    this.cornersInputContainer.interactive = true;

    this.cornersInputContainer.on("pointerdown", () => {
      const val = prompt("Enter number of corners:");
      if (val) this.cornersText.text = val;
      this.cornersAmount = parseInt(this.cornersText.text);
    });

    this.cornersText.resolution = 2;
  }

  drawDepthInput() {
    this.depthBg.roundRect(0, 0, 150, 40, 8).fill("gold");
    this.depthBg.interactive = true;

    this.depthText = new Text({
      text: "DEPTH",
      style: {
        fontFamily: "Arial",
        fontSize: 16,
        fill: 0x000000,
      },
    });

    this.depthText.anchor.set(0.5);
    this.depthText.position.set(
      this.depthBg.width / 2,
      this.depthBg.height / 2
    );

    this.depthInputContainer.x = 300;
    this.depthInputContainer.addChild(this.depthBg, this.depthText);

    this.depthInputContainer.interactive = true;

    this.depthInputContainer.on("pointerdown", () => {
      const val = prompt("Enter number of depth:");
      if (val) this.depthText.text = val;
      this.maxDepth = parseInt(this.depthText.text);
    });

    this.depthText.resolution = 2;
  }

  drawBtn() {
    this.btnBg = new Graphics();
    this.btnBg.roundRect(0, 0, 150, 40, 8).fill("gold");

    this.btnText = new Text({
      text: "DRAW",
      style: {
        fontFamily: "Arial",
        fontSize: 20,
        fill: 0x000000,
      },
    });

    this.btnText.anchor.set(0.5);
    this.btnText.position.set(this.btnBg.width / 2, this.btnBg.height / 2);

    this.btnContainer = new Container();

    this.btnContainer.x = 150;
    this.btnContainer.y = 60;

    this.btnContainer.addChild(this.btnBg, this.btnText);
    this.btnContainer.interactive = true;

    this.btnContainer.on("pointerdown", () => {
      if (!this.isDrawing && this.cornersAmount && this.maxDepth) {
        this.startDrawing();
      } else if (this.isDrawing) {
        this.reset();
      }
    });

    this.btnText.resolution = 2;
  }

  startDrawing() {
    this.drawwingContainer.removeChildren();
    this.isDrawing = true;
    this.taskQueue = [];

    this.taskQueue.push({
      cx: 400,
      cy: 380,
      radius: 220,
      depth: this.maxDepth,
    });

    this.ticker.add(this.processNextTask, this);
    this.ticker.start();
  }

  processNextTask() {
    if (this.taskQueue.length === 0) {
      this.ticker.stop();
      this.ticker.remove(this.processNextTask, this);
      this.isDrawing = false;
      this.btnText.text = "DRAW";
      return;
    }

    const task = this.taskQueue.shift()!;
    const { cx, cy, radius, depth } = task;
    this.btnText.text = "RESET";

    const points = this.createStartPoints(
      cx,
      cy,
      radius,
      this.cornersAmount,
      0.5
    );
    this.drawPolygon(points, depth);

    if (depth > 1) {
      for (const point of points) {
        this.taskQueue.push({
          cx: point.x,
          cy: point.y,
          radius: radius * 0.35,
          depth: depth - 1,
        });
      }
    }
  }

  createStartPoints(
    cx: number,
    cy: number,
    radius: number,
    spikes: number,
    innerRatio: number
  ): { x: number; y: number }[] {
    const step = Math.PI / spikes;
    const inner = radius * innerRatio;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? radius : inner;
      const angle = i * step - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points.push({ x, y });
    }

    return points;
  }

  drawPolygon(points: { x: number; y: number }[], depth: number) {
    const g = new Graphics();
    const color = this.depthToColor(depth);

    g.fill("transparent");
    g.stroke({ width: 1, color, alpha: 1 });

    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.closePath();

    g.fill();
    g.stroke();

    this.drawwingContainer.addChild(g);
    g.zIndex = depth;
  }

  depthToColor(depth: number): number {
    const isEven = depth % 2 === 0;

    // Золотой: #FFD700
    // Зелёный: #228B22
    return isEven ? 0x228b22 : 0xffd700;
  }

  reset() {
    this.drawwingContainer.removeChildren();
    this.cornersAmount = 0;
    this.cornersText.text = 0;
    this.maxDepth = 0;
    this.depthText.text = 0;
    this.ticker.stop();
    this.ticker.remove(this.processNextTask, this);
    this.taskQueue = [];
    this.isDrawing = false;
    this.btnText.text = "DRAW";
  }
}
