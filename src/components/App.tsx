import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Store from "../Store";
import { TaskScreenType } from "./interfaces";
import MonitorScreen from "./MonitorScreen";
import PlanScreen from "./PlanScreen";
import TaskSelectionScreen from "./TaskSelectionScreen";
import VisitScreen from "./VisitScreen";
import { Widget } from "./Widget";

type ConstructProperties = Pick<App, "store">;

@subclass("digital-mountain.App")
class App extends Widget<ConstructProperties> {
  @property({ constructOnly: true })
  readonly store: Store;

  render() {
    return <div>{this._screenComponent()}</div>;
  }

  private _screenComponent(): tsx.JSX.Element {
    const taskScreenType = this.store.taskScreenType;
    if (taskScreenType == null) {
      return <TaskSelectionScreen actions={this.store} />;
    }
    switch (taskScreenType) {
      case TaskScreenType.Monitor:
        return <MonitorScreen actions={this.store} />;
      case TaskScreenType.Plan:
        return <PlanScreen planningHint={this.store.planningHint} actions={this.store} />;
      case TaskScreenType.Visit:
        return <VisitScreen actions={this.store} />;
    }
  }
}

export default App;
