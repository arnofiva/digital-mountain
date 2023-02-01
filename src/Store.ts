import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";

import { TaskScreen, UIActions } from "./components/interfaces";

@subclass("digital-mountain.Store")
class Store extends Accessor implements UIActions {
  @property()
  get taskScreen(): TaskScreen | null {
    return this._taskScreen;
  }

  @property()
  private _taskScreen: TaskScreen | null = null;

  /*************
   * UI actions
   *************/

  openTaskScreen(v: TaskScreen): void {
    this._taskScreen = v;
  }

  openTaskSelectionScreen(): void {
    this._taskScreen = null;
  }
}

export default Store;
