import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import SceneView from "@arcgis/core/views/SceneView";

import { statisticsScreenStartCamera } from "../cameras";
import {
  findSlopesGroupLayer,
  findSnowHeightLayer,
  findStatisticsDataGroupLayer,
  findWaterPitsLayer,
  findWaterPitsMaxLayer
} from "../data";
import { ScreenType } from "../interfaces";
import { configureSnowHeightLayer, configureWaterMaxLayer } from "../symbols";
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

    const waterMaxLayer = findWaterPitsMaxLayer(map);
    configureWaterMaxLayer(waterMaxLayer, waterLayer);
    const snowHeightLayer = findSnowHeightLayer(map);
    configureSnowHeightLayer(snowHeightLayer);
    const groupLayer = findStatisticsDataGroupLayer(map);
    const slopesLayer = findSlopesGroupLayer(map);

    const previousGroupLayerVisible = groupLayer.visible;
    const previousWaterLayerVisible = waterLayer.visible;
    const previousWaterMaxLayerVisible = waterMaxLayer.visible;
    groupLayer.visible = true;
    waterLayer.visible = true;
    waterMaxLayer.visible = true;
    const previousSlopesLayerVisible = slopesLayer.visible;
    slopesLayer.visible = false;
    const previousSnowHeightLayerVisible = snowHeightLayer.visible;
    snowHeightLayer.visible = true;

    this._loadStatistics(waterLayer);

    const timeExtentHandle = watch(
      () => view.timeExtent,
      (timeExtent) => {
        const date = new Date(timeExtent.end);
        date.setUTCDate(date.getUTCDate() + 45);
        date.setUTCHours(0, 0, 0, 0);
        snowHeightLayer.multidimensionalDefinition = [
          new DimensionalDefinition({
            dimensionName: "StdTime",
            isSlice: false,
            values: [date.getTime()],
            variableName: "snowHeight"
          })
        ];
        snowHeightLayer.useViewTime = false;
      }
    );

    this.addHandles([
      {
        remove: () => {
          slopesLayer.visible = previousSlopesLayerVisible;
          groupLayer.visible = previousGroupLayerVisible;
          waterLayer.visible = previousWaterLayerVisible;
          waterMaxLayer.visible = previousWaterMaxLayerVisible;
          snowHeightLayer.visible = previousSnowHeightLayerVisible;
        }
      },
      {
        remove: () => {
          waterLayer.outFields = previousOutFields;
        }
      },
      timeExtentHandle
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
