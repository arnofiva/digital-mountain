import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "../interfaces";
import { Widget } from "./Widget";
import VisitStore from "../stores/VisitStore";

type ConstructProperties = Pick<VisitScreen, "actions" | "store">;

@subclass("digital-mountain.VisitScreen")
class VisitScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: VisitStore;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Visiting" />
      </div>
    );
  }
}

export default VisitScreen;
