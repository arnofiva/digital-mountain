import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { backgroundAnimationTargetCamera, backgroundCamera, taskScreenStartCamera } from "./cameras";
import { TaskScreen, TaskScreenType, UIActions } from "./components/interfaces";
import LiftEditor from "./LiftEditor";
import { ignoreAbortErrors } from "./utils";

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
  constructor(properties: { view: SceneView }) {
    super();
    this._view = properties.view;
  }

  @property()
  get taskScreen(): TaskScreen | null {
    return this._taskScreen;
  }

  @property()
  private _taskScreen: TaskScreen | null = null;

  /*************
   * UI actions
   *************/

  openTaskScreen(taskScreenType: TaskScreenType): void {
    this._stopBackgroundCameraAnimation();
    this._view.goTo(taskScreenStartCamera, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor });
    document.body.classList.add(taskScreenClass);
    this._taskScreen = { type: taskScreenType };
  }

  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void {
    ignoreAbortErrors(this._startBackgroundCameraAnimation(options));
    document.body.classList.remove(taskScreenClass);
    this._taskScreen = null;
  }

  /***************
   * View actions
   ***************/

  private readonly _view: SceneView;

  private _animationAbortController: AbortController | null = null;

  private async _startBackgroundCameraAnimation(options: { animateCameraToStart: boolean }): Promise<void> {
    this._stopBackgroundCameraAnimation();
    this._animationAbortController = new AbortController();
    const { signal } = this._animationAbortController;
    const camera1 = backgroundCamera;
    const camera2 = backgroundAnimationTargetCamera;
    // hide UI while animating and restore once animation is complete
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
    this._animationAbortController?.abort();
  }

  private get _defaultUIComponents(): string[] {
    return ["attribution", "zoom", "navigation-toggle", "compass"];
  }
}

export default Store;
