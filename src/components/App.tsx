import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import Store from "../Store";
import { TaskScreen } from "./interfaces";
import MonitorScreen from "./MonitorScreen";
import PlanScreen from "./PlanScreen";
import VisitScreen from "./VisitScreen";
import TaskSelectionScreen from "./TaskSelectionScreen";

@subclass("digital-mountain.App")
class App extends Widget {
  @property()
  store = new Store();

  render() {
    return <div>{this._screenComponent()}</div>;
  }

  private _screenComponent(): tsx.JSX.Element {
    switch (this.store.taskScreen) {
      case null:
        return <TaskSelectionScreen actions={this.store} />;
      case TaskScreen.Monitor:
        return <MonitorScreen actions={this.store} />;
      case TaskScreen.Plan:
        return <PlanScreen actions={this.store} />;
      case TaskScreen.Visit:
        return <VisitScreen actions={this.store} />;
    }
  }
}

export default App;
