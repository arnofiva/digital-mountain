import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import { Polygon } from "@arcgis/core/geometry";
import { buffer, union } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import Map from "@arcgis/core/Map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

import { backgroundAnimationTargetCamera, backgroundCamera, taskScreenStartCamera } from "./cameras";
import { ScreenType, TaskScreenType, UIActions } from "./components/interfaces";
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
import LiftEditor from "./LiftEditor";
import SlopeEditor from "./SlopeEditor";
import { abortNullable, ignoreAbortErrors } from "./utils";
import SceneFilter from "@arcgis/core/layers/support/SceneFilter";

/**
 * The speed factor used for the animation of the camera in the background of the task selection screen.
 */
const backgroundCameraAnimationSpeedFactor = 0.02;

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
        const result = response.results[0];
        if (result?.type === "graphic") {
          const { graphic } = result;
          if (this._screenStore && "hitTest" in this._screenStore) {
            this._screenStore.hitTest(graphic);
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
    ignoreAbortErrors(this._startBackgroundCameraAnimation(view, { animateCameraToStart, signal }));
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
      await view.goTo(camera1, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal });
    } else {
      view.camera = camera1;
    }
    let targetCamera = camera2;
    while (!signal.aborted) {
      await view.goTo(targetCamera, { animate: true, speedFactor: backgroundCameraAnimationSpeedFactor, signal });
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

  constructor({ view }: { view: SceneView }) {
    super();
    const { signal } = this.createAbortController();
    goToTaskScreenStart(view, { signal });
  }
}

@subclass("digital-mountain.PlanStore")
export class PlanStore extends ScreenStore {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    this._liftEditor = new LiftEditor({ view });
    this._slopeEditor = new SlopeEditor({ view });
    const { signal } = this.createAbortController();
    goToTaskScreenStart(view, { signal });
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
    this._exporting = true;
    this._didExportFail = false;
    try {
      const [{ cableObjectIds, towerObjectIds }, slopeObjectIds] = await Promise.all([
        this._exportLifts(),
        this._exportSlopes()
      ]);
      const scene = this._view.map as WebScene;
      await scene.updateFrom(this._view);
      scene.presentation.slides.removeAll();
      const cablesLayer = findCablesLayer(scene);
      const towersLayer = findTowersLayer(scene);
      const slopesLayer = findSlopesLayer(scene);
      const definitionExpression = (
        filterField: string,
        filterValue: number | string,
        objectIdField: string,
        objectIds: number[]
      ) => {
        filterValue = typeof filterValue === "number" ? filterValue : `'${filterValue}'`;
        // only show existing features or features planned in this editing session
        return `${filterField} <> ${filterValue} OR ${objectIdField} IN (${objectIds.join(",")})`;
      };
      cablesLayer.definitionExpression = definitionExpression(
        liftIdFilterField,
        liftIdFilterValue,
        cablesLayer.objectIdField,
        cableObjectIds
      );
      towersLayer.definitionExpression = definitionExpression(
        liftIdFilterField,
        liftIdFilterValue,
        towersLayer.objectIdField,
        towerObjectIds
      );
      slopesLayer.definitionExpression = definitionExpression(
        slopeIdFilterField,
        slopeIdFilterValue,
        slopesLayer.objectIdField,
        slopeObjectIds
      );
      const item = await scene.saveAs(
        { title: sceneExportTitle, portal: { url: portalUrl } },
        // ignore errors triggered by attempting to save graphics layers
        { ignoreUnsupported: true }
      );
      hidePlannedFeatures(scene);
      const viewerUrl = item.portal.url + "/home/webscene/viewer.html?webscene=" + item.id;
      window.open(viewerUrl, "_blank");
    } catch (e) {
      this._didExportFail = true;
      console.error("Export failed", e);
    }
    this._exporting = false;
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

  hitTest(graphic: Graphic): void {
    if (this._slopeEditor.canUpdateGraphic(graphic)) {
      this.startSlopeEditor({ updateGraphic: graphic });
    } else if (this._liftEditor.canUpdateGraphic(graphic)) {
      this.startLiftEditor({ updateGraphic: graphic });
    }
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
    // update the layer view filter once the layer view has been found, and whenever lift or slope geometries changes
    const filterWatchHandle = watch(
      () => [this._liftEditor.treeFilterGeometry, this._slopeEditor.treeFilterGeometry].filter((g) => g != null),
      (geometries) => {
        if (geometries.length === 0) {
          treeLayer.filter = null;
          return;
        }
        const bufferGeometries = (buffer(geometries, treeFilterDistance, "meters") as Polygon[]).filter(
          (g) => g != null
        );
        treeLayer.filter = new SceneFilter({
          geometries: bufferGeometries,
          spatialRelationship: "disjoint"
        });
      }
    );
    this.addHandles({
      remove: () => {
        filterWatchHandle.remove();
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
    goToTaskScreenStart(view, { signal });
  }
}

function goToTaskScreenStart(view: SceneView, { signal }: { signal: AbortSignal }): void {
  ignoreAbortErrors(
    view.goTo(taskScreenStartCamera, {
      animate: true,
      speedFactor: transitionCameraAnimationSpeedFactor,
      signal
    })
  );
}

/**
 * Hide previously exported copies of planned features in feature layers and show them only in graphics layers.
 */
function hidePlannedFeatures(map: Map): void {
  findCablesLayer(map).definitionExpression = `${liftIdFilterField} <> ${liftIdFilterValue}`;
  findTowersLayer(map).definitionExpression = `${liftIdFilterField} <> ${liftIdFilterValue}`;
  findSlopesLayer(map).definitionExpression = `${slopeIdFilterField} <> '${slopeIdFilterValue}'`;
}
