import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "../interfaces";
import { Widget } from "./Widget";
import StatisticsStore from "../stores/StatisticsStore";

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
      </div>
    );
  }
}

export default StatisticsScreen;
