import * as d3 from "d3";
import { ZoomBox } from "./zoomBox";
import { Marker } from "./generate-data";
import { margin, width, zoomMarginBottom, zoomPanelHeight } from "./screen.meta";

export class ZoomDrawer {
  private _x0 = margin.left;
  private _xEnd = width - margin.right;
  private _y0 = zoomPanelHeight - zoomMarginBottom;
  private _yEnd = margin.top;

  constructor(private _context: CanvasRenderingContext2D) {}

  public drawZoomedArea(
    data: Marker[],
    zoomBox: ZoomBox,
    transform: d3.ZoomTransform,
    xScale: d3.ScaleLinear<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    const { x0, y0, x1, y1 } = zoomBox.zoomBoxPosition;
    const zoomedCanvas = this._context.canvas;

    const xScaleZoomed = d3
      .scaleLinear()
      .domain([xScale.invert(x0), xScale.invert(x1)])
      .range([margin.left, zoomedCanvas.width - margin.right]);

    const yScaleZoomed = d3
      .scaleLinear()
      .domain([yScale.invert(y1), yScale.invert(y0)])
      .range([zoomedCanvas.height - zoomMarginBottom, 0]);

    this._context.clearRect(0, 0, zoomedCanvas.width, zoomedCanvas.height);

    this._drawAxes(transform, xScaleZoomed, yScaleZoomed);

    this._context.save();
    data.forEach((d) => {
      const x = xScaleZoomed(d.days_calving);
      const y = yScaleZoomed(d.days_insemination);

      if (
        x >= margin.left &&
        x <= zoomedCanvas.width - margin.right &&
        y >= 0 &&
        y <= zoomedCanvas.height - zoomMarginBottom
      ) {
        this._context.beginPath();
        this._context.arc(x, y, 3, 0, 2 * Math.PI);
        this._context.fillStyle =
          d.days_insemination >= 0 ? (d.abort ? "red" : "blue") : "gold";
        this._context.fill();
      }
    });
    this._context.restore();
  }

  private _drawAxes(
    transform: d3.ZoomTransform,
    xScaleZoomed: d3.ScaleLinear<number, number, never>,
    yScaleZoomed: d3.ScaleLinear<number, number, never>
  ) {
    this._context.save();
    this._context.strokeStyle = "black";
    this._context.lineWidth = 1;

    this._context.beginPath();
    this._context.moveTo(this._x0, this._y0);
    this._context.lineTo(this._xEnd, this._y0);
    this._context.stroke();

    // Axis Y
    this._context.beginPath();
    this._context.moveTo(this._x0, this._yEnd);
    this._context.lineTo(this._x0, this._y0);
    this._context.stroke();

    // (xEnd - xStart) / xDiv + 1
    // (640 - 0) / 20 + 1 = 33
    const tickCountsX = (this._xEnd - this._x0) / 100 + 1;
    const tickCountX = Math.max(2, Math.floor((tickCountsX) / transform.k));
    xScaleZoomed.ticks(tickCountX).forEach((tick) => {
      const x = xScaleZoomed(tick);
      this._context.beginPath();
      this._context.moveTo(x, this._y0);
      this._context.lineTo(x, this._y0 + 6);
      this._context.stroke();
      this._context.fillText(tick.toString(), x, this._y0 + 20);
    });

    const tickCountsY = (this._yEnd - this._y0) / 100 + 1;
    const tickCountY = Math.max(2, Math.floor(tickCountsY / transform.k));
    yScaleZoomed.ticks(tickCountY).forEach((tick) => {
      const y = yScaleZoomed(tick);
      if (tick >= 0) {
        this._context.beginPath();
        this._context.moveTo(this._x0, y);
        this._context.lineTo(this._x0 - 6, y);
        this._context.stroke();
        this._context.fillText(tick.toString(), this._x0 - 30, y + 3);
      }
    });

    this._context.restore();
  }
}
