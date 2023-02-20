import "@esri/calcite-components/dist/components/calcite-link";
import "@esri/calcite-components/dist/components/calcite-notice";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Collection from "@arcgis/core/core/Collection";

import { Widget } from "./Widget";
import { AlertData, UIActions } from "../interfaces";
import Alert from "./Alert";

type ConstructProperties = Pick<Alerts, "actions" | "alerts">;

@subclass("digital-mountain.Alerts")
class Alerts extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  alerts: Collection<AlertData>;

  render() {
    return (
      <div class="alerts">
        {this.alerts.toArray().map((data) => (
          <Alert actions={this.actions} key={JSON.stringify(data)} data={data} />
        ))}
      </div>
    );
  }
}

export default Alerts;
