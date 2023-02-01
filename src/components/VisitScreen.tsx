import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<VisitScreen, "actions">;

@subclass("digital-mountain.VisitScreen")
class VisitScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} title="Visiting" />
      </div>
    );
  }
}

export default VisitScreen;
