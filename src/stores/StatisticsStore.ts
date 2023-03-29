import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import DimensionalDefinition from "@arcgis/core/layers/support/DimensionalDefinition";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import SceneView from "@arcgis/core/views/SceneView";
import Legend from "@arcgis/core/widgets/Legend";
import { statisticsScreenStartCamera } from "../cameras";

import {
  findFiberOpticLayer,
  findRealisticLiftsLayer,
  findSlopesGroupLayer,
  findSnowDepthsLayer,
  findStaffLayer,
  findStatisticsDataGroupLayer,
  findTreeLayer,
  findWaterPipesLayer,
  findWaterPitsLayer,
  findWaterPitsMaxLayer
} from "../data";
import { ScreenType } from "../interfaces";
import { configureSnowDepthsLayer, configureStatisticsTreeLayer, configureWaterMaxLayer } from "../symbols";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.StatisticsStore")
class StatisticsStore extends ScreenStore {
  readonly type = ScreenType.Statistics;

  @property()
  snowCoverVisible = false;

  @property()
  waterUsageVisible = false;

  constructor({ view }: { view: SceneView }) {
    super();
    const { map } = view;

    const treesLayer = findTreeLayer(map);
    const previousTreeRenderer = treesLayer.renderer;
    configureStatisticsTreeLayer(treesLayer);
    treesLayer.opacity = 0.3;
    this.addHandles({
      remove: () => {
        treesLayer.renderer = previousTreeRenderer;
        treesLayer.opacity = 1;
      }
    });

    const waterLayer = findWaterPitsLayer(map);
    waterLayer.outFields = ["Date", "volumen", "volumen_cumulative"];

    const waterMaxLayer = findWaterPitsMaxLayer(map);
    configureWaterMaxLayer(waterMaxLayer, waterLayer);

    const snowDepthsLayer = findSnowDepthsLayer(view.map);
    configureSnowDepthsLayer(snowDepthsLayer);

    this.overrideLayerVisibilities(() => {
      snowDepthsLayer.visible = false;
      findStatisticsDataGroupLayer(map).visible = true;
      findWaterPipesLayer(map).visible = false;
      findFiberOpticLayer(map).visible = false;
      findStaffLayer(map).visible = false;
      findRealisticLiftsLayer(map).visible = false;
    }, view);

    this.goToCamera(statisticsScreenStartCamera, view);

    this._loadStatistics(waterLayer);

    const legend = new Legend({
      view,
      visible: false,
      layerInfos: [{ layer: snowDepthsLayer }]
    });
    view.ui.add(legend, "top-left");
    this.addHandles({ remove: () => view.ui.remove(legend) });

    this.addHandles(
      watch(
        () => this.snowCoverVisible,
        (visible) => {
          snowDepthsLayer.visible = visible;
          legend.visible = visible;
          findSlopesGroupLayer(map).visible = !visible;
        },
        { initial: true }
      )
    );

    this.addHandles(
      watch(
        () => this.waterUsageVisible,
        (visible) => {
          waterLayer.visible = visible;
          waterMaxLayer.visible = visible;
        },
        { initial: true }
      )
    );

    const translateSnowDepthDate = (selectedDate: Date) => {
      const day = selectedDate.getDate();
      switch (day) {
        case 24:
          return new Date(Date.UTC(2021, 11, 29));
        case 25:
          return new Date(Date.UTC(2022, 0, 1));
        case 26:
          return new Date(Date.UTC(2022, 0, 29));
        case 27:
          return new Date(Date.UTC(2022, 0, 28));
        case 28:
          return new Date(Date.UTC(2022, 1, 2));
        case 29:
          return new Date(Date.UTC(2022, 1, 4));
        case 30:
          return new Date(Date.UTC(2022, 1, 9));
        default:
          break;
      }
      const date = new Date(selectedDate);
      date.setUTCDate(date.getUTCDate() + 46);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    };

    this.addHandles(
      watch(
        () => view.timeExtent,
        (timeExtent) => {
          const date = translateSnowDepthDate(timeExtent.end);
          snowDepthsLayer.multidimensionalDefinition = [
            new DimensionalDefinition({
              dimensionName: "StdTime",
              isSlice: false,
              values: [date.getTime()],
              variableName: "snowHeight"
            })
          ];
          snowDepthsLayer.useViewTime = false;
        }
      )
    );
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
