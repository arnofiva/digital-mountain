import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { backgroundAnimationTargetCamera, backgroundCamera } from "../cameras";
import { ScreenType } from "../interfaces";
import { backgroundCameraAnimationSpeedFactor, transitionCameraAnimationSpeedFactor } from "../constants";
import { ignoreAbortErrors } from "../utils";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.TaskSelectionStore")
class TaskSelectionStore extends ScreenStore {
  readonly type = ScreenType.TaskSelection;

  constructor({ animateCameraToStart, view }: { animateCameraToStart: boolean; view: SceneView }) {
    super();
    // hide UI on task selection screen and restore once task is selected
    const uiClass = "task-selection-ui";
    view.ui.container.classList.add(uiClass);
    this.addHandles({ remove: () => view.ui.container.classList.remove(uiClass) });
    // hide layers until task is selected
    view.when(() => {
      if (!this.destroyed) {
        view.map.allLayers.forEach((l) => {
          this._initialLayerVisibilities.push(l.visible);
          if (l.type !== "elevation" && l.type !== "tile") {
            l.visible = false;
          }
        });

        const { signal } = this.createAbortController();
        this._startBackgroundCameraAnimation(view, { animateCameraToStart, signal });
      }
    });
    this.addHandles({
      remove: () => {
        view.map.allLayers.forEach((l, i) => (l.visible = this._initialLayerVisibilities[i]));
      }
    });
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
}

export default TaskSelectionStore;
