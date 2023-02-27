import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";

import { statisticsScreenStartCamera } from "../cameras";
import { ScreenType } from "../interfaces";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.StatisticsStore")
class StatisticsStore extends ScreenStore {
  readonly type = ScreenType.Statistics;

  constructor({ view }: { view: SceneView }) {
    super();
    this.goToTaskScreenStart(statisticsScreenStartCamera, view);
  }
}

export default StatisticsStore;
