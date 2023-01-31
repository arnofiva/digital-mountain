// copied from @arcgis/core
export interface WidgetProperties {
  container?: string | HTMLElement;
  id?: string;
  label?: string;
  visible?: boolean;
}

export interface UIActions {
  openTaskScreen(v: TaskScreen): void;
  openTaskSelectionScreen(): void;
}

export enum TaskScreen {
  Monitor,
  Plan,
  Visit
}
