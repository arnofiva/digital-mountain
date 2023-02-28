import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import LiveStore from "../stores/LiveStore";
import Alerts from "./Alerts";
import Clock from "./Clock";
import Header from "./Header";
import { UIActions } from "../interfaces";
import { Widget } from "./Widget";
import { ensureViewUIContainer } from "../utils";

type ConstructProperties = Pick<LiveScreen, "actions" | "store">;

@subclass("digital-mountain.LiveScreen")
class LiveScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: LiveStore;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Live" />
        <Clock actions={this.actions} container={ensureViewUIContainer("top-left", "clock")} date={this.store.date} />
        <Alerts
          actions={this.actions}
          alerts={this.store.alerts}
          container={ensureViewUIContainer("top-right", "alerts")}
        />
      </div>
    );
  }
}

export default LiveScreen;
