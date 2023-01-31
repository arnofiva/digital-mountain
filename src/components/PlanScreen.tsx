import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import Header from "./Header";
import { UIActions, WidgetProperties } from "./interfaces";

type Properties = Pick<PlanScreen, "actions"> & WidgetProperties;

@subclass("digital-mountain.PlanScreen")
class PlanScreen extends Widget {
  @property()
  actions: UIActions;

  constructor(properties: Properties) {
    super(properties);
  }

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} title="Planning" />
      </div>
    );
  }
}

export default PlanScreen;
