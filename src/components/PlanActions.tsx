import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<PlanActions, "actions" | "hint">;

@subclass("digital-mountain.PlanActions")
class PlanActions extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  hint: string | null;

  render() {
    return (
      <div class="plan-actions">
        <calcite-card>
          {this.hint ? (
            <span>{this.hint}</span>
          ) : (
            <div>
              <calcite-button onclick={() => this.actions.startSlopeEditor()}>
                New Slope
              </calcite-button>
              <calcite-button onclick={() => this.actions.startLiftEditor()}>
                New Lift
              </calcite-button>
            </div>
          )}
        </calcite-card>
      </div>
    );
  }
}

export default PlanActions;
