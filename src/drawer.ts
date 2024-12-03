import { Marker } from "./generate-data";
import { Line } from "./line";
import { height, margin, width } from "./screen.meta";
import { ZoomBox } from "./zoomBox";

export class Drawer {
  private _visibleData: Marker[] = [];
  private _visibleDataCountText: HTMLButtonElement;
  private _lineDrawer: Line;

  private _x0 = margin.left;
  private _xEnd = width - margin.right;
  private _y0 = height - margin.bottom;
  private _yEnd = margin.top;

  constructor(
    private _context: CanvasRenderingContext2D,
    private _data: Marker[],
    private _zoomBoxDrawer: ZoomBox
  ) {
    this._lineDrawer = new Line(this._context);
    this._visibleDataCountText = document.querySelector(
      "#visible-data-counter"
    )!;
  }

  redraw(
    transform: d3.ZoomTransform,
    xScaleZoomed: d3.ScaleLinear<number, number, never>,
    yScaleZoomed: d3.ScaleLinear<number, number, never>
  ) {
    const xMin = xScaleZoomed.domain()[0];
    const xMax = xScaleZoomed.domain()[1];
    // ось Y инвертирована
    const yMin = yScaleZoomed.domain()[1];
    const yMax = yScaleZoomed.domain()[0];

    this._visibleData = this._data.filter(
      (d) =>
        d.days_calving >= xMin &&
        d.days_calving <= xMax &&
        d.days_insemination >= yMin &&
        d.days_insemination <= yMax
    );

    // Обновляем текст с количеством видимых данных
    this._visibleDataCountText.textContent = `На экране: ${this._visibleData.length}`;

    this._context.clearRect(0, 0, width, height);
    this._drawAxes(transform, xScaleZoomed, yScaleZoomed);
    this._drawZeroLine(yScaleZoomed);
    this._drawPoints(transform, xScaleZoomed, yScaleZoomed);
    this._drawTILs(yScaleZoomed);
    this._zoomBoxDrawer.drawZoomBox();

    return this._visibleData;
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
    const tickCountX = Math.max(2, Math.floor(33 / transform.k));
    xScaleZoomed.ticks(tickCountX).forEach((tick) => {
      const x = xScaleZoomed(tick);
      this._context.beginPath();
      this._context.moveTo(x, this._y0);
      this._context.lineTo(x, this._y0 + 6);
      this._context.stroke();
      this._context.fillText(tick.toString(), x, this._y0 + 20);
    });

    const tickCountY = Math.max(2, Math.floor(19 / transform.k));
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

  private _drawZeroLine(yScaleZoomed: d3.ScaleLinear<number, number, never>) {
    this._context.save();
    this._lineDrawer.draw({
      x0: this._x0,
      y0: yScaleZoomed(0),
      x1: this._xEnd,
      y1: yScaleZoomed(0),
      lineWidth: 1,
      color: "red",
    });
    this._context.restore();
  }

  private _drawPoints(
    transform: d3.ZoomTransform,
    xScaleZoomed: d3.ScaleLinear<number, number, never>,
    yScaleZoomed: d3.ScaleLinear<number, number, never>
  ) {
    console.log(transform.k);
    this._context.save();

    this._visibleData.forEach((d) => {
      const x = xScaleZoomed(d.days_calving);
      const y = yScaleZoomed(d.days_insemination);

      if (y + 3 > this._y0 || y < this._yEnd) {
        return;
      }

      if (x + 3 > this._xEnd || x < this._x0) {
        return;
      }

      this._context.beginPath();
      this._context.arc(x, y, 3, 0, 2 * Math.PI);
      this._context.fillStyle =
        d.days_insemination >= 0 ? (d.abort ? "red" : "blue") : "gold";
      this._context.fill();
    });

    this._context.restore();
  }

  private _drawTILs(yScaleZoomed: d3.ScaleLinear<number, number, never>) {
    this._context.save();
    const tils = [30, 60, 90];

    tils.forEach((til) => {
      const y = yScaleZoomed(til);
      this._lineDrawer.draw({
        x0: this._x0,
        y0: y,
        x1: this._xEnd,
        y1: y,
        lineWidth: 2,
        color: "green",
      });

      this._context.fillText(til.toString(), this._xEnd - 30, y - 12);
    });

    this._context.restore();
  }
}
