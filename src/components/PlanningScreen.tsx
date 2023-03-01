import "@esri/calcite-components/dist/components/calcite-button";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import PlanningStore from "../stores/PlanningStore";
import Header from "./Header";
import { UIActions } from "../interfaces";
import PlanActions from "./PlanActions";
import PlanOverview from "./PlanOverview";
import { Widget } from "./Widget";
import { ensureViewUIContainer } from "../utils";
import CodeSnippet from "./CodeSnippet";

type ConstructProperties = Pick<PlanningScreen, "actions" | "store">;

@subclass("digital-mountain.PlanningScreen")
class PlanningScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: PlanningStore;

  render() {
    const dimensionSnippetText = `new LengthDimension({
  startPoint: new Point({ x, y, z: sketchPoint.z }),
  endPoint: new Point({ x, y, z: sketchPoint.z - towerHeight }),
  offset: 4,
  orientation: liftHeading - 90
});`;
    const contentElement = (
      <calcite-button
        icon-start={this.store.exporting ? "spinner" : "save"}
        disabled={this.store.exporting}
        kind={this.store.didExportFail ? "danger" : "brand"}
        class="align-right save-button"
        onclick={() => this.actions.exportPlan()}
      >
        Save
      </calcite-button>
    );
    return (
      <div class="screen">
        <Header actions={this.actions} contentElement={contentElement} subtitle="Planning" />
        <CodeSnippet display={this.store.codeSnippetVisible} text={dimensionSnippetText} />
        <PlanActions hint={this.store.hint} actions={this.actions} />
        <PlanOverview
          cableLength={this.store.cableLength}
          container={ensureViewUIContainer("bottom-right", "plan-overview")}
          measurementSystem={this.store.measurementSystem}
          slopeSurfaceArea={this.store.slopeSurfaceArea}
          towerCount={this.store.towerCount}
          treesDisplaced={this.store.treesDisplaced}
        />
      </div>
    );
  }
}

export default PlanningScreen;
