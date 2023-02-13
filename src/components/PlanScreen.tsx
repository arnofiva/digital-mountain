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
    const contentElement = (
      <calcite-button
        icon-start={this.store.exporting ? "spinner" : "save"}
        disabled={this.store.exporting}
        kind={this.store.didExportFail ? "danger" : "brand"}
        class="align-right save-button"
        onclick={() => this.actions.exportPlan()}
      >
        Export
      </calcite-button>
    );
    return (
      <div class="screen">
        <Header actions={this.actions} contentElement={contentElement} subtitle="Planning" />
        <PlanActions hint={this.store.hint} actions={this.actions} />
      </div>
    );
  }
}

export default PlanScreen;
