import { Drawer } from "./drawer";
import { generateData } from "./generate-data";
import { margin, width, height, zoomPanelHeight } from "./screen.meta";
import "./style.css";
import * as d3 from "d3";
import { ZoomBox } from "./zoomBox";
import { ZoomDrawer } from "./zoomDrawer";

const xScale = d3
  .scaleLinear()
  .domain([0, 640])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLinear()
  .domain([300, -60])
  .range([height - margin.bottom, margin.top]);

const canvas = d3
  .select("#app")
  .select("canvas")
  .attr("width", width)
  .attr("height", height)
  .node() as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const data = generateData(30000);

const zoomBox = new ZoomBox(canvas, xScale, yScale);
const drawer = new Drawer(context, data, zoomBox);

const state = {
  isZoomBoxActive: false,
  transform: d3.zoomIdentity,
  xScaleZoomed: xScale,
  yScaleZoomed: yScale,
  deltaX: 0,
  deltaY: 0,
};

const zoomedCanvas = d3
  .select("#zoomedCanvas")
  .attr("width", width)
  .attr("height", zoomPanelHeight)
  .node() as HTMLCanvasElement;

const zoomedContext = zoomedCanvas.getContext("2d")!;

const zoomDrawer = new ZoomDrawer(zoomedContext);

const zoom = d3
  .zoom()
  .filter((event) => {
    const { offsetX, offsetY } = event;
    if (zoomBox.isDotInsideZoomBox({ x: offsetX, y: offsetY })) {
      state.isZoomBoxActive = true;
      canvas.style.cursor = "grabbing";
    } else {
      state.isZoomBoxActive = false;
    }

    return !state.isZoomBoxActive;
  })
  .scaleExtent([1, 10])
  .extent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom],
  ])
  .translateExtent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom],
  ])
  .on("zoom", (event) => {
    const transform = event.transform;

    const xScaleZoomed = transform.rescaleX(xScale);
    const yScaleZoomed = transform.rescaleY(yScale);

    state.transform = transform;
    state.xScaleZoomed = xScaleZoomed;
    state.yScaleZoomed = yScaleZoomed;

    const visbileData = drawer.redraw(transform, xScaleZoomed, yScaleZoomed);

    zoomDrawer.drawZoomedArea(visbileData, zoomBox, transform, xScaleZoomed, yScaleZoomed);
  });

d3.select(canvas).call(zoom as any);
d3.select(canvas)
  .on("mousemove", (event) => {
    if (state.isZoomBoxActive) {
      const { movementX, movementY } = event;
      zoomBox.updateSelection({ dx: movementX, dy: movementY });
      const { xScaleZoomed, yScaleZoomed, transform } = state;
      const visbileData = drawer.redraw(transform, xScaleZoomed, yScaleZoomed);
      zoomDrawer.drawZoomedArea(visbileData, zoomBox, transform, xScaleZoomed, yScaleZoomed);
    }
  })
  .on("mouseup", () => {
    state.isZoomBoxActive = false;
    canvas.style.cursor = "default";
  });

const visbileData = drawer.redraw(d3.zoomIdentity, xScale, yScale);
zoomDrawer.drawZoomedArea(visbileData, zoomBox, d3.zoomIdentity, xScale, yScale);
