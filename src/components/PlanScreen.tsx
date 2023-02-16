import "@esri/calcite-components/dist/components/calcite-button";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { PlanStore } from "../stores";
import Header from "./Header";
import { UIActions } from "./interfaces";
import PlanActions from "./PlanActions";
import PlanOverview from "./PlanOverview";
import { Widget } from "./Widget";

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
        <PlanOverview
          cableLength={this.store.cableLength}
          measurementSystem={this.store.measurementSystem}
          slopeSurfaceArea={this.store.slopeSurfaceArea}
          towerCount={this.store.towerCount}
        />
      </div>
    );
  }
}

export default PlanScreen;
