import Graphic from "@arcgis/core/Graphic";

export interface UIActions {
  exportPlan(): void;
  openTaskScreen(taskScreenType: TaskScreenType): void;
  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void;
  startSlopeEditor(): void;
  startLiftEditor(options?: { updateGraphic?: Graphic }): void;
}

export enum ScreenType {
  TaskSelection,
  Monitor,
  Plan,
  Visit
}

export type TaskScreenType = Exclude<ScreenType, ScreenType.TaskSelection>;
