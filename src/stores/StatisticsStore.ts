import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import SceneView from "@arcgis/core/views/SceneView";

import { statisticsScreenStartCamera } from "../cameras";
import { findStatisticsDataGroupLayer, findWaterPitsLayer } from "../data";
import { ScreenType } from "../interfaces";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.StatisticsStore")
class StatisticsStore extends ScreenStore {
  readonly type = ScreenType.Statistics;

  constructor({ view }: { view: SceneView }) {
    super();
    this.goToCamera(statisticsScreenStartCamera, view);

    const { map } = view;
    const waterLayer = findWaterPitsLayer(map);
    const previousOutFields = waterLayer.outFields;
    waterLayer.outFields = ["Date", "volumen", "volumen_cumulative"];

    const groupLayer = findStatisticsDataGroupLayer(map);

    const previousGroupLayerVisible = groupLayer.visible;
    const previousWaterLayerVisible = waterLayer.visible;
    groupLayer.visible = true;
    waterLayer.visible = true;

    this._loadStatistics(waterLayer);

    this.addHandles([
      {
        remove: () => {
          groupLayer.visible = previousGroupLayerVisible;
          waterLayer.visible = previousWaterLayerVisible;
        }
      },
      {
        remove: () => {
          waterLayer.outFields = previousOutFields;
        }
      }
    ]);
  }

  @property()
  get records(): Graphic[] | null {
    return this._records;
  }
  @property()
  private _records: Graphic[] | null = null;

  private async _loadStatistics(layer: FeatureLayer) {
    const query = layer.createQuery();
    query.returnGeometry = false;
    query.groupByFieldsForStatistics = ["Date"];
    query.orderByFields = ["Date ASC"];
    query.outStatistics = [
      new StatisticDefinition({
        onStatisticField: "volumen",
        outStatisticFieldName: "volumen_sum",
        statisticType: "sum"
      }),
      new StatisticDefinition({
        onStatisticField: "volumen_cumulative",
        outStatisticFieldName: "volumen_cumulative_sum",
        statisticType: "sum"
      })
    ];

    const { signal } = this.createAbortController();
    const queryResult = await layer.queryFeatures(query);
    if (signal.aborted) {
      return;
    }

    this._records = queryResult.features;
  }
}

export default StatisticsStore;
