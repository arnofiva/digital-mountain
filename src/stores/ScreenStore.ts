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

  protected goToCamera(camera: Camera, view: SceneView): void {
    this._cameraAnimationAbortController?.abort();
    const { signal } = (this._cameraAnimationAbortController = this.createAbortController());
    ignoreAbortErrors(view.goTo(camera, { animate: true, speedFactor: transitionCameraAnimationSpeedFactor, signal }));
  }

  protected addGoToCameraKey(camera: Camera, key: string, view: SceneView) {
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        this.goToCamera(camera, view);
      }
    };
    window.addEventListener("keydown", onKeyPress);
    this.addHandles({ remove: () => window.removeEventListener("keydown", onKeyPress) });
  }
}

export default ScreenStore;
