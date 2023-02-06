import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";
import SceneView from "@arcgis/core/views/SceneView";

import { backgroundAnimationTargetCamera, backgroundCamera, taskScreenStartCamera } from "./cameras";
import { TaskScreen, TaskScreenType, UIActions } from "./components/interfaces";
import { skiResortArea } from "./data";
import LiftEditor from "./LiftEditor";
import { parcelSymbol } from "./symbols";
import { abortNullable, ignoreAbortErrors } from "./utils";

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
class Store extends Accessor implements UIActions {
  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    this._liftEditor = new LiftEditor({ view });
  }

  @property()
  get taskScreen(): TaskScreen | null {
    return this._taskScreen;
  }

  @property()
  private _taskScreen: TaskScreen | null = null;

  private readonly _view: SceneView;
  private readonly _liftEditor: LiftEditor;
  private _animationAbortController: AbortController | null = null;
  private _planningAbortController: AbortController | null = null;

  /*************
   * UI actions
   *************/

  openTaskScreen(taskScreenType: TaskScreenType): void {
    this._removeScreenHandles();
    const abortController = new AbortController();
    this._addScreenHandle(() => abortController.abort());
    this._screenHandles.push(this._setupHitTest());
    ignoreAbortErrors(
      this._view.goTo(taskScreenStartCamera, {
        animate: true,
        speedFactor: transitionCameraAnimationSpeedFactor,
        signal: abortController.signal
      })
    );
    document.body.classList.add(taskScreenClass);
    this._taskScreen = { type: taskScreenType };
  }

  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void {
    this._removeScreenHandles();
    ignoreAbortErrors(this._startBackgroundCameraAnimation(options));
    this._addScreenHandle(() => this._stopBackgroundCameraAnimation());
    document.body.classList.remove(taskScreenClass);
    this._taskScreen = null;
  }

  startSlopeEditor(): void {
    this._planningAbortController = abortNullable(this._planningAbortController);
  }

  startLiftEditor(options?: { updateGraphic?: Graphic }): void {
    this._planningAbortController?.abort();
    this._planningAbortController = new AbortController();
    this._addScreenHandle(() => {
      this._planningAbortController = abortNullable(this._planningAbortController);
    });
    const { signal } = this._planningAbortController;
    if (options?.updateGraphic) {
      this._liftEditor.update(options.updateGraphic, { signal });
    } else {
      this._liftEditor.create({ signal });
    }
  }

  /***************
   * View actions
   ***************/

  private async _startBackgroundCameraAnimation(options: { animateCameraToStart: boolean }): Promise<void> {
    this._stopBackgroundCameraAnimation();
    this._animationAbortController = new AbortController();
    const { signal } = this._animationAbortController;
    const camera1 = backgroundCamera;
    const camera2 = backgroundAnimationTargetCamera;
    // hide UI while animating and restore once animation is stopped
    this._view.ui.components.length = 0;
    await this._view.when();
    if (options.animateCameraToStart) {
      await this._view.goTo(camera1, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal });
    } else {
      this._view.camera = camera1;
    }
    let targetCamera = camera2;
    while (!signal.aborted) {
      await this._view.goTo(targetCamera, { animate: true, speedFactor: backgroundCameraAnimationSpeedFactor, signal });
      // loop between the camera positions
      targetCamera = targetCamera === camera2 ? camera1 : camera2;
    }
  }

  private _stopBackgroundCameraAnimation(): void {
    this._view.ui.components = this._defaultUIComponents;
    this._animationAbortController = abortNullable(this._animationAbortController);
  }

  private _setupHitTest(): IHandle {
    return this._view.on("click", (event) => {
      this._view.hitTest(event).then((response) => {
        const result = response.results[0];
        if (result?.type === "graphic") {
          const { graphic } = result;
          this.startLiftEditor({ updateGraphic: graphic });
        }
      });
    });
  }

  private get _defaultUIComponents(): string[] {
    return ["attribution", "zoom", "navigation-toggle", "compass"];
  }

  /**
   * Handles for resources that should be removed when leaving the current screen.
   */
  private _screenHandles: IHandle[] = [];
  private _addScreenHandle(remove: () => void): void {
    this._screenHandles.push({ remove });
  }
  private _removeScreenHandles(): void {
    this._screenHandles.forEach((h) => h.remove());
    this._screenHandles.length = 0;
  }
}

export default Store;
