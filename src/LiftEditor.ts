import { Point, Polygon, Polyline, SpatialReference } from "@arcgis/core/geometry";
import { contains, densify, planarLength } from "@arcgis/core/geometry/geometryEngine";
import { geodesicDistance } from "@arcgis/core/geometry/support/geodesicUtils";
import { webMercatorToGeographic } from "@arcgis/core/geometry/support/webMercatorUtils";
import ElevationSampler from "@arcgis/core/layers/support/ElevationSampler";
import { PointSymbol3D } from "@arcgis/core/symbols";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Layer from "@arcgis/core/layers/Layer";
import Geometry from "@arcgis/core/geometry/Geometry";

import {
  initialTowerHeight,
  minTowerHeight,
  maxTowerHeight,
  minCableLength,
  maxCableLength,
  minTowerSeparation,
  initialTowerSeparation
} from "./constants";
import { createSag, sagToSpanRatio } from "./sag";
import * as vec2 from "./vec2";
import { removeNullable } from "./utils";
import { skiResortArea } from "./data";
import {
  hiddenLineSymbol,
  invalidRouteCableSymbol,
  invalidTowerPreviewSymbol,
  parcelSymbol,
  routeCableSymbol,
  towerPreviewSymbol,
  towerSymbolLayer
} from "./symbols";

@subclass("digital-mountain.LiftEditor")
class LiftEditor extends Accessor {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;

