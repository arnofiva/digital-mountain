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
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Statistics" />
        <WaterHistogram
          container={ensureViewUIContainer("bottom-left", "statistics")}
          records={this.store.records}
          actions={this.actions}
        ></WaterHistogram>
      </div>
    );
  }
}

export default StatisticsScreen;
