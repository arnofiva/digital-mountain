import Camera from "@arcgis/core/Camera";
import Accessor from "@arcgis/core/core/Accessor";
import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { transitionCameraAnimationSpeedFactor } from "../constants";
import { ignoreAbortErrors } from "../utils";

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

  protected goToTaskScreenStart(camera: Camera, view: SceneView): void {
    const { signal } = this.createAbortController();
    ignoreAbortErrors(view.goTo(camera, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal }));
  }

  protected addHomeKey(camera: Camera, view: SceneView) {
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === "h") {
        this.goToTaskScreenStart(camera, view);
      }
    };
    window.addEventListener("keydown", onKeyPress);
    this.addHandles({ remove: () => window.removeEventListener("keydown", onKeyPress) });
  }
}

export default ScreenStore;
