import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";
import { ScreenType } from "../interfaces";
import MonitorScreen from "./MonitorScreen";
import PlanScreen from "./PlanScreen";
import TaskSelectionScreen from "./TaskSelectionScreen";
import VisitScreen from "./VisitScreen";
import { Widget } from "./Widget";

type ConstructProperties = Pick<App, "store">;

@subclass("digital-mountain.App")
class App extends Widget<ConstructProperties> {
  @property({ constructOnly: true })
  readonly store: AppStore;

  render() {
    return <div>{this._screenComponent()}</div>;
  }

  private _screenComponent(): tsx.JSX.Element {
    const { screenStore } = this.store;
    switch (screenStore.type) {
      case ScreenType.TaskSelection:
        return <TaskSelectionScreen store={screenStore} actions={this.store} />;
      case ScreenType.Monitor:
        return <MonitorScreen store={screenStore} actions={this.store} />;
      case ScreenType.Plan:
        return <PlanScreen store={screenStore} actions={this.store} />;
      case ScreenType.Visit:
        return <VisitScreen store={screenStore} actions={this.store} />;
    }
  }
}

export default App;
