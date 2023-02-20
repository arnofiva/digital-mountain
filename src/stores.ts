import Camera from "@arcgis/core/Camera";
import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import { MeasurementSystem } from "@arcgis/core/core/units";
import { Polygon } from "@arcgis/core/geometry";
import Geometry from "@arcgis/core/geometry/Geometry";
import { buffer } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import SceneFilter from "@arcgis/core/layers/support/SceneFilter";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";

import {
  backgroundAnimationTargetCamera,
  backgroundCamera,
  monitorScreenStartCamera,
  planScreenStartCamera,
  visitScreenStartCamera
} from "./cameras";
import { AlertData, AlertType, ScreenType, SlopeStreamEvent, TaskScreenType, UIActions } from "./interfaces";
import { sceneExportTitle, treeFilterDistance } from "./constants";
import {
  findCablesLayer,
  findSlopesLayer,
  findTowersLayer,
  findTreeLayer,
  liftIdFilterField,
  liftIdFilterValue,
  portalUrl,
  slopeIdFilterField,
  slopeIdFilterValue
} from "./data";
import createAssetsStream from "./layers/liveAssets";
import createSlopeStream from "./layers/liveSlopes";
import LiftEditor from "./LiftEditor";
import SlopeEditor from "./SlopeEditor";
import assetEvents from "./streamServiceMock/events/assetEvents";
import slopeEvents from "./streamServiceMock/events/slopeEvents";
import StreamServiceMock from "./streamServiceMock/layers/streamServiceMock";
import { abortNullable, getDefaultMeasurementSystem, ignoreAbortErrors } from "./utils";

/**
 * The speed factor used for the animation of the camera in the background of the task selection screen.
 */
const backgroundCameraAnimationSpeedFactor = 0.01;

/**
 * The speed factor used for the animation of the camera when transitioning between screens.
 */
const transitionCameraAnimationSpeedFactor = 0.5;

/**
 * Class name set on the body element while on a task screen, used to adjust the layout of the view.
 */
const taskScreenClass = "task-screen";

@subclass("digital-mountain.Store")
export class Store extends Accessor implements UIActions {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    view.when(() => hidePlannedFeatures(view.map));
  }

  @property()
  get screenStore(): ScreenStoreUnion | null {
    return this._screenStore;
  }

  @property()
  private _screenStore: ScreenStoreUnion | null = null;

  private readonly _view: SceneView;

  /*************
   * UI actions
   *************/

  exportPlan(): void {
    if (this._screenStore?.type === ScreenType.Plan) {
      this._screenStore.exportPlan();
    }
  }

  goToAlert(data: AlertData): void {
    console.log("alert clicked", data);
  }

  openTaskScreen(taskScreenType: TaskScreenType): void {
    this._screenStore?.destroy();
    document.body.classList.add(taskScreenClass);
    const view = this._view;
    switch (taskScreenType) {
      case ScreenType.Monitor:
        this._screenStore = new MonitorStore({ view });
        break;
      case ScreenType.Plan:
        this._screenStore = new PlanStore({ view });
        break;
      case ScreenType.Visit:
        this._screenStore = new VisitStore({ view });
        break;
    }
    this._screenStore.addHandles(this._setupHitTest());
  }

  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void {
    this._screenStore?.destroy();
    document.body.classList.remove(taskScreenClass);
    this._screenStore = new TaskSelectionStore({
      animateCameraToStart: options.animateCameraToStart,
      view: this._view
    });
  }

  startSlopeEditor(options?: { updateGraphic?: Graphic }): void {
    if (this._screenStore?.type === ScreenType.Plan) {
      this._screenStore.startSlopeEditor(options);
    }
  }

  startLiftEditor(options?: { updateGraphic?: Graphic }): void {
    if (this._screenStore?.type === ScreenType.Plan) {
      this._screenStore.startLiftEditor(options);
    }
  }

  /***************
   * View actions
   ***************/

  private _setupHitTest(): IHandle {
    return this._view.on("click", (event) => {
      this._view.hitTest(event).then((response) => {
        for (const result of response.results) {
          if (result?.type !== "graphic") {
            continue;
          }
          const { graphic } = result;
          if (this._screenStore && "hitTest" in this._screenStore && this._screenStore.hitTest(graphic)) {
            break;
          }
        }
      });
    });
  }
}

type ScreenStoreUnion = TaskSelectionStore | MonitorStore | PlanStore | VisitStore;

@subclass("digital-mountain.ScreenStore")
class ScreenStore extends Accessor {
  /**
   * Creates an abort controller that will be automatically removed when the object is destroyed.
   */
  protected createAbortController(): AbortController {
    const abortController = new AbortController();
    this.addHandles({ remove: () => abortController.abort() });
    return abortController;
  }
}

