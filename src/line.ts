export class Line {
  constructor(private _context: CanvasRenderingContext2D) {}

  public draw(meta: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    lineWidth: number;
    color: string;
  }): void {
    this._context.strokeStyle = meta.color;
    this._context.lineWidth = meta.lineWidth;
    this._context.beginPath();
    this._context.moveTo(meta.x0, meta.y0);
    this._context.lineTo(meta.x1, meta.y1);
    this._context.stroke();
  }
}
