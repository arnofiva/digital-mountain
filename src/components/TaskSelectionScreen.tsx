import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import TaskSelectionButton from "./TaskSelectionButton";
import { TaskScreen, UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<TaskSelectionButton, "actions">;

@subclass("digital-mountain.TaskSelectionScreen")
class TaskSelectionScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  render() {
    return (
      <div class="screen task-selection">
        <h1 class="title">Digital Mountain</h1>
        <h3 class="subtitle">What's your job today?</h3>
        <div class="tasks">
          <TaskSelectionButton
            actions={this.actions}
            text="Monitoring"
            taskScreen={TaskScreen.Monitor}
          />
          <TaskSelectionButton actions={this.actions} text="Planning" taskScreen={TaskScreen.Plan} />
          <TaskSelectionButton actions={this.actions} text="Visiting" taskScreen={TaskScreen.Visit} />
        </div>
      </div>
    );
  }
}

export default TaskSelectionScreen;
