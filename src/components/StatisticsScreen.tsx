import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "../interfaces";
import StatisticsStore from "../stores/StatisticsStore";
import { ensureViewUIContainer } from "../utils";
import Header from "./Header";
import { WaterHistogram } from "./WaterHistogram";
import { Widget } from "./Widget";

type ConstructProperties = Pick<StatisticsScreen, "actions" | "store">;

@subclass("digital-mountain.StatisticsScreen")
class StatisticsScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: StatisticsStore;

  render() {

    const buttons = (
      <div class="align-right">
      <calcite-button
        appearance={this.store.snowCoverVisible ? "solid" : "outline"}
        // icon-start={this.store.exporting ? "spinner" : "save"}
        // disabled={this.store.exporting}
        // kind={this.store.didExportFail ? "danger" : "brand"}
        class="align-right save-button"
        onclick={() => this.actions.toggleSnowDepths()}
      >
        Snow Depths
      </calcite-button>
      &nbsp;
      <calcite-button
        appearance={this.store.waterUsageVisible ? "solid" : "outline"}
      // icon-start={this.store.exporting ? "spinner" : "save"}
      // disabled={this.store.exporting}
      // kind={this.store.didExportFail ? "danger" : "brand"}
      class="align-right save-button"
      onclick={() => this.actions.toggleWaterUsage()}
    >
      Water Usage
    </calcite-button>
    </div>
      
    );

    return (
      <div class="screen">
        <Header actions={this.actions} contentElement={buttons} subtitle="Snowmaking" />
        <WaterHistogram
          container={ensureViewUIContainer("bottom-left", "statistics")}
          records={this.store.records}
          actions={this.actions}
          visible={this.store.waterUsageVisible}
        ></WaterHistogram>
      </div>
    );
  }
}

export default StatisticsScreen;
