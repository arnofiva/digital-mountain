import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";
import { ScreenType } from "../interfaces";
import LiveScreen from "./LiveScreen";
import PlanningScreen from "./PlanningScreen";
import TaskSelectionScreen from "./TaskSelectionScreen";
import StatisticsScreen from "./StatisticsScreen";
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
      case ScreenType.Live:
        return <LiveScreen store={screenStore} actions={this.store} />;
      case ScreenType.Planning:
        return <PlanningScreen store={screenStore} actions={this.store} />;
      case ScreenType.Statistics:
        return <StatisticsScreen store={screenStore} actions={this.store} />;
    }
  }
}

export default App;