@subclass("digital-mountain.TaskSelectionStore")
export class TaskSelectionStore extends ScreenStore {
  readonly type = ScreenType.TaskSelection;

  constructor({ animateCameraToStart, view }: { animateCameraToStart: boolean; view: SceneView }) {
    super();
    // hide UI on task selection screen and restore once task is selected
    view.ui.components = [];
    this.addHandles({ remove: () => (view.ui.components = this._defaultUIComponents) });
    // hide layers until task is selected
    view.when(() => {
      if (!this.destroyed) {
        view.map.allLayers.forEach((l) => {
          this._initialLayerVisibilities.push(l.visible);
          if (l.type !== "elevation" && l.type !== "tile") {
            l.visible = false;
          }
        });
      }
    });
    this.addHandles({
      remove: () => {
        view.map.allLayers.forEach((l, i) => (l.visible = this._initialLayerVisibilities[i]));
      }
    });
    const { signal } = this.createAbortController();
    this._startBackgroundCameraAnimation(view, { animateCameraToStart, signal });
  }

  private readonly _initialLayerVisibilities: boolean[] = [];

  private async _startBackgroundCameraAnimation(
    view: SceneView,
    {
      animateCameraToStart,
      signal
    }: {
      animateCameraToStart: boolean;
      signal: AbortSignal;
    }
  ): Promise<void> {
    const camera1 = backgroundCamera;
    const camera2 = backgroundAnimationTargetCamera;
    await view.when();
    if (animateCameraToStart) {
      await ignoreAbortErrors(
        view.goTo(camera1, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal })
      );
    } else {
      view.camera = camera1;
    }
    let targetCamera = camera2;
    while (!signal.aborted) {
      await ignoreAbortErrors(
        view.goTo(targetCamera, { animate: true, speedFactor: backgroundCameraAnimationSpeedFactor, signal })
      );
      // loop between the camera positions
      targetCamera = targetCamera === camera2 ? camera1 : camera2;
    }
  }

  private get _defaultUIComponents(): string[] {
    return ["attribution", "zoom", "navigation-toggle", "compass"];
  }
}

@subclass("digital-mountain.MonitorStore")
export class MonitorStore extends ScreenStore {
  readonly type = ScreenType.Monitor;

  private readonly _assetsStream: StreamLayer;
  private readonly _slopeStream: StreamLayer;
  private readonly _streamMock: StreamServiceMock;

  constructor({ view }: { view: SceneView }) {
    super();
    const { signal } = this.createAbortController();

    goToTaskScreenStart(monitorScreenStartCamera, { signal, view });

    this._assetsStream = createAssetsStream();
    this._slopeStream = createSlopeStream();
    const assetsMock = new StreamServiceMock(
      this._assetsStream.url,
      "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowCat_StreamLayer4/FeatureServer/0"
    );
    const slopeMock = new StreamServiceMock(
      this._slopeStream.url,
      "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/Laax_Pisten/FeatureServer/6"
    );
    assetsMock.setEvents(assetEvents);
    slopeMock.setEvents(slopeEvents);
    view.map.add(this._assetsStream);
    view.map.add(this._slopeStream);
    view.whenLayerView(this._assetsStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      assetsMock.start(lv);
    });
    view.whenLayerView(this._slopeStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      this.addHandles(
        lv.on("data-received", (e: SlopeStreamEvent) => {
          if (e.attributes.showAlert) {
            const alertData = {
              type: e.attributes.STATUS.toLowerCase() === "offen" ? AlertType.SlopeOpen : AlertType.SlopeClose,
              date: new Date(),
              slopeId: e.attributes.track_id
            };
            this._alerts.add(alertData, 0);
          }
        })
      );
      slopeMock.start(lv);
    });
    this.addHandles({
      remove: () => {
        view.map.remove(this._assetsStream);
        view.map.remove(this._slopeStream);
        assetsMock.stop();
        slopeMock.stop();
      }
    });

    const expand = new Expand({
      view,
      content: new LayerList({ view })
    });
    view.ui.add(expand, "bottom-left");
    this.addHandles({ remove: () => view.ui.remove(expand) });
  }

  /**
   * Data for alerts, sorted from newest to oldest.
   */
  @property()
  get alerts(): Collection<AlertData> {
    return this._alerts;
  }

  @property()
  private _alerts = new Collection<AlertData>([
    // placeholder alerts
    { type: AlertType.Accident, date: new Date(), slopeId: 23 },
    { type: AlertType.AccidentArrival, date: new Date(), slopeId: 23 },
    { type: AlertType.Avalanche, date: new Date() },
    { type: AlertType.SlopeOpen, date: new Date(), slopeId: 23 },
    { type: AlertType.SlopeClose, date: new Date(), slopeId: 23 }
  ]);
}

