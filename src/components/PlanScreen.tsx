import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "./interfaces";
import PlanActions from "./PlanActions";
import { Widget } from "./Widget";
import { PlanStore } from "../stores";

type ConstructProperties = Pick<PlanScreen, "actions" | "store">;

@subclass("digital-mountain.PlanScreen")
class PlanScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: PlanStore;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Planning" />
        <PlanActions hint={this.store.hint} actions={this.actions} />
      </div>
    );
  }
}

export default PlanScreen;
