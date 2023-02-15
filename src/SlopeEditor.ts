import { Polygon, Polyline } from "@arcgis/core/geometry";
import { buffer, contains, generalize } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { PolygonSymbol3D } from "@arcgis/core/symbols";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Accessor from "@arcgis/core/core/Accessor";
import Geometry from "@arcgis/core/geometry/Geometry";
import Layer from "@arcgis/core/layers/Layer";

import { hiddenLineSymbol, parcelSymbol, sketchPreviewLineSymbol } from "./symbols";
import { skiResortArea } from "./data";
import { slopeBufferDistance, slopeMaxDeviation } from "./constants";
import { removeNullable } from "./utils";
import TreeFilterState from "./TreeFilterState";

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

    this._parcelLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      graphics: [new Graphic({ geometry: skiResortArea, symbol: parcelSymbol })],
      listMode: "hide",
      title: "Editable parcel",
      visible: false
    });
    this._centerlineLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Slopes - centerlines"
    });
    this._bufferLayer = new GraphicsLayer({
      elevationInfo: { mode: "on-the-ground" },
      listMode: "hide",
      title: "Slopes - buffer"
    });
    for (const layer of this._layers) {
      view.map.add(layer);
    }
    this._centerlineSVM = new SketchViewModel({
      layer: this._centerlineLayer,
      view,
      defaultUpdateOptions: {
        tool: "reshape",
        reshapeOptions: { shapeOperation: "none" },
        toggleToolOnClick: false
      },
      polylineSymbol: sketchPreviewLineSymbol,
      updateOnGraphicClick: false
    });
    this._bufferSVM = new SketchViewModel({
      layer: this._bufferLayer,
      view,
      defaultUpdateOptions: {
        tool: "reshape",
        reshapeOptions: { shapeOperation: "none" },
        toggleToolOnClick: false
      },
      updateOnGraphicClick: false
    });
  }

  destroy(): void {
    this._centerlineSVM.destroy();
    this._bufferSVM.destroy();
    for (const layer of this._layers) {
      this._view.map.remove(layer);
    }
  }

  @property()
  get isCreating(): boolean {
    return this._centerlineSVM.createGraphic != null;
  }

  @property()
  get exportFeatures(): Graphic[] {
    return this._bufferLayer.graphics.toArray();
  }

  @property()
  get treeFilterGeometry(): Geometry | null {
    return this._treeFilterState.geometry;
  }

  private readonly _view: SceneView;

  /**
   * Stores a graphic used to visualize the area within which slopes can be created or updated.
   */
  private readonly _parcelLayer: GraphicsLayer;

  /**
   * Stores graphics for the centerline of slopes, which the 'simple' SketchViewModel will update.
   */
  private readonly _centerlineLayer: GraphicsLayer;

  /**
   * Stores graphics for the area of the slope being created.
   */
  private readonly _bufferLayer: GraphicsLayer;

  /**
   * SketchViewModel used to create slopes.
   */
  private readonly _centerlineSVM: SketchViewModel;

  /**
   * SketchViewModel used to update the area of slopes.
   */
  private readonly _bufferSVM: SketchViewModel;

  private readonly _routeToBufferMap = new Map();
  private readonly _bufferToRouteMap = new Map();
  private readonly _treeFilterState = new TreeFilterState();

  private get _layers(): Layer[] {
    return [this._parcelLayer, this._centerlineLayer, this._bufferLayer];
  }

  /**
   * Start the interactive creation of a new slope.
   */
  create({ signal }: { signal: AbortSignal }): void {
    let bufferGraphic: Graphic | null = null;
    let routeGraphic: Graphic | null = null;

    let createHandle: IHandle | null = null;
    const cleanup = (options?: { removeRoute?: boolean }) => {
      if (options?.removeRoute || !isRouteValid(routeGraphic?.geometry, skiResortArea)) {
        this._bufferLayer.remove(bufferGraphic);
        this._centerlineLayer.remove(routeGraphic);
      }
      this._parcelLayer.visible = false;
      this._treeFilterState.revert();
      createHandle = removeNullable(createHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._centerlineSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while creating, display the area within which slopes can be created
    this._parcelLayer.visible = true;

    createHandle = this._centerlineSVM.on("create", (e) => {
      routeGraphic = e.graphic;
      switch (e.state) {
        case "cancel":
          cleanup({ removeRoute: true });
          return;
        case "complete":
          if (isRouteValid(routeGraphic?.geometry, skiResortArea)) {
            routeGraphic.geometry = generalize(routeGraphic.geometry, slopeMaxDeviation);
            routeGraphic.symbol = hiddenLineSymbol;
            let bufferGeometry = buffer(routeGraphic.geometry, slopeBufferDistance) as Polygon;
            bufferGeometry = generalize(bufferGeometry, slopeMaxDeviation) as Polygon;
            bufferGeometry.hasZ = false;
            bufferGraphic = new Graphic({
              geometry: bufferGeometry,
              symbol: bufferSymbol
            });
            this._bufferLayer.add(bufferGraphic);
            this._routeToBufferMap.set(routeGraphic, bufferGraphic);
            this._bufferToRouteMap.set(bufferGraphic, routeGraphic);
            this._treeFilterState.stage(bufferGeometry);
            this._treeFilterState.commit();
          }
          cleanup();
          this.update(bufferGraphic, { signal });
          return;
      }
      this._treeFilterState.stage(routeGraphic.geometry);
    });
    this._centerlineSVM.create("polyline", { mode: "click" });
  }

  /**
   * Start the interactive update of an existing slope.
   */
  update(graphic: Graphic, { signal }: { signal: AbortSignal }): void {
    let bufferGraphic: Graphic;
    if (this._routeToBufferMap.has(graphic)) {
      bufferGraphic = this._routeToBufferMap.get(graphic);
    } else if (this._bufferToRouteMap.has(graphic)) {
      bufferGraphic = graphic;
    }
    if (!bufferGraphic) {
      return;
    }

    let updateHandle: IHandle | null = null;
    const cleanup = () => {
      this._parcelLayer.visible = false;
      this._treeFilterState.revert();
      updateHandle = removeNullable(updateHandle);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      this._bufferSVM.cancel();
      cleanup();
    };
    signal.addEventListener("abort", onAbort, { once: true });

    // while updating, display the area within which slopes can be updated
    this._parcelLayer.visible = true;
    updateHandle = this._bufferSVM.on("update", (e) => {
      if (e.toolEventInfo?.type === "reshape-start") {
        // exclude the feature being updated from the filter
        this._treeFilterState.commit(
          this._bufferLayer.graphics
            .toArray()
            .filter((g) => g !== bufferGraphic)
            .map((g) => g.geometry)
        );
      }
      this._treeFilterState.stage(e.graphics[0].geometry);
      if (e.state === "complete") {
        console.log(e.graphics[0] === bufferGraphic, this._bufferToRouteMap.has(bufferGraphic));
        this._treeFilterState.commit();
      }
    });
    this._bufferSVM.update(bufferGraphic);
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
