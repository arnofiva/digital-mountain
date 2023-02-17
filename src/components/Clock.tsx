import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { Widget } from "./Widget";

type ConstructProperties = Pick<Clock, "time">;

@subclass("digital-mountain.Clock")
class Clock extends Widget<ConstructProperties> {
  @property()
  time: Date;

  render() {
    const timeParts = formatter.formatToParts(this.time).map((part) => part.value);
    return (
      <div class="clock esri-widget">
        <div class="clock-text-container">
          <span class="time-hh-mm">{`${timeParts[0]}${timeParts[1]}${timeParts[2]}${timeParts[3]}`}</span>
          <span class="time-ss">{timeParts[4]}</span>
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

const formatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "medium",
  timeZone: "UTC",
  hour12: false
});

export default Clock;
