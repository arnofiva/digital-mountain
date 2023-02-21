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
}

export default ScreenStore;
