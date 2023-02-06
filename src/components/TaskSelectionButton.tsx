import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { TaskScreenType, UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<TaskSelectionButton, "actions" | "text" | "taskScreenType">;

@subclass("digital-mountain.TaskSelectionButton")
class TaskSelectionButton extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  text: string;

  @property()
  taskScreenType: TaskScreenType;

  render() {
    return (
      <div>
        <calcite-button onclick={() => this.actions.openTaskScreen(this.taskScreenType)} scale="l">
          {this.text}
        </calcite-button>
      </div>
    );
  }
}

export default TaskSelectionButton;
