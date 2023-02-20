import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import TaskSelectionButton from "./TaskSelectionButton";
import { ScreenType, UIActions } from "../interfaces";
import { Widget } from "./Widget";
import { TaskSelectionStore } from "../stores";

type ConstructProperties = Pick<TaskSelectionScreen, "actions" | "store">;

@subclass("digital-mountain.TaskSelectionScreen")
class TaskSelectionScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: TaskSelectionStore;

  render() {
    return (
      <div class="screen task-selection">
        <h1 class="title">Digital Mountain</h1>
        <h3 class="subtitle">What's your job today?</h3>
        <div class="tasks">
          <TaskSelectionButton
            actions={this.actions}
            text="Monitoring"
            taskScreenType={ScreenType.Monitor}
          />
          <TaskSelectionButton
            actions={this.actions}
            text="Planning"
            taskScreenType={ScreenType.Plan}
          />
          <TaskSelectionButton
            actions={this.actions}
            text="Visiting"
            taskScreenType={ScreenType.Visit}
          />
        </div>
      </div>
    );
  }
}

export default TaskSelectionScreen;