@subclass("digital-mountain.PlanStore")
export class PlanStore extends ScreenStore {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    this._liftEditor = new LiftEditor({ view });
    this._slopeEditor = new SlopeEditor({ view });
    const { signal } = this.createAbortController();
    goToTaskScreenStart(planScreenStartCamera, { signal, view });
    this._setupTreeFilterWatch(view);
  }

  destroy(): void {
    this._liftEditor.destroy();
    this._slopeEditor.destroy();
  }

  readonly type = ScreenType.Plan;

  private readonly _view: SceneView;
  private readonly _liftEditor: LiftEditor;
  private readonly _slopeEditor: SlopeEditor;
  private _planningAbortController: AbortController | null = null;

  @property()
  get hint(): string | null {
    if (this._liftEditor.isCreating) {
      return "Click in the view to place start and end points for the new lift";
    }
    if (this._slopeEditor.isCreating) {
      return "Click in the view to draw the new slope";
    }
    return null;
  }

  @property()
  get cableLength(): number {
    return this._liftEditor.cableLength;
  }

  @property()
  get measurementSystem(): MeasurementSystem {
    return getDefaultMeasurementSystem(this._view);
  }

  @property()
  get slopeSurfaceArea(): number {
    return this._slopeEditor.slopeSurfaceArea;
  }

  @property()
  get towerCount(): number {
    return this._liftEditor.towerCount;
  }

  @property()
  get exporting(): boolean {
    return this._exporting;
  }

  @property()
  private _exporting = false;

  @property()
  get didExportFail(): boolean {
    return this._didExportFail;
  }

  @property()
  private _didExportFail = false;

  async exportPlan(): Promise<void> {
    this._planningAbortController = abortNullable(this._planningAbortController);
    const scene = this._view.map as WebScene;
    const cablesLayer = findCablesLayer(scene);
    const towersLayer = findTowersLayer(scene);
    const slopesLayer = findSlopesLayer(scene);
    const existingCablesDefinitionExpression = cablesLayer.definitionExpression;
    const existingTowersDefinitionExpression = towersLayer.definitionExpression;
    const existingSlopesDefinitionExpression = slopesLayer.definitionExpression;
    this._exporting = true;
    this._didExportFail = false;
    try {
      const [{ cableObjectIds, towerObjectIds }, slopeObjectIds] = await Promise.all([
        this._exportLifts(),
        this._exportSlopes()
      ]);
      await scene.updateFrom(this._view);
      scene.presentation.slides.removeAll();
      setExportDefinitionExpression(cablesLayer, cableObjectIds);
      setExportDefinitionExpression(towersLayer, towerObjectIds);
      setExportDefinitionExpression(slopesLayer, slopeObjectIds);
      const item = await scene.saveAs(
        { title: sceneExportTitle, portal: { url: portalUrl } },
        // ignore errors triggered by attempting to save graphics layers
        { ignoreUnsupported: true }
      );
      const viewerUrl = item.portal.url + "/home/webscene/viewer.html?webscene=" + item.id;
      window.open(viewerUrl, "_blank");
    } catch (e) {
      this._didExportFail = true;
      console.error("Export failed", e);
    }
    this._exporting = false;
    cablesLayer.definitionExpression = existingCablesDefinitionExpression;
    towersLayer.definitionExpression = existingTowersDefinitionExpression;
    slopesLayer.definitionExpression = existingSlopesDefinitionExpression;
  }

  startSlopeEditor(options?: { updateGraphic?: Graphic }): void {
    this._planningAbortController?.abort();
    const { signal } = (this._planningAbortController = this.createAbortController());
    if (options?.updateGraphic) {
      this._slopeEditor.update(options.updateGraphic, { signal });
    } else {
      this._slopeEditor.create({ signal });
    }
  }

  startLiftEditor(options?: { updateGraphic?: Graphic }): void {
    this._planningAbortController?.abort();
    const { signal } = (this._planningAbortController = this.createAbortController());
    if (options?.updateGraphic) {
      this._liftEditor.update(options.updateGraphic, { signal });
    } else {
      this._liftEditor.create({ signal });
    }
  }

  /**
   * Returns true if the graphic could be edited by the slope or lift editors.
   */
  hitTest(graphic: Graphic): boolean {
    if (this._slopeEditor.canUpdateGraphic(graphic)) {
      this.startSlopeEditor({ updateGraphic: graphic });
      return true;
    } else if (this._liftEditor.canUpdateGraphic(graphic)) {
      this.startLiftEditor({ updateGraphic: graphic });
      return true;
    }
    return false;
  }

  private async _exportLifts(): Promise<{ cableObjectIds: number[]; towerObjectIds: number[] }> {
    const { cableFeatures, towerFeatures } = this._liftEditor.exportFeatures;
    // add attributes required by layers
    for (const feature of cableFeatures) {
      if (!feature.attributes) {
        feature.attributes = {};
      }
      feature.attributes[liftIdFilterField] = liftIdFilterValue;
    }
    for (const features of towerFeatures) {
      features.forEach((feature, i) => {
        if (!feature.attributes) {
          feature.attributes = {};
        }
        feature.attributes[liftIdFilterField] = liftIdFilterValue;
        feature.attributes["PositionAlongCable"] = i;
      });
    }
    const cablesLayer = findCablesLayer(this._view.map);
    const towersLayer = findTowersLayer(this._view.map);
    const [cableResult, towerResult] = await Promise.all([
      cablesLayer.applyEdits({ addFeatures: cableFeatures }),
      towersLayer.applyEdits({ addFeatures: towerFeatures.flat() })
    ]);
    const cableObjectIds = cableResult.addFeatureResults.map((result) => {
      if (result.error) {
        throw result.error;
      }
      return result.objectId;
    });
    const towerObjectIds = towerResult.addFeatureResults.map((result) => {
      if (result.error) {
        throw result.error;
      }
      return result.objectId;
    });
    return { cableObjectIds, towerObjectIds };
  }

  private async _exportSlopes(): Promise<number[]> {
    const features = this._slopeEditor.exportFeatures;
    // add attributes required by layer
    for (const feature of features) {
      if (!feature.attributes) {
        feature.attributes = {};
      }
      feature.attributes[slopeIdFilterField] = slopeIdFilterValue;
    }
    const layer = findSlopesLayer(this._view.map);
    const { addFeatureResults } = await layer.applyEdits({ addFeatures: features });
    return addFeatureResults.map((result) => {
      if (result.error) {
        throw result.error;
      }
      return result.objectId;
    });
  }

  private _setupTreeFilterWatch(view: SceneView): void {
    const treeLayer = findTreeLayer(view.map);
    // avoid setting the filter too frequently to keep it feeling responsive
    const intervalMs = 100;
    let previousGeometries: Geometry[] = [];
    const intervalHandle = setInterval(() => {
      const geometries = [this._liftEditor.treeFilterGeometry, this._slopeEditor.treeFilterGeometry].filter(
        (g) => g != null
      );
      if (geometries.every((v, i) => v === previousGeometries[i])) {
        // the geometries did not change
        return;
      }
      previousGeometries = geometries;
      if (geometries.length === 0) {
        treeLayer.filter = null;
        return;
      }
      const bufferGeometries = (buffer(geometries, treeFilterDistance, "meters") as Polygon[]).filter((g) => g != null);
      treeLayer.filter = new SceneFilter({
        geometries: bufferGeometries,
        spatialRelationship: "disjoint"
      });
    }, intervalMs);
    this.addHandles({
      remove: () => {
        clearInterval(intervalHandle);
        treeLayer.filter = null;
      }
    });
  }
}

