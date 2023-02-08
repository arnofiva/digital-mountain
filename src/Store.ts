import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";
import SceneView from "@arcgis/core/views/SceneView";

import { backgroundAnimationTargetCamera, backgroundCamera, taskScreenStartCamera } from "./cameras";
import { TaskScreenType, UIActions } from "./components/interfaces";
import { skiResortArea } from "./data";
import LiftEditor from "./LiftEditor";
import SlopeEditor from "./SlopeEditor";
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
    this._slopeEditor = new SlopeEditor({ view });
  }

  @property()
  get taskScreenType(): TaskScreenType | null {
    return this._taskScreenType;
  }

  @property()
  private _taskScreenType: TaskScreenType | null = null;

  @property()
  get planningHint(): string | null {
    if (this._liftEditor.isCreating) {
      return "Click in the view to place start and end points for the new lift";
    }
    if (this._slopeEditor.isCreating) {
      return "Click in the view to draw the new slope";
    }
    return null;
  }

  private readonly _view: SceneView;
  private readonly _liftEditor: LiftEditor;
  private readonly _slopeEditor: SlopeEditor;

  private _animationAbortController: AbortController | null = null;
  private _planningAbortController: AbortController | null = null;

  /*************
   * UI actions
   *************/

  openTaskScreen(taskScreenType: TaskScreenType): void {
    this._onScreenChange();
    this._screenHandles.push(this._setupHitTest());
    const { signal } = (this._animationAbortController = new AbortController());
    ignoreAbortErrors(
      this._view.goTo(taskScreenStartCamera, {
        animate: true,
        speedFactor: transitionCameraAnimationSpeedFactor,
        signal
      })
    );
    document.body.classList.add(taskScreenClass);
    this._taskScreenType = taskScreenType;
  }

  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void {
    this._onScreenChange();
    // hide UI on task selection screen and restore once task is selected
    this._view.ui.components.length = 0;
    this._addScreenHandle(() => (this._view.ui.components = this._defaultUIComponents));
    // start animating camera in background view
    ignoreAbortErrors(this._startBackgroundCameraAnimation(options));
    document.body.classList.remove(taskScreenClass);
    this._taskScreenType = null;
  }

  startSlopeEditor(options?: { updateGraphic?: Graphic }): void {
    this._planningAbortController?.abort();
    const { signal } = (this._planningAbortController = new AbortController());
    if (options?.updateGraphic) {
      this._slopeEditor.update(options.updateGraphic, { signal });
    } else {
      this._slopeEditor.create({ signal });
    }
  }

  startLiftEditor(options?: { updateGraphic?: Graphic }): void {
    this._planningAbortController?.abort();
    const { signal } = (this._planningAbortController = new AbortController());
    if (options?.updateGraphic) {
      this._liftEditor.update(options.updateGraphic, { signal });
    } else {
      this._liftEditor.create({ signal });
    }
  }

  private _onScreenChange(): void {
    this._removeScreenHandles();
    this._animationAbortController = abortNullable(this._animationAbortController);
    this._planningAbortController = abortNullable(this._planningAbortController);
  }

  /***************
   * View actions
   ***************/

  private async _startBackgroundCameraAnimation(options: { animateCameraToStart: boolean }): Promise<void> {
    this._animationAbortController?.abort();
    this._animationAbortController = new AbortController();
    const { signal } = this._animationAbortController;
    const camera1 = backgroundCamera;
    const camera2 = backgroundAnimationTargetCamera;
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

  private _setupHitTest(): IHandle {
    return this._view.on("click", (event) => {
      this._view.hitTest(event).then((response) => {
        const result = response.results[0];
        if (result?.type === "graphic") {
          const { graphic } = result;
          if (this._slopeEditor.canUpdateGraphic(graphic)) {
            this.startSlopeEditor({ updateGraphic: graphic });
          } else if (this._liftEditor.canUpdateGraphic(graphic)) {
            this.startLiftEditor({ updateGraphic: graphic });
          }
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