    this._simpleLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Lift routes - simple"
    });
    this._detailLayer = new GraphicsLayer({
      elevationInfo: { mode: "relative-to-ground" },
      listMode: "hide",
      title: "Lift routes - detail"
    });
    this._previewLayer = new GraphicsLayer({
      elevationInfo: { mode: "relative-to-ground" },
      listMode: "hide",
      title: "Lift routes - preview"
    });
    this._cableDisplayLayer = new GraphicsLayer({
      elevationInfo: { mode: "absolute-height" },
      listMode: "hide",
      title: "Lift routes - display"
    });
    this._parcelLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      graphics: [new Graphic({ geometry: skiResortArea, symbol: parcelSymbol })],
      listMode: "hide",
      title: "Editable parcel",
      visible: false
    });
    for (const layer of this._layers) {
      view.map.add(layer);
    }
    this._routeSimpleSVM = new SketchViewModel({
      layer: this._simpleLayer,
      view,
      defaultUpdateOptions: {
        tool: "reshape",
        reshapeOptions: { shapeOperation: "none", edgeOperation: "none" },
        toggleToolOnClick: false
      },
      polylineSymbol: hiddenLineSymbol,
      tooltipOptions: {
        enabled: true
      },
      updateOnGraphicClick: false
    });
    this._elevationSamplerPromise = view.map.ground.createElevationSampler(skiResortArea.extent);
  }

  @property()
  private readonly _view: SceneView;

  /**
   * Stores graphics with only start and end vertices, which the 'simple' SketchViewModel will update.
   */
  private readonly _simpleLayer: GraphicsLayer;

  /**
   * Stores graphics with vertices for each tower, which the 'detail' SketchViewModel will update.
   */
  private readonly _detailLayer: GraphicsLayer;

  /**
   * Stores graphics used to show a simplified preview of the lift cables and towers while creating or editing.
   */
  private readonly _previewLayer: GraphicsLayer;

  /**
   * Stores graphics used to show lift cable visualizations when not creating or editing, with lift cables that sag.
   */
  private readonly _cableDisplayLayer: GraphicsLayer;

  /**
   * Store graphics used to show lift tower visualizations when not creating or editing, with towers that tilt.
   */
  private readonly _towerDisplayLayers: GraphicsLayer[] = [];

  /**
   * Stores a graphic used to visualize the area within which lifts can be created or updated.
   */
  private readonly _parcelLayer: GraphicsLayer;

  /**
   * Associates the graphics that belong to each lift across the various layers.
   */
  private readonly _graphicGroups: LiftGraphicGroup[] = [];

  /**
   * SketchViewModel Used to update the start and end points of lifts.
   */
  private readonly _routeSimpleSVM: SketchViewModel;

  private readonly _elevationSamplerPromise: Promise<ElevationSampler>;

  private get _layers(): Layer[] {
    return [
      this._simpleLayer,
      this._detailLayer,
      this._cableDisplayLayer,
      this._previewLayer,
      this._parcelLayer,
      ...this._towerDisplayLayers
    ];
  }

  /**
   * Start the interactive creation of a new lift.
   */
  async create({ signal }: { signal: AbortSignal }): Promise<void> {
    const elevationSampler = await this._elevationSamplerPromise;

    // while creating, display the area within which lifts can be created
    this._parcelLayer.visible = true;

    let isValid = true;
    const updateGeometry = (vertices: number[][]) => {
      const geometry = setInitialTowerHeight(
        new Polyline({
          paths: [vertices],
          spatialReference: this._view.spatialReference,
          hasZ: true
        })
      );

      const detailGeometry = densify(geometry, initialTowerSeparation) as typeof geometry;
      isValid = isRouteValid(detailGeometry, skiResortArea);

      this._previewLayer.removeAll();
      for (const vertex of detailGeometry.paths[0]) {
        const routeTowerPreviewGraphic = new Graphic({
          geometry: vertexToPoint(vertex, detailGeometry.spatialReference),
          symbol: isValid ? towerPreviewSymbol : invalidTowerPreviewSymbol
        });
        this._previewLayer.add(routeTowerPreviewGraphic);
      }
      const routeCablePreviewGraphic = new Graphic({
        geometry: detailGeometry,
        symbol: isValid ? routeCableSymbol : invalidRouteCableSymbol
      });
      this._previewLayer.add(routeCablePreviewGraphic);
    };

    const completeGeometry = (vertices: number[][]): LiftGraphicGroup => {
      const geometry = setInitialTowerHeight(
        new Polyline({ paths: [vertices], spatialReference: this._view.spatialReference, hasZ: true })
      );

      const simpleGraphic = new Graphic({ geometry, symbol: hiddenLineSymbol });
      this._simpleLayer.add(simpleGraphic);

      const detailGeometry = densify(geometry, initialTowerSeparation) as typeof geometry;
      const detailGraphic = new Graphic({ geometry: detailGeometry, symbol: hiddenLineSymbol });
      this._detailLayer.add(detailGraphic);

      // apply cable sag to the completed geometry
      const displayGraphic = new Graphic({ symbol: routeCableSymbol });
      displayGraphic.geometry = detailGeometryToDisplayGeometry(detailGeometry, elevationSampler);
      this._cableDisplayLayer.add(displayGraphic);

      // create layer used to store tower graphics for the new lift
      const towerLayer = new GraphicsLayer({
        elevationInfo: { mode: "absolute-height" },
        listMode: "hide",
        title: "Tower layer"
      });
      this._towerDisplayLayers.push(towerLayer);
      this._view.map.add(towerLayer);

      placeTowers(towerLayer, detailGeometry, elevationSampler);

      const group = { simpleGraphic, detailGraphic, displayGraphic, towerLayer };
      this._graphicGroups.push(group);
      return group;
    };

    let createHandle: IHandle | null = null;
    const cleanup = () => {
      this._parcelLayer.visible = false;
      this._previewLayer.removeAll();
      createHandle = removeNullable(createHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._routeSimpleSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    const validVertices: number[][] = [];
    this._routeSimpleSVM.create("polyline", { mode: "click" });
    createHandle = this._routeSimpleSVM.on("create", (e) => {
      switch (e.state) {
        case "cancel":
          cleanup();
          return;
        case "complete":
          // remove graphic created by SVM, we will create our own
          this._simpleLayer.remove(e.graphic);
          if (validVertices.length === 2) {
            const { simpleGraphic } = completeGeometry(validVertices);
            cleanup();
            this.update(simpleGraphic, { signal });
          } else {
            cleanup();
          }
          return;
      }
      switch (e.toolEventInfo?.type) {
        case "cursor-update":
          updateGeometry([...validVertices, e.toolEventInfo.coordinates]);
          break;
        case "vertex-add":
          /**
           * Each time the cursor is updated above, we store whether the staged geometry is valid or
           * not. When the vertex is actually added here, we already know whether the geometry is
           * valid or not.
           */
          if (!isValid) {
            // remove the invalid vertex in the next tick
            Promise.resolve().then(() => this._routeSimpleSVM.undo());
            return;
          }
          validVertices.push(e.toolEventInfo.vertices.at(-1).coordinates);
          if (validVertices.length === 2) {
            this._routeSimpleSVM.complete();
          }
          break;
      }
    });
  }

  /**
   * Start the interactive update of an existing lift.
   */
  async update(graphic: Graphic, { signal }: { signal: AbortSignal }): Promise<void> {
    const group = this._graphicGroups.find(
      (group) => graphic === group.simpleGraphic || graphic === group.detailGraphic || graphic === group.displayGraphic
    );
    if (!group) {
      return;
    }
    const { simpleGraphic, detailGraphic, displayGraphic, towerLayer } = group;

    const hidePreviewLayer = () => {
      displayGraphic.visible = true;
      towerLayer.visible = true;
      this._previewLayer.removeAll();
    };

    let updateHandle: IHandle | null = null;
    const cleanup = () => {
      hidePreviewLayer();
      this._parcelLayer.visible = false;
      updateHandle = removeNullable(updateHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._routeSimpleSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while updating, display the area within which lifts can be updated
    this._parcelLayer.visible = true;

    // store the initial geometry on reshape start so that we can revert back to it
    let initialSimpleGeometry: Geometry;

    const elevationSampler = await this._elevationSamplerPromise;
    this._routeSimpleSVM.update(simpleGraphic);
    updateHandle = this._routeSimpleSVM.on("update", (e) => {
      if (e.tool !== "reshape") {
        return;
      }
      switch (e.state) {
        case "start":
          return;
        case "complete":
          cleanup();
          return;
      }

      // align the detailed geometry with the updated simple geometry
      const detailGeometry = alignRouteDetailGeometryWithSimple(
        detailGraphic.geometry as Polyline,
        simpleGraphic.geometry as Polyline
      );

      const isValid = isRouteValid(detailGeometry, skiResortArea);
      switch (e.toolEventInfo?.type) {
        case "reshape-start":
          initialSimpleGeometry = simpleGraphic.geometry.clone();
          break;
        case "reshape-stop":
          if (isValid) {
            // if the new geometry is valid, update the display graphics
            displayGraphic.geometry = detailGeometryToDisplayGeometry(detailGeometry, elevationSampler);
            placeTowers(towerLayer, detailGeometry, elevationSampler);
          } else {
            // otherwise revert back to the initial geometry
            simpleGraphic.geometry = initialSimpleGeometry;
          }
          hidePreviewLayer();
          return;
      }

      // while reshaping, hide the display graphics and show less detailed preview graphics instead
      displayGraphic.visible = false;
      towerLayer.visible = false;

      this._previewLayer.removeAll();
      for (const vertex of detailGeometry.paths[0]) {
        const routeTowerPreviewGraphic = new Graphic({
          geometry: vertexToPoint(vertex, detailGeometry.spatialReference),
          symbol: isValid ? towerPreviewSymbol : invalidTowerPreviewSymbol
        });
        this._previewLayer.add(routeTowerPreviewGraphic);
      }
      const routeCablePreviewGraphic = new Graphic({
        geometry: detailGeometry,
        symbol: isValid ? routeCableSymbol : invalidRouteCableSymbol
      });
      this._previewLayer.add(routeCablePreviewGraphic);
    });
  }
}

interface LiftGraphicGroup {
  simpleGraphic: Graphic;
  detailGraphic: Graphic;
  displayGraphic: Graphic;
  towerLayer: GraphicsLayer;
}

function computeTilt(v0: number[], v1: number[]): number {
  return (-Math.atan2(vec2.distance(v0, v1), v1[2] - v0[2]) * 180) / Math.PI - 90;
}

function detailGeometryToDisplayGeometry(detailGeometry: Polyline, elevationSampler: ElevationSampler): Polyline {
  const absoluteHeightGeometry = geometryToAbsoluteHeight(detailGeometry, elevationSampler);
  return createSag(absoluteHeightGeometry, sagToSpanRatio());
}

function geometryToAbsoluteHeight(geometry: Polyline, elevationSampler: ElevationSampler): Polyline {
  const result = elevationSampler.queryElevation(geometry) as typeof geometry;
  result.paths.forEach((path, pIdx) => {
    path.forEach((v, vIdx) => {
      v[2] += geometry.paths[pIdx][vIdx][2];
    });
  });
  return result;
}

function isRouteValid(detailGeometry: Polyline, parcelGeometry: Polygon): boolean {
  const path = detailGeometry.paths[0];
  if (path.length > 1) {
    const start = path[0];
    const end = path[path.length - 1];
    const startToEnd = vec2.subtract(end, start);
    let previous = start;
    for (const vertex of path) {
      if (vertex[2] < minTowerHeight || vertex[2] > maxTowerHeight) {
        return false;
      }
      if (vertex === start) {
        continue;
      }
      const relativeToPrevious = vec2.subtract(vertex, previous);
      previous = vertex;
      const distance = vec2.length(relativeToPrevious);
      if (distance < minTowerSeparation) {
        return false;
      }
      const isVertexInOrder = vec2.dot(startToEnd, relativeToPrevious) > 0;
      if (!isVertexInOrder) {
        return false;
      }
    }
  }
  const isContained = contains(
    parcelGeometry,
    path.length > 1 ? detailGeometry : vertexToPoint(path[0], detailGeometry.spatialReference)
  );
  const length = planarLength(detailGeometry);
  return isContained && (length === 0 || (length >= minCableLength && length <= maxCableLength));
}

function alignRouteDetailGeometryWithSimple(detailGeometry: Polyline, simpleGeometry: Polyline): Polyline {
  const detailPath = detailGeometry.paths[0];
  const simplePath = simpleGeometry.paths[0];
  const detailStart = detailPath[0];
  const detailEnd = detailPath[detailPath.length - 1];
  const simpleStart = simplePath[0];
  const simpleEnd = simplePath[simplePath.length - 1];
  const simpleStartToEnd = vec2.subtract(simpleEnd, simpleStart);
  const detailStartToEnd = vec2.subtract(detailEnd, detailStart);
  const detailStartToEndLength = vec2.length(detailStartToEnd);
  const newPath = [];
  for (const vertex of detailPath) {
    const relativeToStart = vec2.subtract(vertex, detailPath[0]);
    const fraction = vec2.length(relativeToStart) / detailStartToEndLength;
    const newVertexRelativeToStart = vec2.scale(simpleStartToEnd, fraction);
    const newVertex = vec2.add(newVertexRelativeToStart, simplePath[0]);
    newPath.push([newVertex[0], newVertex[1], vertex[2]]);
  }
  return new Polyline({
    hasZ: true,
    paths: [newPath],
    spatialReference: detailGeometry.spatialReference
  });
}

function placeTowers(towerLayer: GraphicsLayer, relativeZGeometry: Polyline, elevationSampler: ElevationSampler) {
  let objectID = 0;
  const {
    paths: [relativeZPath],
    spatialReference
  } = relativeZGeometry;
  const start = webMercatorToGeographic(vertexToPoint(relativeZPath[0], spatialReference)) as Point;
  const end = webMercatorToGeographic(
    vertexToPoint(relativeZPath[relativeZPath.length - 1], spatialReference)
  ) as Point;
  const heading = geodesicDistance(start, end).azimuth;
  const absoluteZGeometry = geometryToAbsoluteHeight(relativeZGeometry, elevationSampler);
  const absoluteZPath = absoluteZGeometry.paths[0];
  const newFeatures: Graphic[] = [];
  for (let i = 0; i < absoluteZPath.length; i++) {
    const vertex = absoluteZPath[i];
    const nextVertex = absoluteZPath[i + 1];
    const previousVertex = absoluteZPath[i - 1];
    const nextTilt = nextVertex ? computeTilt(vertex, nextVertex) : null;
    const previousTilt = previousVertex ? computeTilt(previousVertex, vertex) : null;
    const tilt = nextTilt != null && previousTilt != null ? (nextTilt + previousTilt) / 2 : nextTilt ?? previousTilt;
    const geometry = vertexToPoint(vertex, relativeZGeometry.spatialReference);
    const symbol = new PointSymbol3D({ symbolLayers: [towerSymbolLayer({ heading, tilt })] });
    newFeatures.push(new Graphic({ attributes: { objectID, heading, tilt }, geometry, symbol }));
    objectID++;
  }
  towerLayer.graphics.removeAll();
  towerLayer.graphics.addMany(newFeatures);
}

function setInitialTowerHeight(line: Polyline): Polyline {
  const result = line.clone();
  for (const path of result.paths) {
    for (const v of path) {
      v[2] = initialTowerHeight;
    }
  }
  return result;
}

function vertexToPoint(vertex: number[], spatialReference: SpatialReference): Point {
  return new Point({ x: vertex[0], y: vertex[1], z: vertex[2], spatialReference });
}

export default LiftEditor;
