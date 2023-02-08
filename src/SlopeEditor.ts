import { watch } from "@arcgis/core/core/reactiveUtils";
import { Polygon, Polyline } from "@arcgis/core/geometry";
import { buffer, contains, generalize, union } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { PolygonSymbol3D } from "@arcgis/core/symbols";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Accessor from "@arcgis/core/core/Accessor";
import Geometry from "@arcgis/core/geometry/Geometry";
import Layer from "@arcgis/core/layers/Layer";

import { hiddenLineSymbol, parcelSymbol } from "./symbols";
import { skiResortArea } from "./data";
import { slopeBufferDistance, slopeMaxDeviation } from "./constants";
import { removeNullable } from "./utils";

const bufferSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new FillSymbol3DLayer({
      material: {
        color: [167, 209, 234, 1]
      }
    })
  ]
});

@subclass("digital-mountain.SlopeEditor")
class SlopeEditor extends Accessor {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;

    this._simpleLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Slopes - centerlines"
    });
    this._bufferLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Slopes - buffer"
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
        reshapeOptions: { shapeOperation: "none" },
        toggleToolOnClick: false
      },
      polylineSymbol: hiddenLineSymbol,
      snappingOptions: {
        enabled: true,
        selfEnabled: false,
        featureSources: [{ layer: this._simpleLayer, enabled: true }]
      },
      updateOnGraphicClick: false
    });
  }

  private readonly _view: SceneView;

  /**
   * Stores graphics for the centerline of slopes, which the 'simple' SketchViewModel will update.
   */
  private readonly _simpleLayer: GraphicsLayer;

  /**
   * Stores graphics for the buffer of the slope being created.
   */
  private readonly _bufferLayer: GraphicsLayer;

  /**
   * Stores a graphic used to visualize the area within which slopes can be created or updated.
   */
  private readonly _parcelLayer: GraphicsLayer;

  /**
   * SketchViewModel used to create and update the centerline of slopes.
   */
  private readonly _simpleSVM: SketchViewModel;

  private _routeToBufferMap = new Map();
  private _bufferToRouteMap = new Map();

  private get _layers(): Layer[] {
    return [this._simpleLayer, this._bufferLayer, this._parcelLayer];
  }

  /**
   * Start the interactive creation of a new slope.
   */
  create({ signal }: { signal: AbortSignal }): void {
    const bufferGraphic = new Graphic({
      geometry: null,
      symbol: bufferSymbol
    });
    this._bufferLayer.add(bufferGraphic);
    let routeGraphic: Graphic | null = null;

    let createHandle: IHandle | null = null;
    const cleanup = (options?: { removeRoute?: boolean }) => {
      if (options?.removeRoute || !isRouteValid(routeGraphic?.geometry, skiResortArea)) {
        this._bufferLayer.remove(bufferGraphic);
        this._simpleLayer.remove(routeGraphic);
      }
      this._parcelLayer.visible = false;
      createHandle = removeNullable(createHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._simpleSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while creating, display the area within which slopes can be created
    this._parcelLayer.visible = true;

    createHandle = this._simpleSVM.on("create", (e) => {
      routeGraphic = e.graphic;
      switch (e.state) {
        case "start": {
          break;
        }
        case "cancel":
          cleanup({ removeRoute: true });
          break;
        case "complete":
          if (isRouteValid(routeGraphic?.geometry, skiResortArea)) {
            routeGraphic.geometry = generalize(routeGraphic.geometry, slopeMaxDeviation);
            this._routeToBufferMap.set(routeGraphic, bufferGraphic);
            this._bufferToRouteMap.set(bufferGraphic, routeGraphic);
          }
          cleanup();
          this.update(routeGraphic, { signal });
          break;
      }
      if (e.toolEventInfo?.type === "cursor-update" || e.toolEventInfo?.type === "vertex-add") {
        let bufferGeometry = buffer(routeGraphic.geometry, slopeBufferDistance) as Polygon;
        bufferGeometry = bufferGeometry ? (generalize(bufferGeometry, slopeMaxDeviation) as Polygon) : null;
        bufferGraphic.geometry = bufferGeometry;
      }
    });
    this._simpleSVM.create("polyline", { mode: "hybrid" });
  }

  /**
   * Start the interactive update of an existing slope.
   */
  update(graphic: Graphic, { signal }: { signal: AbortSignal }): void {
    let bufferGraphic: Graphic;
    let routeGraphic: Graphic;
    if (this._routeToBufferMap.has(graphic)) {
      routeGraphic = graphic;
      bufferGraphic = this._routeToBufferMap.get(graphic);
    } else if (this._bufferToRouteMap.has(graphic)) {
      routeGraphic = this._bufferToRouteMap.get(graphic);
      bufferGraphic = graphic;
    }
    if (!bufferGraphic || !routeGraphic) {
      return;
    }

    let updateHandle: IHandle | null = null;
    const cleanup = () => {
      this._parcelLayer.visible = false;
      updateHandle = removeNullable(updateHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._simpleSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while updating, display the area within which slopes can be updated
    this._parcelLayer.visible = true;

    updateHandle = this._simpleSVM.on("update", (e) => {
      const routeGeometry = e.graphics.at(0).geometry;
      let bufferGeometry = buffer(routeGeometry, slopeBufferDistance) as Polygon;
      bufferGeometry = generalize(bufferGeometry, slopeMaxDeviation) as Polygon;
      bufferGraphic.geometry = bufferGeometry;
    });
    this._simpleSVM.update(routeGraphic);
  }

  /**
   * Returns true if the graphic can be updated by this editor.
   */
  canUpdateGraphic(graphic: Graphic): boolean {
    return this._routeToBufferMap.has(graphic) || this._bufferToRouteMap.has(graphic);
  }
}

function isRouteValid(geometry: Geometry | null, parcelGeometry: Polygon): boolean {
  if (!geometry || geometry.type !== "polyline") {
    return false;
  }
  const polyline = geometry as Polyline;
  if (polyline.paths[0].length <= 1) {
    return false;
  }
  if (!contains(parcelGeometry, polyline)) {
    return false;
  }
  return true;
}

export default SlopeEditor;
