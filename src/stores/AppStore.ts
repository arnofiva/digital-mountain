import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import { SimpleRenderer } from "@arcgis/core/renderers";

import { AlertData, ScreenType, TaskScreenType, UIActions } from "../interfaces";
import {
  findCablesLayer,
  findSlopesLayer,
  findTowersLayer,
  liftIdFilterField,
  liftIdFilterValue,
  slopeIdFilterField,
  slopeIdFilterValue
} from "../data";
import { appendDefinitionExpression } from "../utils";
import TaskSelectionStore from "./TaskSelectionStore";
import LiveStore from "./LiveStore";
import PlanningStore from "./PlanningStore";
import StatisticsStore from "./StatisticsStore";
import { openSlopeSymbol } from "../symbols";

/**
 * Class name set on the body element while on a task screen, used to adjust the layout of the view.
 */
const taskScreenClass = "task-screen";

type ScreenStoreUnion = TaskSelectionStore | LiveStore | PlanningStore | StatisticsStore;

@subclass("digital-mountain.AppStore")
class AppStore extends Accessor implements UIActions {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    view.when(() => {
      hidePlannedFeatures(view.map);
      const { renderer: slopesRenderer } = findSlopesLayer(view.map);
      if (slopesRenderer.type === "simple") {
        (slopesRenderer as SimpleRenderer).symbol = openSlopeSymbol;
      }
    });
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
    if (this._screenStore?.type === ScreenType.Planning) {
      this._screenStore.exportPlan();
    }
  }

  goToAlert(data: AlertData): void {
    if (this._screenStore?.type === ScreenType.Live) {
      this._screenStore.goToAlert(data);
    }
  }

  openTaskScreen(taskScreenType: TaskScreenType): void {
    this._screenStore?.destroy();
    document.body.classList.add(taskScreenClass);
    const view = this._view;
    switch (taskScreenType) {
      case ScreenType.Live:
        this._screenStore = new LiveStore({ view });
        break;
      case ScreenType.Planning:
        this._screenStore = new PlanningStore({ view });
        break;
      case ScreenType.Statistics:
        this._screenStore = new StatisticsStore({ view });
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
    if (this._screenStore?.type === ScreenType.Planning) {
      this._screenStore.startSlopeEditor(options);
    }
  }

  startLiftEditor(options?: { updateGraphic?: Graphic }): void {
    if (this._screenStore?.type === ScreenType.Planning) {
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

/**
 * Hide previously exported copies of planned features in feature layers and show them only in graphics layers.
 */
function hidePlannedFeatures(map: Map): void {
  appendDefinitionExpression(findCablesLayer(map), "AND", `${liftIdFilterField} <> ${liftIdFilterValue}`);
  appendDefinitionExpression(findTowersLayer(map), "AND", `${liftIdFilterField} <> ${liftIdFilterValue}`);
  appendDefinitionExpression(findSlopesLayer(map), "AND", `${slopeIdFilterField} <> '${slopeIdFilterValue}'`);
}

export default AppStore;
