import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { visitScreenStartCamera } from "../cameras";
import { ScreenType } from "../interfaces";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.VisitStore")
class VisitStore extends ScreenStore {
  readonly type = ScreenType.Visit;

  constructor({ view }: { view: SceneView }) {
    super();
    this.goToTaskScreenStart(visitScreenStartCamera, view);
  }
}

export default VisitStore;
