import * as d3 from "d3";
import { Line } from "./line";
import { height, margin, width } from "./screen.meta";

export class ZoomBox {
  private _zoomBoxPosition: {
    xc: number;
    yc: number;
    width: number;
    height: number;
  } = {
    xc: 0,
    yc: 0,
    width: 100,
    height: 50,
  };
  private _lineDrawer: Line;

  constructor(
    private _screenCanvas: HTMLCanvasElement,
    xScale: d3.ScaleLinear<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    this._lineDrawer = new Line(this._screenCanvas.getContext("2d")!);
    this._zoomBoxPosition.xc = xScale(320);
    this._zoomBoxPosition.yc = yScale(150);
  }

  public get zoomBoxPosition(): {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } {
    const x0 = this._zoomBoxPosition.xc - this._zoomBoxPosition.width / 2;
    const y0 = this._zoomBoxPosition.yc - this._zoomBoxPosition.height / 2;
    const x1 = x0 + this._zoomBoxPosition.width;
    const y1 = y0 + this._zoomBoxPosition.height;

    return { x0, y0, x1, y1 };
  }

  public updateSelection({ dx, dy }: Record<"dx" | "dy", number>) {
    const {
      xc,
      yc,
      width: zoomBoxWidth,
      height: zoomBoxHeight,
    } = this._zoomBoxPosition;
  
    const newXc = xc + dx;
    this._zoomBoxPosition.xc = Math.min(
      Math.max(newXc, margin.left + zoomBoxWidth / 2),
      width - margin.right - zoomBoxWidth / 2
    );
  
    const newYc = yc + dy;
    this._zoomBoxPosition.yc = Math.min(
      Math.max(newYc, margin.top + zoomBoxHeight / 2),
      height - margin.bottom - zoomBoxHeight / 2
    );
  }

  public set zoomBoxPosition(zoomBoxPosition: {
    xc: number;
    yc: number;
    width: number;
    height: number;
  }) {
    this._zoomBoxPosition = zoomBoxPosition;
  }

  public drawZoomBox() {
    const context = this._screenCanvas.getContext("2d")!;
    context.save();
    context.strokeStyle = "#ccc";
    context.lineWidth = 3;
    const {
      xc,
      yc,
      width: zoomBoxWidth,
      height: zoomBoxHeight,
    } = this._zoomBoxPosition;
    context.strokeRect(
      xc - zoomBoxWidth / 2,
      yc - zoomBoxHeight / 2,
      zoomBoxWidth,
      zoomBoxHeight
    );

    this._lineDrawer.draw({
      x0: margin.left,
      y0: yc,
      x1: width - margin.right,
      y1: yc,
      lineWidth: 1,
      color: "#ccc",
    });

    this._lineDrawer.draw({
      x0: xc,
      y0: margin.top,
      x1: xc,
      y1: height - margin.bottom,
      lineWidth: 1,
      color: "#ccc",
    });
    context.restore();
  }

  public isDotInsideZoomBox({ x, y }: Record<"x" | "y", number>) {
    const {
      xc,
      yc,
      width: zoomBoxWidth,
      height: zoomBoxHeight,
    } = this._zoomBoxPosition;
    return (
      x > xc - zoomBoxWidth / 2 &&
      x < xc + zoomBoxWidth / 2 &&
      y > yc - zoomBoxHeight / 2 &&
      y < yc + zoomBoxHeight / 2
    );
  }
}
