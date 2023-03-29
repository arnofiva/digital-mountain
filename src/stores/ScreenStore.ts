import Camera from "@arcgis/core/Camera";
import Accessor from "@arcgis/core/core/Accessor";
import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { transitionCameraAnimationSpeedFactor } from "../constants";
import { ignoreAbortErrors } from "../utils";

@subclass("digital-mountain.ScreenStore")
class ScreenStore extends Accessor {
  private readonly _initialLayerVisibilities: boolean[] = [];

  protected overrideLayerVisibilities(callback: () => void, view: SceneView) {
    // hide layers until task is selected
    view.when(() => {
      if (!this.destroyed) {
        this._initialLayerVisibilities.length = 0;
        view.map.allLayers.forEach((l) => {
          this._initialLayerVisibilities.push(l.visible);
        });
        callback();
      }
    });
    this.addHandles({
      remove: () => {
        view.map.allLayers.forEach((l, i) => (l.visible = this._initialLayerVisibilities[i]));
      }
    });
  }

  /**
   * Creates an abort controller that will be automatically removed when the object is destroyed.
   */
  protected createAbortController(): AbortController {
    const abortController = new AbortController();
    this.addHandles({ remove: () => abortController.abort() });
    return abortController;
  }

  private _cameraAnimationAbortController: AbortController | null = null;

  protected async goToCamera(camera: Camera, view: SceneView, animate = true) {
    this._cameraAnimationAbortController?.abort();
    const { signal } = (this._cameraAnimationAbortController = this.createAbortController());
    return ignoreAbortErrors(view.goTo(camera, { animate, speedFactor: transitionCameraAnimationSpeedFactor, signal }));
  }
}

export default ScreenStore;
