import { type Marker } from "./generate-data";

export type Point = Marker & { count: number };

export class PointsHandler {
  private _points!: d3.Selection<SVGCircleElement, Marker, SVGGElement, unknown>;

  constructor(
    private _chartArea: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    private _data: Marker[],
    xScale: d3.ScaleLinear<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>
  ) {
    this._points = this._chartArea
      .selectAll("circle")
      .data(this._data)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", (d) => {
        // @ts-expect-error no error
        if (d.y >= 0) {
          return d.abort === true ? "red" : "blue";
        } else {
          return "gold";
        }
      });
    this.refreshPoints(xScale, yScale);
  }

  public get points(): d3.Selection<
    SVGCircleElement,
    Marker,
    SVGGElement,
    unknown
  > {
    return this._points;
  }

  public refreshPoints(
    xScaleZoomed: d3.ScaleLinear<number, number, never>,
    yScaleZoomed: d3.ScaleLinear<number, number, never>
  ) {
   this._points

    // @ts-expect-error no error
    .attr("cx", (d) => xScaleZoomed(d.x))
    // @ts-expect-error no error
    .attr("cy", (d) => yScaleZoomed(d.y));
  }

  // public refreshPoints(
  //   transform: d3.ZoomTransform,
  //   xScaleZoomed: d3.ScaleLinear<number, number, never>,
  //   yScaleZoomed: d3.ScaleLinear<number, number, never>
  // ) {
  //   const threshold = 20 / transform.k - 2;
  //   console.log("threshold", threshold);
  //   const xDomain = xScaleZoomed.domain();
  //   const yDomain = yScaleZoomed.domain();

  //   const clusteredData = this._clusterData(threshold, xDomain, yDomain);
  //   console.log(clusteredData);

  //   console.log(clusteredData, xDomain, yDomain);

  //   // Обновляем отображение кластеров
  //   const points = this._chartArea
  //     .selectAll("circle")
  //     .data(clusteredData, (d: any) => `${d.x}-${d.y}`);

  //   // Обновляем существующие точки
  //   points
  //     .attr("cx", (d) => xScaleZoomed(d.x))
  //     .attr("cy", (d) => yScaleZoomed(d.y))
  //     .attr("r", (d) => Math.sqrt(d.count) + 2) // Размер точки зависит от количества точек в кластере
  //     .attr("fill", (d) => {
  //       if (d.y >= 0) {
  //         if (d.count > 1) {
  //           return "black";
  //         }
  //         return d.abort ? "red" : "blue";
  //       } else {
  //         return "gold";
  //       }
  //     });

  //   // Добавляем новые точки
  //   points
  //     .enter()
  //     .append("circle")
  //     .attr("cx", (d) => xScaleZoomed(d.x))
  //     .attr("cy", (d) => yScaleZoomed(d.y))
  //     .attr("r", (d) => Math.sqrt(d.count) + 2)
  //     .attr("fill", (d) => {
  //       if (d.y >= 0) {
  //         if (d.count > 1) {
  //           return "black";
  //         }

  //         return d.abort ? "red" : "blue";
  //       } else {
  //         return "gold";
  //       }
  //     });

  //   // Удаляем старые точки
  //   points.exit().remove();

  //   this._points = points as any;
  // }

  // private _clusterData(threshold: number, xDomain: number[], yDomain: number[]) {
  //   const clusters: Array<Marker & { count: number }> = [];

  //   const visibleData = this._data.filter(
  //     (d) =>
  //       d.x >= xDomain[0] &&
  //       d.x <= xDomain[1] &&
  //       d.y >= yDomain[1] &&
  //       d.y <= yDomain[0]
  //   );

  //   visibleData.forEach((point) => {
  //     // Поиск кластера, к которому точка может быть присоединена
  //     let foundCluster = false;
  //     for (let cluster of clusters) {
  //       // Проверка, находится ли точка в пределах порога по X или Y
  //       if (
  //         Math.abs(point.x - cluster.x) < threshold &&
  //         Math.abs(point.y - cluster.y) < threshold
  //       ) {
  //         // Обновляем положение кластера как среднее между точками
  //         cluster.x =
  //           (cluster.x * cluster.count + point.x) / (cluster.count + 1);
  //         cluster.y =
  //           (cluster.y * cluster.count + point.y) / (cluster.count + 1);
  //         cluster.count += 1; // Увеличиваем количество точек в кластере
  //         foundCluster = true;
  //         break;
  //       }
  //     }

  //     // Если точка не присоединена к существующему кластеру, создаем новый кластер
  //     if (!foundCluster) {
  //       clusters.push({ ...point, count: 1 });
  //     }
  //   });

  //   return clusters;
  // }
}
