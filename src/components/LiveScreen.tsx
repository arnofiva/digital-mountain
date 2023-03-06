import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "../interfaces";
import LiveStore from "../stores/LiveStore";
import { ensureViewUIContainer } from "../utils";
import Alerts from "./Alerts";
import Clock from "./Clock";
import CodeSnippet from "./CodeSnippet";
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
    const dimensionSnippetText = `const streamLayer = new StreamLayer({
  url: "https://us-iot.arcgis.com/.../slopesStatus/StreamServer"
});

const streamLayerView = await view.whenLayerView(streamLayer);

streamLayerView.on("data-received", (e) => {
  if (e.attributes["status"] === "OPEN") {
    showNotification(e);
  }
});`;

    return (
      <div class="screen screen-live">
        <Header actions={this.actions} subtitle="Operations" />
        <CodeSnippet display={this.store.codeSnippetVisible} text={dimensionSnippetText} />
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
