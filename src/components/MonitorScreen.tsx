import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import Header from "./Header";
import { UIActions, WidgetProperties } from "./interfaces";

type Properties = Pick<MonitorScreen, "actions"> & WidgetProperties;

@subclass("digital-mountain.MonitorScreen")
class MonitorScreen extends Widget {
  @property()
  actions: UIActions;

  constructor(properties: Properties) {
    super(properties);
  }

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} title="Monitoring" />
      </div>
    );
  }
}

export default MonitorScreen;
