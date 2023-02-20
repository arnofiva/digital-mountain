import "@esri/calcite-components/dist/components/calcite-link";
import "@esri/calcite-components/dist/components/calcite-notice";
import { CalciteNotice } from "@esri/calcite-components/dist/components";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { Widget } from "./Widget";
import { AlertData, AlertType, UIActions } from "../interfaces";

type ConstructProperties = Pick<Alert, "actions" | "data">;

@subclass("digital-mountain.Alert")
class Alert extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  data: AlertData;

  render() {
    const notice = (
      <calcite-notice
        class="alert"
        closable
        icon={noticeIcon(this.data.type)}
        kind={noticeKind(this.data.type)}
        label={noticeLabel(this.data.type)}
        open
      >
        <div class="title" slot="title">
          {alertTitle(this.data)}
          <div class="time">
            {this.data.date.toLocaleTimeString("default", { timeStyle: "short" })}
          </div>
        </div>
      </calcite-notice>
    ) as { domNode: CalciteNotice };
    return (
      <div
        class="alert"
        onclick={() => {
          // ignore clicks on close button
          if (notice.domNode.open) {
            this.actions.goToAlert(this.data);
          }
        }}
      >
        {notice}
      </div>
    );
  }
}

function alertTitle(alertData: AlertData): string {
  switch (alertData.type) {
    case AlertType.Accident:
      return `Accident on slope ${alertData.slopeId}`;
    case AlertType.AccidentArrival:
      return "Arrived at accident";
    case AlertType.Avalanche:
      return "Avalanche successful";
    case AlertType.SlopeClose:
      return `Slope ${alertData.slopeId} closed`;
    case AlertType.SlopeOpen:
      return `Slope ${alertData.slopeId} opened`;
  }
}

function noticeIcon(alertType: AlertType): string {
  switch (alertType) {
    case AlertType.Accident:
      return "exclamation-mark-triangle";
    case AlertType.AccidentArrival:
      return "check";
    case AlertType.Avalanche:
      return "exclamation-mark-triangle";
    case AlertType.SlopeClose:
      return "x";
    case AlertType.SlopeOpen:
      return "check";
  }
}

function noticeKind(alertType: AlertType): string {
  switch (alertType) {
    case AlertType.Accident:
      return "danger";
    case AlertType.AccidentArrival:
      return "danger";
    case AlertType.Avalanche:
      return "warning";
    case AlertType.SlopeClose:
      return "info";
    case AlertType.SlopeOpen:
      return "success";
  }
}

function noticeLabel(alertType: AlertType): string {
  switch (alertType) {
    case AlertType.Accident:
      return "Accident alert";
    case AlertType.AccidentArrival:
      return "Arrival alert";
    case AlertType.Avalanche:
      return "Avalanche alert";
    case AlertType.SlopeClose:
      return "Slope close alert";
    case AlertType.SlopeOpen:
      return "Slope open alert";
  }
}

export default Alert;
