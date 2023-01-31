import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import TaskSelectionButton from "./TaskSelectionButton";
import { TaskScreen, UIActions, WidgetProperties } from "./interfaces";

type Properties = Pick<TaskSelectionButton, "actions"> & WidgetProperties;

@subclass("digital-mountain.TaskSelectionScreen")
class TaskSelectionScreen extends Widget {
  @property()
  actions: UIActions;

  constructor(properties: Properties) {
    super(properties);
  }

  render() {
    return (
      <div class="screen task-selection">
        <TaskSelectionButton
          actions={this.actions}
          text="Monitoring"
          taskScreen={TaskScreen.Monitor}
        />
        <TaskSelectionButton actions={this.actions} text="Planning" taskScreen={TaskScreen.Plan} />
        <TaskSelectionButton actions={this.actions} text="Visiting" taskScreen={TaskScreen.Visit} />
      </div>
    );
  }
}

export default TaskSelectionScreen;
