import Graphic from "@arcgis/core/Graphic";

export interface UIActions {
  openTaskScreen(taskScreenType: TaskScreenType): void;
  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void;
  startSlopeEditor(): void;
  startLiftEditor(options?: { updateGraphic?: Graphic }): void;
}

export enum TaskScreenType {
  Monitor,
  Plan,
  Visit
}

export type TaskScreen = TaskScreenMonitor | TaskScreenPlan | TaskScreenVisit;

interface TaskScreenMonitor {
  type: TaskScreenType.Monitor;
}

interface TaskScreenPlan {
  type: TaskScreenType.Plan;
}

interface TaskScreenVisit {
  type: TaskScreenType.Visit;
}
