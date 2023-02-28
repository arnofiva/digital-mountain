import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { Widget } from "./Widget";
import { dateToTimeString } from "../utils";
import { UIActions } from "../interfaces";

type ConstructProperties = Pick<Clock, "actions"| "date">;

@subclass("digital-mountain.Clock")
class Clock extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  date: Date;

  render() {
    const { hoursMinutes, seconds } = dateToTimeString(this.date);
    return (
      <div class="clock" onclick={() => this.actions.toggleStartTime()}>
        <div class="clock-text-container">
          <span class="time-hh-mm">{hoursMinutes}</span>
          <span class="time-ss">{seconds}</span>
        </div>
        <div class="live-message">
          <span>LIVE</span>
          <calcite-icon icon="circle-f" text-label="live" scale="s"></calcite-icon>
        </div>
        <div class="simulated-time-info">
          <calcite-icon icon="information" text-label="information" scale="s"></calcite-icon>
          <span class="simulated-time-label">Simulated time</span>
        </div>
      </div>
    );
  }
}

export default Clock;
