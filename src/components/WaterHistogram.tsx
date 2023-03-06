import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import TimeExtent from "@arcgis/core/TimeExtent";
import HistogramRangeSlider from "@arcgis/core/widgets/HistogramRangeSlider";
import { tsx } from "@arcgis/core/widgets/support/widget";
import { UIActions } from "../interfaces";
import { ignoreAbortErrors, throttle } from "../utils";
import { Widget } from "./Widget";

type ConstructProperties = Pick<WaterHistogram, "actions" | "records">;
type HistogramData = Pick<HistogramRangeSlider, "min" | "max" | "bins" | "average">;

const timeRange = [Date.UTC(2021, 10, 23), Date.UTC(2021, 11, 15)] as const;

@subclass("digital-mountain.WaterHistogram")
export class WaterHistogram extends Widget<ConstructProperties> {
  override postInitialize(): void {
    const abortController = new AbortController();

    this.addHandles([
      { remove: () => abortController.abort() },
      watch(
        () => {
          const data = this._histogramData;
          return data ? new Date(data.min) : null;
        },
        (date) => {
          this._date = date;
        },
        {
          sync: true,
          initial: true,
          equals: (newDate: Date | null, oldDate: Date | null) =>
            newDate?.getTime() === oldDate?.getTime()
        }
      ),
      watch(
        () => this._date,
        (date) => {
          ignoreAbortErrors(
            this._throttledSetViewTimeExtent(abortController.signal, dayTimeExtentFromDate(date))
          );
        },
        { initial: true, equals: datesAreWithinSameDay }
      ),
      this._histogram.on("thumb-change", (event) => (this._date = new Date(event.value))),
      this._histogram.on("thumb-drag", (event) => (this._date = new Date(event.value))),
      { remove: () => this.actions.setViewTimeExtent(null) },
      { remove: () => this._histogram.destroy() }
    ]);
  }

  @property()
  actions: UIActions;

  @property()
  records: Graphic[] | null;

  @property()
  private _date: Date | null = null;

  @property()
  private get _volumeToday(): number {
    const date = this._date;
    if (!date) {
      return 0;
    }
    const time = date.getTime();
    for (const { minValue, maxValue, count } of this._histogram.bins) {
      if (minValue < time && time < maxValue) {
        return count;
      }
    }
    return 0;
  }

  @property()
  private get _histogramData(): HistogramData | null {
    const { records } = this;
    if (!records) {
      return null;
    }

    const histogramData: HistogramData = {
      bins: [],
      average: (timeRange[0] + timeRange[1]) * 0.5,
      min: timeRange[0],
      max: timeRange[1]
    };

    // We loop over each day in the range, create a bin for it, and count the volume from that day.
    // We assume records are sorted in ascending date order.
    for (
      let binDate = new Date(timeRange[0]), i = 0;
      binDate.getTime() <= timeRange[1];
      binDate.setUTCDate(binDate.getUTCDate() + 1)
    ) {
      tmpDate.setTime(binDate.getTime());
      tmpDate.setUTCHours(0, 0, 0, 0); // Start of day
      const binStart = tmpDate.getTime();
      tmpDate.setUTCHours(23, 59, 59, 999); // End of day
      const binEnd = tmpDate.getTime();

      // Find all records within this day and add them up (generally there will be only one).
      // We continue from were previous iterations stopped, since records are sorted.
      let dailyVolume = 0;
      for (; i < records.length && recordIsBeforeDayEnd(records[i], binEnd); ++i) {
        if (recordIsAfterDayStart(records[i], binStart)) {
          // Record is within day
          dailyVolume += records[i].attributes.volumen_sum;
        }
      }
      histogramData.bins.push({
        count: dailyVolume,
        minValue: binStart,
        maxValue: binEnd
      });
    }

    return histogramData;
  }

  @property()
  private _histogram = new HistogramRangeSlider({
    // rangeType: "equal",
    rangeType: "at-most",
    values: [0],
    labelFormatFunction: formatNumberAsDate,
    barCreatedFunction: (index, element: SVGElement) => {
      element.addEventListener("click", () => {
        const bin = this._histogram.bins[index];
        this._date = new Date((bin.maxValue + bin.minValue) * 0.5);
      });
      element.style.cursor = "pointer";
    }
  });

  private readonly _throttledSetViewTimeExtent = throttle(
    (timeExtent: TimeExtent | null) => this.actions.setViewTimeExtent(timeExtent),
    1000 /* ms */
  );

  render() {
    const histogramData = this._histogramData;
    const date = this._date;
    const hasData = date && histogramData && histogramData.bins.length !== 0;

    return (
      <div class="statistics-time esri-widget">
        {hasData ? (
          this._renderChildren(histogramData, date)
        ) : (
          <p class="statistics-message">No data loaded</p>
        )}
      </div>
    );
  }

  private _renderChildren(histogramData: HistogramData, date: Date): tsx.JSX.Element[] {
    const histogram = this._histogram;
    histogram.bins = histogramData.bins;
    histogram.min = histogramData.min;
    histogram.max = histogramData.max;
    histogram.values = [date.valueOf() ?? 0];

    return [
      <div class="histogram-container">{histogram.render()}</div>,
      <div class="histogram-info">
        <p>Date: {longDateFormatter.format(date)}</p>
        <p>Volume of water used: {this._volumeToday.toFixed(0)} m³</p>
      </div>
    ];
  }
}

function formatNumberAsDate(timestamp: number) {
  return shortDateFormatter.format(timestamp);
}

function recordIsAfterDayStart({ attributes: { Date } }: Graphic, start: number): boolean {
  return start <= Date;
}

function recordIsBeforeDayEnd({ attributes: { Date } }: Graphic, end: number): boolean {
  return Date <= end;
}

function dayTimeExtentFromDate(date: Date | null): TimeExtent | null {
  if (!date) {
    return null;
  }

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return new TimeExtent({
    start,
    end
  });
}

function datesAreWithinSameDay(oldDate: Date | null, newDate: Date | null): boolean {
  return (
    oldDate === newDate ||
    (oldDate != null &&
      newDate != null &&
      shortDateFormatter.format(oldDate) === shortDateFormatter.format(newDate))
  ); // This formatter only displays the year/month/day
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
const longDateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
const tmpDate = new Date(0);
