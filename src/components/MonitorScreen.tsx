import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { MonitorStore } from "../stores";
import Alerts from "./Alerts";
import Clock from "./Clock";
import Header from "./Header";
import { UIActions } from "../interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<MonitorScreen, "actions" | "store">;

const placeholderTime = new Date(Date.UTC(2023, 3, 1, 13, 25, 2));
@subclass("digital-mountain.MonitorScreen")
class MonitorScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: MonitorStore;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Monitoring" />
        <Alerts actions={this.actions} />
        <Clock time={placeholderTime}></Clock>
      </div>
    );
  }
}

export default MonitorScreen;
