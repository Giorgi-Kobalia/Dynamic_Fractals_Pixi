import { Container, Graphics, Rectangle, Text, Ticker } from "pixi.js";

interface DrawTask {
  cx: number;
  cy: number;
  radius: number;
  depth: number;
}

interface StepperOptions {
  label: string;
  min: number;
  max: number;
  initial: number;
  onChange: (value: number) => void;
}

type ShapeMode = "polygon" | "star";

interface ToggleOptions {
  leftLabel: string;
  rightLabel: string;
  initial: ShapeMode;
  onChange: (value: ShapeMode) => void;
}

const STEPPER_WIDTH = 180;
const STEPPER_HEIGHT = 40;
const STEPPER_BTN_SIZE = 34;
const BTN_WIDTH = 150;
const ROW_GAP = 18;
const PANEL_PADDING = 22;

const CORNERS_X = 0;
const TOGGLE_X = CORNERS_X + STEPPER_WIDTH + ROW_GAP;
const DEPTH_X = TOGGLE_X + STEPPER_WIDTH + ROW_GAP;
const BTN_X = DEPTH_X + STEPPER_WIDTH + ROW_GAP;
const CONTENT_WIDTH = BTN_X + BTN_WIDTH;
const CONTENT_HEIGHT = STEPPER_HEIGHT;

const PANEL_WIDTH = CONTENT_WIDTH + PANEL_PADDING * 2;
const PANEL_HEIGHT = CONTENT_HEIGHT + PANEL_PADDING * 2;

const DRAW_CENTER_X = 400;
const DRAW_CENTER_Y = 425;
const DRAW_RADIUS = 220;

export class Layout {
  public container = new Container();
  public ticker = new Ticker();

  public cornersInputContainer = new Container();
  public depthInputContainer = new Container();
  public shapeToggleContainer = new Container();

  public btnBg = new Graphics();
  public btnText = new Text();
  public btnContainer = new Container();

  public uiContainer = new Container();

  public drawwingContainer = new Container();

  private taskQueue: DrawTask[] = [];
  private isDrawing = false;
  private maxDepth = 0;
  private cornersAmount = 0;
  private shapeMode: ShapeMode = "polygon";

  init() {
    const panelBg = new Graphics()
      .roundRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 18)
      .fill({ color: 0x000000, alpha: 0.4 })
      .stroke({ width: 1, color: 0xffd700, alpha: 0.4 });

    this.cornersInputContainer = this.createStepper({
      label: "CORNERS",
      min: 3,
      max: 12,
      initial: 3,
      onChange: (value) => (this.cornersAmount = value),
    });
    this.cornersAmount = 3;
    this.cornersInputContainer.position.set(PANEL_PADDING + CORNERS_X, PANEL_PADDING);

    this.depthInputContainer = this.createStepper({
      label: "DEPTH",
      min: 1,
      max: 6,
      initial: 1,
      onChange: (value) => (this.maxDepth = value),
    });
    this.maxDepth = 1;
    this.depthInputContainer.position.set(PANEL_PADDING + DEPTH_X, PANEL_PADDING);

    this.shapeToggleContainer = this.createToggle({
      leftLabel: "POLYGON",
      rightLabel: "STAR",
      initial: "polygon",
      onChange: (mode) => (this.shapeMode = mode),
    });
    this.shapeToggleContainer.position.set(PANEL_PADDING + TOGGLE_X, PANEL_PADDING);

    this.drawBtn();
    this.btnContainer.position.set(PANEL_PADDING + BTN_X, PANEL_PADDING);

    this.uiContainer.addChild(
      panelBg,
      this.cornersInputContainer,
      this.depthInputContainer,
      this.shapeToggleContainer,
      this.btnContainer
    );
    this.uiContainer.pivot.set(PANEL_WIDTH / 2, PANEL_HEIGHT / 2);

