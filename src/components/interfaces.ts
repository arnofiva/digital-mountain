import Graphic from "@arcgis/core/Graphic";

export interface UIActions {
  exportPlan(): void;
  goToAlert(data: AlertData): void;
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

export enum AlertType {
  Accident,
  AccidentArrival,
  Avalanche,
  SlopeOpen,
  SlopeClose
}

interface CommonAlertData {
  type: AlertType;
  date: Date;
}
interface AccidentAlertData extends CommonAlertData {
  type: AlertType.Accident;
  slopeId: number;
}
interface AccidentArrivalAlertData extends CommonAlertData {
  type: AlertType.AccidentArrival;
  slopeId: number;
}
interface AvalancheAlertData extends CommonAlertData {
  type: AlertType.Avalanche;
}
interface SlopeOpenAlertData extends CommonAlertData {
  type: AlertType.SlopeOpen;
  slopeId: number;
}
interface SlopeCloseAlertData extends CommonAlertData {
  type: AlertType.SlopeClose;
  slopeId: number;
}
export type AlertData =
  | AccidentAlertData
  | AccidentArrivalAlertData
  | AvalancheAlertData
  | SlopeOpenAlertData
  | SlopeCloseAlertData;
