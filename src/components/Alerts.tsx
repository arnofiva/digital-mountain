import "@esri/calcite-components/dist/components/calcite-link";
import "@esri/calcite-components/dist/components/calcite-notice";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { Widget } from "./Widget";
import { AlertType, UIActions } from "../interfaces";
import Alert from "./Alert";

type ConstructProperties = Pick<Alerts, "actions">;

const placeholderDate = new Date();

@subclass("digital-mountain.Alerts")
class Alerts extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  render() {
    return (
      <div class="alerts">
        <Alert
          actions={this.actions}
          title="Accident on slope 23"
          data={{ type: AlertType.Accident, slopeId: 23, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Arrived at accident"
          data={{ type: AlertType.AccidentArrival, slopeId: 23, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Slope 23 opened"
          data={{ type: AlertType.SlopeOpen, slopeId: 23, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Slope 23 closed"
          data={{ type: AlertType.SlopeClose, slopeId: 23, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
        <Alert
          actions={this.actions}
          title="Avalanche successful"
          data={{ type: AlertType.Avalanche, date: placeholderDate }}
        />
      </div>
    );
  }
}

export default Alerts;
