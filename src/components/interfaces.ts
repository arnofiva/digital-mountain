export interface UIActions {
  openTaskScreen(v: TaskScreen): void;
  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void;
}

export enum TaskScreen {
  Monitor,
  Plan,
  Visit
}
