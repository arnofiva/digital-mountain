import Camera from "@arcgis/core/Camera";
import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { MeasurementSystem } from "@arcgis/core/core/units";
import { Polygon } from "@arcgis/core/geometry";
import Geometry from "@arcgis/core/geometry/Geometry";
import { buffer } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import SceneFilter from "@arcgis/core/layers/support/SceneFilter";
import Map from "@arcgis/core/Map";
import { SimpleRenderer } from "@arcgis/core/renderers";
import { LabelSymbol3D, ObjectSymbol3DLayer, PointSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";
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
import { AlertData, ScreenType, TaskScreenType, UIActions } from "./components/interfaces";

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
import StreamLayerMock from "./live/streamLayerMock";
import SlopeEditor from "./SlopeEditor";
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


  private readonly _stream: StreamLayer;
  private readonly _streamMock: StreamLayerMock;

  constructor({ view }: { view: SceneView }) {
    super();
    const { signal } = this.createAbortController();

    goToTaskScreenStart(monitorScreenStartCamera, { signal, view });


    const streamLayerUrl = "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer";

    this._streamMock = new StreamLayerMock(
      streamLayerUrl,
      "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowCat_StreamLayer4/FeatureServer/0"
    );

    this._streamMock.setEvents(messages.map((message, idx) => ({
      message,
      msAfterStart: idx * 1000
    })));

    this._streamMock.start();

    this._stream = new StreamLayer({
      url: streamLayerUrl,
      title: "Stream Layer",
      elevationInfo: {
        mode: "on-the-ground"
      },
      purgeOptions: {
        displayCount: 10000
      },
      labelingInfo: [
        new LabelClass({
          labelExpressionInfo: { expression: "return 'SnowCat'" },
          symbol: new LabelSymbol3D({
            verticalOffset: {
              screenLength: 20,
              maxWorldLength: 20,
              minWorldLength: 5
            },
            callout: new LineCallout3D({
              size: 0.5,
              color: [0, 0, 0]
            }),
            symbolLayers: [
              new TextSymbol3DLayer({
                material: { color: "white" },
                size: 16, // Defined in points
                background: {
                  color: [0, 0, 0, 0.4]
                }
              })
            ]
          })
        })
      ],
      renderer: new SimpleRenderer({
        symbol: new PointSymbol3D({
          symbolLayers: [
            new ObjectSymbol3DLayer({
              resource: {
                href: "https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/gltf/resource/Backhoe.glb"
              },
              // width: 3.046784222126007,
              height: 50,
              heading: 220,
              tilt: -10
              // depth: 4.3906859159469604
            })
          ]
        })
      })
    });

    view.map.add(this._stream);

    const expand = new Expand({
      view,
      content: new LayerList({view})
    });
    view.ui.add(expand, "top-right");

    this.addHandles({
      remove: () => {
        view.ui.remove(expand);
      }
    })
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




const messages = [
  {
    attributes: {
      track_id: 0,
      y: 46.75244804,
      x: 1675183865170,
      globalid: "{33C55882-4997-990C-1E3E-451C5230C021}"
    },
    geometry: {
      x: 1067768.8403578121,
      y: 5901760.486477842,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75229491,
      x: 1675183866170,
      globalid: "{5E3D5361-25BD-4BD3-EFA4-A3FA0D5B8ABA}"
    },
    geometry: {
      x: 1067762.271060702,
      y: 5901735.606841403,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75212881,
      x: 1675183867170,
      globalid: "{2478E389-4BBB-C298-287B-E036D1B6473F}"
    },
    geometry: {
      x: 1067764.3978195738,
      y: 5901708.619997716,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75196319,
      x: 1675183868170,
      globalid: "{3347A5ED-67BF-6393-95AB-A8E604668DF4}"
    },
    geometry: {
      x: 1067766.8052148817,
      y: 5901681.711224108,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7518017,
      x: 1675183869170,
      globalid: "{2941D384-A86A-3F2F-16B0-B4947A3E3A82}"
    },
    geometry: {
      x: 1067771.6266846668,
      y: 5901655.473543498,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75164021,
      x: 1675183870170,
      globalid: "{B88DD6F2-8DBC-01E8-5182-1F20317A3074}"
    },
    geometry: {
      x: 1067776.4482657716,
      y: 5901629.235941505,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75147457,
      x: 1675183871171,
      globalid: "{D8AED2DC-3A36-4903-F79F-1FC783ABEC7D}"
    },
    geometry: {
      x: 1067778.5888282598,
      y: 5901602.32416242,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7513079,
      x: 1675183872171,
      globalid: "{6EA66FCB-5170-E3BF-384C-28CCAA354CB4}"
    },
    geometry: {
      x: 1067780.0590247747,
      y: 5901575.245121174,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75114528,
      x: 1675183873171,
      globalid: "{945D107E-5013-C86D-76A6-34FCCAF72D58}"
    },
    geometry: {
      x: 1067776.4363545862,
      y: 5901548.824168181,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75098371,
      x: 1675183874171,
      globalid: "{AC3EAD99-DDEF-7FC5-1B19-E334B6A13411}"
    },
    geometry: {
      x: 1067771.661416348,
      y: 5901522.573888163,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75082648,
      x: 1675183875171,
      globalid: "{FEED8580-99D9-4334-27C0-1B6E7AC2686C}"
    },
    geometry: {
      x: 1067765.3331259352,
      y: 5901497.028803554,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75066997,
      x: 1675183876171,
      globalid: "{29F6402C-0BBE-14EE-874B-65F19423861C}"
    },
    geometry: {
      x: 1067758.8446467754,
      y: 5901471.600771018,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75053102,
      x: 1675183877171,
      globalid: "{23CC5907-B57A-1EDE-AE1B-70D3680A12EF}"
    },
    geometry: {
      x: 1067748.4923794095,
      y: 5901449.0257570455,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75040896,
      x: 1675183878171,
      globalid: "{06A8D635-FDFE-DF50-8BCA-80F52A869989}"
    },
    geometry: {
      x: 1067736.654553439,
      y: 5901429.1948859915,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75035055,
      x: 1675183879171,
      globalid: "{86AF2005-AC26-F5A6-F868-375A95C129F6}"
    },
    geometry: {
      x: 1067719.214908053,
      y: 5901419.705133091,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75029215,
      x: 1675183880171,
      globalid: "{3CF79297-F971-766D-0A69-3DB694902DF9}"
    },
    geometry: {
      x: 1067701.7752626669,
      y: 5901410.21701515,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75028764,
      x: 1675183881172,
      globalid: "{03C394F9-CADC-FFC4-BBA5-1E10024E194F}"
    },
    geometry: {
      x: 1067683.176002145,
      y: 5901409.484285923,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75028345,
      x: 1675183882172,
      globalid: "{61580678-9A77-1CE3-81FC-77756A8DA1F4}"
    },
    geometry: {
      x: 1067664.569617176,
      y: 5901408.803546405,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75027926,
      x: 1675183883172,
      globalid: "{57112236-2C29-4439-D0C5-890041596763}"
    },
    geometry: {
      x: 1067645.9633435265,
      y: 5901408.12280694,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75029177,
      x: 1675183884172,
      globalid: "{353A146A-C751-74D1-F029-11633C9C9179}"
    },
    geometry: {
      x: 1067627.4177389992,
      y: 5901410.155277427,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75030685,
      x: 1675183885172,
      globalid: "{66F9D9BF-5E3D-404D-1768-6210A4405806}"
    },
    geometry: {
      x: 1067608.8813739899,
      y: 5901412.605290444,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75032192,
      x: 1675183886172,
      globalid: "{8C237111-C493-9256-1CCA-D3162B32884F}"
    },
    geometry: {
      x: 1067590.3451202998,
      y: 5901415.053679464,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.750337,
      x: 1675183887172,
      globalid: "{92758789-C500-00E2-445E-94BE32243A56}"
    },
    geometry: {
      x: 1067571.8087552905,
      y: 5901417.503693851,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75035208,
      x: 1675183888172,
      globalid: "{EB9F44D9-7F68-77F4-9BCC-118FF590F693}"
    },
    geometry: {
      x: 1067553.2725016004,
      y: 5901419.953708921,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75040103,
      x: 1675183889172,
      globalid: "{CAD98051-6CDC-0AFB-F4E4-35F0160461B9}"
    },
    geometry: {
      x: 1067535.604873897,
      y: 5901427.9065145515,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75046032,
      x: 1675183890172,
      globalid: "{C0DE20F4-D513-F0D8-85BD-BAB883D6EA61}"
    },
    geometry: {
      x: 1067518.2022979013,
      y: 5901437.53924835,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75051961,
      x: 1675183891172,
      globalid: "{B64C9C00-394D-8BF4-2B1A-E9231414EA7E}"
    },
    geometry: {
      x: 1067500.7996105864,
      y: 5901447.1719927415,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7505789,
      x: 1675183892172,
      globalid: "{C1E92904-4C16-BE43-A10C-D462C4695D9C}"
    },
    geometry: {
      x: 1067483.3969232708,
      y: 5901456.804747732,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75063819,
      x: 1675183893172,
      globalid: "{FF22E407-63F8-A04A-B9C7-F186C55EE368}"
    },
    geometry: {
      x: 1067465.9943472752,
      y: 5901466.437513318,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75069748,
      x: 1675183894172,
      globalid: "{1843F83B-AEA0-215A-1F9D-FFDBD8FA4436}"
    },
    geometry: {
      x: 1067448.59165996,
      y: 5901476.070289501,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75075676,
      x: 1675183895172,
      globalid: "{521B55C2-F482-D7CB-16B7-9CC242238D7C}"
    },
    geometry: {
      x: 1067431.1889726447,
      y: 5901485.701451592,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.7508374,
      x: 1675183896172,
      globalid: "{6D7DC26C-0DA6-F9BA-C538-834F4F9B10F7}"
    },
    geometry: {
      x: 1067415.1094287972,
      y: 5901498.802968443,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75093907,
      x: 1675183897172,
      globalid: "{07FC0C27-70AC-1D90-F263-B1FA173403DA}"
    },
    geometry: {
      x: 1067400.3344380623,
      y: 5901515.321240655,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75104075,
      x: 1675183898172,
      globalid: "{8B6DF2EA-FE77-DD37-9BC8-F384B7FD810E}"
    },
    geometry: {
      x: 1067385.5594473272,
      y: 5901531.841168725,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75114243,
      x: 1675183899172,
      globalid: "{FC4E31B0-AFA2-AB52-6481-18D203128EB3}"
    },
    geometry: {
      x: 1067370.7845679116,
      y: 5901548.361127964,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75124255,
      x: 1675183900172,
      globalid: "{4E287FAF-FD46-8FC4-4BB2-5323B0055F7A}"
    },
    geometry: {
      x: 1067355.899704839,
      y: 5901564.627664303,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75131909,
      x: 1675183901172,
      globalid: "{2DE6368E-9D3D-241E-AAE9-0EBCC0744879}"
    },
    geometry: {
      x: 1067339.3526191302,
      y: 5901577.06316902,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75139564,
      x: 1675183902172,
      globalid: "{F7A4F2E4-72B3-AFE4-2539-A893363B78D8}"
    },
    geometry: {
      x: 1067322.805533421,
      y: 5901589.500316106,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75147218,
      x: 1675183903172,
      globalid: "{7479ABA7-8DB2-F4F6-5C46-2E5F38ACBCF0}"
    },
    geometry: {
      x: 1067306.258447712,
      y: 5901601.935856144,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  },
  {
    attributes: {
      track_id: 0,
      y: 46.75154873,
      x: 1675183904173,
      globalid: "{173A15CA-2C9B-D8F3-B65C-7A21A44A9C72}"
    },
    geometry: {
      x: 1067289.7113620033,
      y: 5901614.373038557,
      spatialReference: { wkid: 102100, latestWkid: 3857 }
    }
  }
];
