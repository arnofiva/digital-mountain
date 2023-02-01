import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { TaskScreen, UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<TaskSelectionButton, "actions" | "text" | "taskScreen">;

@subclass("digital-mountain.TaskSelectionButton")
class TaskSelectionButton extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  text: string;

  @property()
  taskScreen: TaskScreen;

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
