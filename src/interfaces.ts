import Graphic from "@arcgis/core/Graphic";
import TimeExtent from "@arcgis/core/TimeExtent";

export interface UIActions {
  exportPlan(): void;
  goToAlert(data: AlertData): void;
  openTaskScreen(taskScreenType: TaskScreenType): void;
  openTaskSelectionScreen(options: { animateCameraToStart: boolean }): void;
  setViewTimeExtent(timeExtent: TimeExtent | null): void;
  startSlopeEditor(): void;
  startLiftEditor(options?: { updateGraphic?: Graphic }): void;
  toggleStartTime(): void;
}

export enum ScreenType {
  TaskSelection,
  Live,
  Planning,
  Statistics
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

export interface SlopeStreamEvent {
  attributes: {
    track_id: number;
    STATUS: "Offen" | "In Vorbereitung" | "Geschlossen";
    showAlert: boolean;
  };
}
