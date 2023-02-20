import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "../interfaces";
import { Widget } from "./Widget";
import { MonitorStore } from "../stores";
import Alerts from "./Alerts";

type ConstructProperties = Pick<MonitorScreen, "actions" | "store">;

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
      </div>
    );
  }
}

export default MonitorScreen;
