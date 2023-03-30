import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "../interfaces";
import LiveStore from "../stores/LiveStore";
import { ensureViewUIContainer } from "../utils";
import Alerts from "./Alerts";
import Clock from "./Clock";
import Header from "./Header";
import { Widget } from "./Widget";

type ConstructProperties = Pick<LiveScreen, "actions" | "store">;

@subclass("digital-mountain.LiveScreen")
class LiveScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: LiveStore;

  render() {
    const buttons = (
      <div class="align-right">
        <calcite-button
          appearance={this.store.snowCannonLabelsEnabled ? "solid" : "outline"}
          class="align-right"
          onclick={() => this.actions.toggleSnowCannonLabels()}
        >
          Snow Cannons
        </calcite-button>
      </div>
    );

    return (
      <div class="screen screen-live">
        <Header actions={this.actions} contentElement={buttons} subtitle="Operations" />
        <Clock
          actions={this.actions}
          container={ensureViewUIContainer("top-left", "clock")}
          date={this.store.date}
        />
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
