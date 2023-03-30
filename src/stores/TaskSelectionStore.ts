import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { backgroundAnimationEndCamera, backgroundAnimationStartCamera } from "../cameras";
import { ScreenType } from "../interfaces";
import {
  backgroundCameraAnimationSpeedFactor,
  taskSelectionViewDate,
  transitionCameraAnimationSpeedFactor
} from "../constants";
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

    view.when(() => {
      const { signal } = this.createAbortController();
      this._startBackgroundCameraAnimation(view, { animateCameraToStart, signal });
    });

    this.overrideLayerVisibilities(() => {
      view.map.allLayers.forEach((l) => {
        if (l.type !== "elevation" && l.type !== "tile") {
          l.visible = false;
        }
      });
    }, view);

    const { lighting } = view.environment;
    if (lighting.type === "sun") {
      lighting.date = taskSelectionViewDate;
    }
  }

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
    const camera1 = backgroundAnimationStartCamera;
    const camera2 = backgroundAnimationEndCamera;
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