@subclass("digital-mountain.VisitStore")
export class VisitStore extends ScreenStore {
  readonly type = ScreenType.Visit;

  constructor({ view }: { view: SceneView }) {
    super();
    const { signal } = this.createAbortController();
    goToTaskScreenStart(visitScreenStartCamera, { signal, view });
  }
}

function goToTaskScreenStart(camera: Camera, { signal, view }: { signal: AbortSignal; view: SceneView }): void {
  ignoreAbortErrors(view.goTo(camera, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal }));
}

/**
 * Hide previously exported copies of planned features in feature layers and show them only in graphics layers.
 */
function hidePlannedFeatures(map: Map): void {
  appendDefinitionExpression(findCablesLayer(map), "AND", `${liftIdFilterField} <> ${liftIdFilterValue}`);
  appendDefinitionExpression(findTowersLayer(map), "AND", `${liftIdFilterField} <> ${liftIdFilterValue}`);
  appendDefinitionExpression(findSlopesLayer(map), "AND", `${slopeIdFilterField} <> '${slopeIdFilterValue}'`);
}

/**
 * Isolate newly planned features in the exported scene.
 */
function setExportDefinitionExpression(layer: FeatureLayer, objectIds: number[]): void {
  appendDefinitionExpression(layer, "OR", `${layer.objectIdField} IN (${objectIds.join(",")})`);
}

/**
 * Set a new definition expression on the layer, combining it with any existing expression if one exists.
 */
function appendDefinitionExpression(layer: FeatureLayer, operator: "AND" | "OR", expression: string): void {
  layer.definitionExpression = layer.definitionExpression
    ? `(${layer.definitionExpression}) ${operator} ${expression}`
    : expression;
}
