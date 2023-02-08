import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Header from "./Header";
import { UIActions } from "./interfaces";
import PlanActions from "./PlanActions";
import { Widget } from "./Widget";

type ConstructProperties = Pick<PlanScreen, "actions" | "planningHint">;

@subclass("digital-mountain.PlanScreen")
class PlanScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  planningHint: string | null;

  render() {
    return (
      <div class="screen">
        <Header actions={this.actions} subtitle="Planning" />
        <PlanActions planningHint={this.planningHint} actions={this.actions} />
      </div>
    );
  }
}

export default PlanScreen;
