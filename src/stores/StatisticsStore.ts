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
  findSnowHeightLayer,
  findStaffLayer,
  findStatisticsDataGroupLayer,
  findTreeLayer,
  findWaterPipesLayer,
  findWaterPitsLayer,
  findWaterPitsMaxLayer
} from "../data";
import { ScreenType } from "../interfaces";
import { configureSnowHeightLayer, configureStatisticsTreeLayer, configureWaterMaxLayer } from "../symbols";
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

    const snowDepthsLayer = findSnowHeightLayer(view.map);

    const treesLayer = findTreeLayer(view.map);
    const previousTreeRenderer = treesLayer.renderer;
    configureStatisticsTreeLayer(treesLayer);
    treesLayer.opacity = 0.3;


    const { map } = view;
    const waterLayer = findWaterPitsLayer(map);
    const previousOutFields = waterLayer.outFields;
    waterLayer.outFields = ["Date", "volumen", "volumen_cumulative"];

    const waterMaxLayer = findWaterPitsMaxLayer(map);
    configureWaterMaxLayer(waterMaxLayer, waterLayer);
    configureSnowHeightLayer(snowDepthsLayer);
    const groupLayer = findStatisticsDataGroupLayer(map);
    const slopesLayer = findSlopesGroupLayer(map);

    const waterPipesLayer = findWaterPipesLayer(map);
    const fiberOpticLayer = findFiberOpticLayer(map);
    const staffLayer = findStaffLayer(map);
    const realisticLiftsLayer = findRealisticLiftsLayer(map);
    
    const previousSnowDepthsLayerVisible = snowDepthsLayer.visible;
    const previousGroupLayerVisible = groupLayer.visible;
    const previousWaterLayerVisible = waterLayer.visible;
    const previousWaterMaxLayerVisible = waterMaxLayer.visible;
    const previousSlopesLayerVisible = slopesLayer.visible;
    const previousWaterPipesLayerVisible = waterPipesLayer.visible;
    const previousFiberOpticLayerVisible = fiberOpticLayer.visible;
    const previousStaffLayerVisible = staffLayer.visible;
    const previousRealisticLiftsLayerVisible = realisticLiftsLayer.visible;

    snowDepthsLayer.visible = false;
    groupLayer.visible = true;
    // slopesLayer.visible = false;
    waterPipesLayer.visible = false;
    fiberOpticLayer.visible = false;
    staffLayer.visible = false;
    realisticLiftsLayer.visible = false;

    this.goToCamera(statisticsScreenStartCamera, view);

    this._loadStatistics(waterLayer);

    const legend = new Legend({
      view,
      visible: false,
      layerInfos: [
        {layer: snowDepthsLayer}
      ]
    });
    view.ui.add(legend, "top-left");

    const snowDepthHandle = watch(
      () => this.snowCoverVisible,
      (visible) => {
        snowDepthsLayer.visible = visible;
        legend.visible = visible;
        slopesLayer.visible = !visible;
      }
    );

    const waterUsageHandle = watch(
      () => this.waterUsageVisible,
      (visible) => {
        waterLayer.visible = visible;
        waterMaxLayer.visible = visible;
      }
    )

    const timeExtentHandle = watch(
      () => view.timeExtent,
      (timeExtent) => {
        const date = new Date(timeExtent.end);
        date.setUTCDate(date.getUTCDate() + 46);
        date.setUTCHours(0, 0, 0, 0);
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
    );

    this.addHandles([
      {
        remove: () => {
          treesLayer.renderer = previousTreeRenderer;
          treesLayer.opacity = 1;
          snowDepthsLayer.visible = previousSnowDepthsLayerVisible;
          slopesLayer.visible = previousSlopesLayerVisible;
          groupLayer.visible = previousGroupLayerVisible;
          waterLayer.visible = previousWaterLayerVisible;
          waterMaxLayer.visible = previousWaterMaxLayerVisible;
          waterLayer.outFields = previousOutFields;
          waterPipesLayer.visible = previousWaterPipesLayerVisible;
          fiberOpticLayer.visible = previousFiberOpticLayerVisible;
          staffLayer.visible = previousStaffLayerVisible;
          realisticLiftsLayer.visible = previousRealisticLiftsLayerVisible;
          view.ui.remove(legend);
        }
      },
      timeExtentHandle,
      snowDepthHandle,
      waterUsageHandle
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
