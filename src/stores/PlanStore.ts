import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { MeasurementSystem } from "@arcgis/core/core/units";
import { Polygon } from "@arcgis/core/geometry";
import Geometry from "@arcgis/core/geometry/Geometry";
import { buffer } from "@arcgis/core/geometry/geometryEngine";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneFilter from "@arcgis/core/layers/support/SceneFilter";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";

import { planScreenStartCamera } from "../cameras";
import { ScreenType } from "../interfaces";
import { sceneExportTitle, treeFilterDistance } from "../constants";
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
} from "../data";
import LiftEditor from "../LiftEditor";
import SlopeEditor from "../SlopeEditor";
import { abortNullable, appendDefinitionExpression, getDefaultMeasurementSystem } from "../utils";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.PlanStore")
export class PlanStore extends ScreenStore {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    this._liftEditor = new LiftEditor({ view });
    this._slopeEditor = new SlopeEditor({ view });
    this.goToTaskScreenStart(planScreenStartCamera, view);
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
      bufferGeometries.forEach((g) => (g.hasZ = false));
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

/**
 * Isolate newly planned features in the exported scene.
 */
function setExportDefinitionExpression(layer: FeatureLayer, objectIds: number[]): void {
  appendDefinitionExpression(layer, "OR", `${layer.objectIdField} IN (${objectIds.join(",")})`);
}

export default PlanStore;
