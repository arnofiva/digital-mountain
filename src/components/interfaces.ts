export interface UIActions {
  openTaskScreen(v: TaskScreen): void;
  openTaskSelectionScreen(): void;
}

export enum TaskScreen {
  Monitor,
  Plan,
  Visit
}
