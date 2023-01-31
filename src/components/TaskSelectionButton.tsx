import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import { TaskScreen, UIActions, WidgetProperties } from "./interfaces";

type Properties = Pick<TaskSelectionButton, "actions" | "text" | "taskScreen"> & WidgetProperties;

@subclass("digital-mountain.TaskSelectionButton")
class TaskSelectionButton extends Widget {
  @property()
  actions: UIActions;

  @property()
  text: string;

  @property()
  taskScreen: TaskScreen;

  constructor(properties: Properties) {
    super(properties);
  }

  render() {
    return (
      <div>
        <calcite-button onclick={() => this.actions.openTaskScreen(this.taskScreen)} scale="l">
          {this.text}
        </calcite-button>
      </div>
    );
  }
}

export default TaskSelectionButton;