    this.container.addChild(this.drawwingContainer);
    this.drawwingContainer.sortableChildren = true;
  }

  private createStepperButton(label: string, x: number): Container {
    const button = new Container();
    const bg = new Graphics().roundRect(0, 0, STEPPER_BTN_SIZE, STEPPER_HEIGHT, 8).fill(0xffd700);

    const text = new Text({
      text: label,
      style: { fontFamily: "Arial", fontSize: 20, fill: 0x000000, fontWeight: "bold" },
    });
    text.anchor.set(0.5);
    text.position.set(STEPPER_BTN_SIZE / 2, STEPPER_HEIGHT / 2);
    text.resolution = 2;

    button.addChild(bg, text);
    button.x = x;
    button.interactive = true;
    button.cursor = "pointer";

    return button;
  }

  private createStepper(options: StepperOptions): Container {
    const container = new Container();
    let value = options.initial;

    const valueBg = new Graphics().roundRect(
      STEPPER_BTN_SIZE,
      0,
      STEPPER_WIDTH - STEPPER_BTN_SIZE * 2,
      STEPPER_HEIGHT,
      8
    ).fill(0x1a1a1a);

    const valueText = new Text({
      text: `${options.label} ${value}`,
      style: { fontFamily: "Arial", fontSize: 14, fill: 0xffd700 },
    });
    valueText.anchor.set(0.5);
    valueText.position.set(STEPPER_WIDTH / 2, STEPPER_HEIGHT / 2);
    valueText.resolution = 2;

    const minusBtn = this.createStepperButton("-", 0);
    const plusBtn = this.createStepperButton("+", STEPPER_WIDTH - STEPPER_BTN_SIZE);

    const setValue = (next: number) => {
      value = Math.min(options.max, Math.max(options.min, next));
      valueText.text = `${options.label} ${value}`;
      options.onChange(value);
    };

    minusBtn.on("pointerup", () => setValue(value - 1));
    plusBtn.on("pointerup", () => setValue(value + 1));

    container.addChild(valueBg, valueText, minusBtn, plusBtn);

    return container;
  }

  private createToggle(options: ToggleOptions): Container {
    const container = new Container();
    const halfWidth = STEPPER_WIDTH / 2;

    const bg = new Graphics().roundRect(0, 0, STEPPER_WIDTH, STEPPER_HEIGHT, 8).fill(0x1a1a1a);
    const highlight = new Graphics().roundRect(0, 0, halfWidth, STEPPER_HEIGHT, 8).fill(0xffd700);

    const leftText = new Text({
      text: options.leftLabel,
      style: { fontFamily: "Arial", fontSize: 12, fill: 0xffffff, fontWeight: "bold" },
    });
    leftText.anchor.set(0.5);
    leftText.position.set(halfWidth / 2, STEPPER_HEIGHT / 2);
    leftText.resolution = 2;

    const rightText = new Text({
      text: options.rightLabel,
      style: { fontFamily: "Arial", fontSize: 12, fill: 0xffffff, fontWeight: "bold" },
    });
    rightText.anchor.set(0.5);
    rightText.position.set(halfWidth + halfWidth / 2, STEPPER_HEIGHT / 2);
    rightText.resolution = 2;

    const leftHit = new Container();
    leftHit.hitArea = new Rectangle(0, 0, halfWidth, STEPPER_HEIGHT);
    leftHit.interactive = true;
    leftHit.cursor = "pointer";

    const rightHit = new Container();
    rightHit.x = halfWidth;
    rightHit.hitArea = new Rectangle(0, 0, halfWidth, STEPPER_HEIGHT);
    rightHit.interactive = true;
    rightHit.cursor = "pointer";

    const setMode = (mode: ShapeMode) => {
      highlight.x = mode === "polygon" ? 0 : halfWidth;
      leftText.style.fill = mode === "polygon" ? 0x000000 : 0xffffff;
      rightText.style.fill = mode === "star" ? 0x000000 : 0xffffff;
      options.onChange(mode);
    };

    leftHit.on("pointerup", () => setMode("polygon"));
    rightHit.on("pointerup", () => setMode("star"));

    container.addChild(bg, highlight, leftText, rightText, leftHit, rightHit);
    setMode(options.initial);

    return container;
  }

  drawBtn() {
    this.btnBg = new Graphics();
    this.btnBg
      .roundRect(0, 0, BTN_WIDTH, STEPPER_HEIGHT, 8)
      .fill(0x228b22)
      .stroke({ width: 1, color: 0xffd700, alpha: 0.6 });

    this.btnText = new Text({
      text: "DRAW",
      style: {
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        fill: 0xffffff,
      },
    });

    this.btnText.anchor.set(0.5);
    this.btnText.position.set(this.btnBg.width / 2, this.btnBg.height / 2);

    this.btnContainer = new Container();

    this.btnContainer.addChild(this.btnBg, this.btnText);
    this.btnContainer.interactive = true;
    this.btnContainer.cursor = "pointer";

    this.btnContainer.on("pointerup", () => {
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
      cx: DRAW_CENTER_X,
      cy: DRAW_CENTER_Y,
      radius: DRAW_RADIUS,
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

    const points =
      this.shapeMode === "star"
        ? this.createStarPoints(cx, cy, radius, this.cornersAmount, 0.5)
        : this.createPolygonPoints(cx, cy, radius, this.cornersAmount);
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

  createPolygonPoints(
    cx: number,
    cy: number,
    radius: number,
    sides: number
  ): { x: number; y: number }[] {
    const step = (Math.PI * 2) / sides;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < sides; i++) {
      const angle = i * step - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      points.push({ x, y });
    }

    return points;
  }

  createStarPoints(
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

    return isEven ? 0x228b22 : 0xffd700;
  }

  reset() {
    this.drawwingContainer.removeChildren();
    this.ticker.stop();
    this.ticker.remove(this.processNextTask, this);
    this.taskQueue = [];
    this.isDrawing = false;
    this.btnText.text = "DRAW";
  }
}
