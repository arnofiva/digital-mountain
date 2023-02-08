import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<PlanActions, "actions">;

@subclass("digital-mountain.PlanActions")
class PlanActions extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  render() {
    return (
      <div class="plan-actions">
        <calcite-card>
          <calcite-button onclick={() => this.actions.startSlopeEditor()}>New Slope</calcite-button>
          <calcite-button onclick={() => this.actions.startLiftEditor()}>New Lift</calcite-button>
        </calcite-card>
      </div>
    );
  }
}

export default PlanActions;
