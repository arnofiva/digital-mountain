import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { ScreenType, UIActions } from "../interfaces";
import TaskSelectionStore from "../stores/TaskSelectionStore";
import TaskSelectionButton from "./TaskSelectionButton";
import { Widget } from "./Widget";

type ConstructProperties = Pick<TaskSelectionScreen, "actions" | "store">;

@subclass("digital-mountain.TaskSelectionScreen")
class TaskSelectionScreen extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  store: TaskSelectionStore;

  render() {
    if (this.store.ready) {
      return (
        <div class="screen task-selection">
          <h1 class="title">Digital Mountain</h1>
          <h3 class="subtitle">What's your job today?</h3>
          <div class="tasks">
            <TaskSelectionButton
              actions={this.actions}
              text="Operations"
              taskScreenType={ScreenType.Live}
            />
            <TaskSelectionButton
              actions={this.actions}
              text="Snowmaking"
              taskScreenType={ScreenType.Statistics}
            />
            <TaskSelectionButton
              actions={this.actions}
              text="Planning"
              taskScreenType={ScreenType.Planning}
            />
          </div>
        </div>
      );
    } else {
      return <div class="screen task-selection"></div>;
    }
  }
}

export default TaskSelectionScreen;
