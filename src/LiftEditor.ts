import { Point, Polygon, Polyline, SpatialReference } from "@arcgis/core/geometry";
import { contains, densify, offset, planarLength, union } from "@arcgis/core/geometry/geometryEngine";
import { geodesicDistance } from "@arcgis/core/geometry/support/geodesicUtils";
import { webMercatorToGeographic } from "@arcgis/core/geometry/support/webMercatorUtils";
import ElevationSampler from "@arcgis/core/layers/support/ElevationSampler";
import { LineSymbol3D, PointSymbol3D } from "@arcgis/core/symbols";
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
  initialTowerSeparation,
  cableOffset
} from "./constants";
import { createSag, sagToSpanRatio } from "./sag";
import * as vec2 from "./vec2";
import { removeNullable } from "./utils";
import { skiResortArea } from "./data";
import {
  hiddenLineSymbol,
  invalidRouteCableSymbol,
  invalidSketchPreviewLineSymbol,
  invalidSketchPreviewPointSymbol,
  invalidTowerPreviewSymbol,
  parcelSymbol,
  routeCableSymbol,
  sketchPreviewLineSymbol,
  sketchPreviewPointSymbol,
  towerPreviewSymbol,
  towerSymbolLayers
} from "./symbols";
import TreeFilterState from "./TreeFilterState";

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
    this._createPreviewLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Lift routes - create preview"
    });
    this._updatePreviewLayer = new GraphicsLayer({
      elevationInfo: { mode: "relative-to-ground" },
      listMode: "hide",
      title: "Lift routes - update preview"
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
    this._simpleSVM = new SketchViewModel({
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
    this._detailSVM = new SketchViewModel({
      layer: this._detailLayer,
      view,
      defaultUpdateOptions: {
        tool: "reshape",
        reshapeOptions: { shapeOperation: "none" },
        toggleToolOnClick: false
      },
      updateOnGraphicClick: false
    });
    this._elevationSamplerPromise = view.map.ground.createElevationSampler(skiResortArea.extent);
  }

  destroy(): void {
    this._simpleSVM.destroy();
    this._detailSVM.destroy();
    for (const layer of this._layers) {
      this._view.map.remove(layer);
    }
  }

  @property()
  get isCreating(): boolean {
    return this._simpleSVM.createGraphic != null;
  }

  @property()
  get exportFeatures(): { cableFeatures: Graphic[]; towerFeatures: Graphic[][] } {
    return {
      cableFeatures: this._cableDisplayLayer.graphics.toArray(),
      towerFeatures: this._towerDisplayLayers.map((l) => l.graphics.toArray())
    };
  }

  @property()
  get treeFilterGeometry(): Geometry | null {
    return this._treeFilterState.geometry;
  }

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
   * Stores graphics used to show a simplified preview of the lift cables and towers while creating.
   */
  private readonly _createPreviewLayer: GraphicsLayer;

  /**
   * Stores graphics used to show a simplified preview of the lift cables and towers while updating.
   */
  private readonly _updatePreviewLayer: GraphicsLayer;

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
   * SketchViewModel used to create the start and end points of lifts.
   */
  private readonly _simpleSVM: SketchViewModel;

  /**
   * SketchViewModel used to update the towers of lifts.
   */
  private readonly _detailSVM: SketchViewModel;

  private readonly _elevationSamplerPromise: Promise<ElevationSampler>;
  private readonly _treeFilterState = new TreeFilterState();

  private get _layers(): Layer[] {
    return [
      this._simpleLayer,
      this._detailLayer,
      this._cableDisplayLayer,
      this._createPreviewLayer,
      this._updatePreviewLayer,
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

    let createHandle: IHandle | null = null;
    const cleanup = () => {
      this._parcelLayer.visible = false;
      this._createPreviewLayer.removeAll();
      this._treeFilterState.revert();
      createHandle = removeNullable(createHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._simpleSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

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

      populatePreviewLayer(this._createPreviewLayer, {
        detailGeometry,
        cableSymbol: isValid ? sketchPreviewLineSymbol : invalidSketchPreviewLineSymbol,
        towerSymbol: isValid ? sketchPreviewPointSymbol : invalidSketchPreviewPointSymbol
      });
      this._treeFilterState.stage(detailGeometry);
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
        title: "Lift towers"
      });
      this._towerDisplayLayers.push(towerLayer);
      this._view.map.add(towerLayer);
      placeTowers(towerLayer, detailGeometry, elevationSampler);

      this._treeFilterState.stage(detailGeometry);
      this._treeFilterState.commit();

      const group = { simpleGraphic, detailGraphic, displayGraphic, towerLayer };
      this._graphicGroups.push(group);
      return group;
    };

    const validVertices: number[][] = [];
    createHandle = this._simpleSVM.on("create", (e) => {
      switch (e.state) {
        case "cancel":
          cleanup();
          return;
        case "complete": {
          // remove graphic created by SVM, we will create our own
          this._simpleLayer.remove(e.graphic);
          const { simpleGraphic } = completeGeometry(validVertices);
          cleanup();
          this.update(simpleGraphic, { signal });
          return;
        }
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
            Promise.resolve().then(() => this._simpleSVM.undo());
            return;
          }
          validVertices.push(e.toolEventInfo.vertices.at(-1).coordinates);
          if (validVertices.length === 2) {
            this._simpleSVM.complete();
          }
          break;
      }
    });
    this._simpleSVM.create("polyline", { mode: "click" });
  }

  /**
   * Start the interactive update of an existing lift.
   */
  async update(graphic: Graphic, { signal }: { signal: AbortSignal }): Promise<void> {
    const group = this._findGraphicGroup(graphic);
    if (!group) {
      return;
    }
    const { simpleGraphic, detailGraphic, displayGraphic, towerLayer } = group;

    const showPreviewLayer = (detailGeometry: Polyline, { isValid }: { isValid: boolean }) => {
      // while updating hide the display graphics and show less detailed preview graphics instead
      displayGraphic.visible = false;
      towerLayer.visible = false;
      populatePreviewLayer(this._updatePreviewLayer, {
        detailGeometry,
        cableSymbol: isValid ? routeCableSymbol : invalidRouteCableSymbol,
        towerSymbol: isValid ? towerPreviewSymbol : invalidTowerPreviewSymbol
      });
    };
    const hidePreviewLayer = () => {
      displayGraphic.visible = true;
      towerLayer.visible = true;
      this._updatePreviewLayer.removeAll();
    };

    let updateHandle: IHandle | null = null;
    const cleanup = () => {
      hidePreviewLayer();
      this._parcelLayer.visible = false;
      // reset the filter to include the updated feature
      this._treeFilterState.commit(this._detailLayer.graphics.toArray().map((g) => g.geometry));
      updateHandle = removeNullable(updateHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._detailSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while updating, display the area within which lifts can be updated
    this._parcelLayer.visible = true;

    const elevationSampler = await this._elevationSamplerPromise;
    let initialDetailGeometry: Polyline | null = null;
    updateHandle = this._detailSVM.on("update", (e) => {
      if (e.tool !== "reshape") {
        return;
      }

      const detailGeometry = detailGraphic.geometry as Polyline;
      switch (e.state) {
        case "start":
          showPreviewLayer(detailGeometry, { isValid: true });
          return;
        case "complete":
          // once complete, update the display graphics to reflect any changes made to the detail geometry
          displayGraphic.geometry = detailGeometryToDisplayGeometry(detailGeometry, elevationSampler);
          placeTowers(towerLayer, detailGeometry, elevationSampler);
          cleanup();
          return;
      }

      if (e.toolEventInfo?.type === "reshape-start") {
        // exclude the feature being updated from the filter
        this._treeFilterState.commit(
          this._detailLayer.graphics
            .toArray()
            .filter((g) => g !== detailGraphic)
            .map((g) => g.geometry)
        );
        initialDetailGeometry = detailGeometry.clone();
      }

      /**
       * If we are reshaping the start vertex, to constrain points to a line we must measure their
       * distances relative to the end vertex. If we measured relative to the start vertex in this
       * case we would be measuring relative to its unconstrained position.
       */
      const reshapingStart = !vec2.equals(detailGeometry.paths[0][0], initialDetailGeometry.paths[0][0]);
      let newDetailGeometry = constrainRouteDetailGeometry(detailGraphic.geometry as Polyline, {
        relativeToStart: !reshapingStart
      });

      let isValid = isRouteValid(newDetailGeometry, skiResortArea);
      if (e.toolEventInfo?.type === "reshape-stop") {
        // once we stop reshaping, if the new detail geometry is invalid then revert the change
        if (isValid) {
          // store the constrained geometry on the simple and detail graphics
          const path = (detailGraphic.geometry as Polyline).paths[0];
          const start = [...path[0]];
          const end = [...path[path.length - 1]];
          simpleGraphic.geometry = new Polyline({
            paths: [[start, end]],
            spatialReference: detailGraphic.geometry.spatialReference
          });
          detailGraphic.geometry = newDetailGeometry;
        } else {
          newDetailGeometry = initialDetailGeometry;
          detailGraphic.geometry = initialDetailGeometry;
          isValid = true;
        }
      }

      // while reshaping, update the preview layer to match the reshaped detail geometry
      showPreviewLayer(newDetailGeometry, { isValid });
      this._treeFilterState.stage(newDetailGeometry);
    });
    this._detailSVM.update(detailGraphic);
  }

  /**
   * Returns true if the graphic can be updated by this editor.
   */
  canUpdateGraphic(graphic: Graphic): boolean {
    return this._findGraphicGroup(graphic) != null;
  }

  private _findGraphicGroup(graphic: Graphic): LiftGraphicGroup | null {
    return this._graphicGroups.find(
      (group) => graphic === group.simpleGraphic || graphic === group.detailGraphic || graphic === group.displayGraphic
    );
  }
}

interface LiftGraphicGroup {
  simpleGraphic: Graphic;
  detailGraphic: Graphic;
  displayGraphic: Graphic;
  towerLayer: GraphicsLayer;
}

function computeTilt(v0: number[], v1: number[]): number {
  return (-Math.atan2(vec2.distance(v0, v1), v1[2] - v0[2]) * 180) / Math.PI + 90;
}

function detailGeometryToDisplayGeometry(detailGeometry: Polyline, elevationSampler: ElevationSampler): Polyline {
  const absoluteHeightGeometry = geometryToAbsoluteHeight(detailGeometry, elevationSampler);
  const offsetGeometries = [
    offset(absoluteHeightGeometry, -cableOffset, "meters"),
    offset(absoluteHeightGeometry, cableOffset, "meters")
  ] as Polyline[];
  for (const geometry of offsetGeometries) {
    geometry.hasZ = true;
    geometry.paths.forEach((path, pathIdx) =>
      path.forEach((v, vIdx) => (v[2] = absoluteHeightGeometry.paths[pathIdx][vIdx][2]))
    );
  }
  return union(offsetGeometries.map((g) => createSag(g, sagToSpanRatio()))) as Polyline;
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

function constrainRouteDetailGeometry(detailGeometry: Polyline, options: { relativeToStart: boolean }): Polyline {
  const path = detailGeometry.paths[0];
  const start = path[0];
  const end = path[path.length - 1];
  const startToEnd = vec2.subtract(end, start);
  const length = vec2.length(startToEnd);
  const newPath = [];
  const v0 = options.relativeToStart ? start : end;
  const v1 = options.relativeToStart ? end : start;
  for (const vertex of path) {
    const relativeToV0 = vec2.subtract(vertex, v0);
    const fraction = vec2.length(relativeToV0) / length;
    const newVertexRelativeToV0 = vec2.scale(vec2.subtract(v1, v0), fraction);
    const [x, y] = vec2.add(newVertexRelativeToV0, v0);
    const z = vertex[2];
    newPath.push([x, y, z]);
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
    const symbol = new PointSymbol3D({ symbolLayers: towerSymbolLayers({ heading, tilt }) });
    newFeatures.push(
      new Graphic({ attributes: { objectID, heading, tilt, relativeElevation: relativeZPath[i][2] }, geometry, symbol })
    );
    objectID++;
  }
  towerLayer.graphics.removeAll();
  towerLayer.graphics.addMany(newFeatures);
}

function populatePreviewLayer(
  layer: GraphicsLayer,
  {
    detailGeometry,
    cableSymbol,
    towerSymbol
  }: { detailGeometry: Polyline; cableSymbol: LineSymbol3D; towerSymbol: PointSymbol3D }
) {
  layer.removeAll();
  for (const vertex of detailGeometry.paths[0]) {
    const routeTowerPreviewGraphic = new Graphic({
      geometry: vertexToPoint(vertex, detailGeometry.spatialReference),
      symbol: towerSymbol
    });
    layer.add(routeTowerPreviewGraphic);
  }
  const routeCablePreviewGraphic = new Graphic({
    geometry: detailGeometry,
    symbol: cableSymbol
  });
  layer.add(routeCablePreviewGraphic);
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
