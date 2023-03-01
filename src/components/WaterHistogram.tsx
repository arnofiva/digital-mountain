import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import HistogramRangeSlider from "@arcgis/core/widgets/HistogramRangeSlider";
import { tsx } from "@arcgis/core/widgets/support/widget";
import { UIActions } from "../interfaces";
import { ignoreAbortErrors, throttle } from "../utils";
import { Widget } from "./Widget";

type ConstructProperties = Pick<WaterHistogram, "actions" | "records">;
type HistogramData = Pick<HistogramRangeSlider, "min" | "max" | "bins" | "average">;

/** Minimum volume we'll consider to clamp the histogram  */
const minHistogramVolume = 1;

@subclass("digital-mountain.WaterHistogram")
export class WaterHistogram extends Widget<ConstructProperties> {
  override postInitialize(): void {
    const abortController = new AbortController();

    this.addHandles([
      { remove: () => abortController.abort() },
      watch(
        () => {
          const data = this._histogramData;
          return data ? new Date(data.average) : null;
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
        (date) => ignoreAbortErrors(this._throttledSetViewTimeExtent(abortController.signal, date)),
        { initial: true }
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
  private get _histogramData(): HistogramData | null {
    if (!this.records) {
      return null;
    }

    const histogramData: HistogramData = {
      bins: [],
      average: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };

    for (const { attributes } of this.records) {
      const volume: number = attributes.volumen_sum;
      const date: number = attributes.Date;
      histogramData.min = Math.min(histogramData.min, date);
      histogramData.max = Math.max(histogramData.max, date);
      histogramData.bins.push({
        count: volume,
        minValue: date,
        maxValue: date
      });
    }

    // Clamp histogram range to data
    let firstNonEmptyIndex = histogramData.bins.length;
    let lastNonEmptyIndex = 0;
    for (let i = 0; i < histogramData.bins.length; ++i) {
      const bin = histogramData.bins[i];
      const hasVolume = bin.count > minHistogramVolume;
      if (hasVolume) {
        firstNonEmptyIndex = Math.min(firstNonEmptyIndex, i);
        lastNonEmptyIndex = Math.max(lastNonEmptyIndex, i);
      }
    }

    if (lastNonEmptyIndex !== 0 && firstNonEmptyIndex !== histogramData.bins.length) {
      histogramData.bins = histogramData.bins.slice(firstNonEmptyIndex, lastNonEmptyIndex + 1);
      histogramData.min = histogramData.bins[0].minValue;
      histogramData.max = histogramData.bins[histogramData.bins.length - 1].maxValue;
    }
    histogramData.average = (histogramData.max + histogramData.min) * 0.5;
    return histogramData;
  }

  @property()
  private _histogram = new HistogramRangeSlider({
    rangeType: "at-most",
    values: [0],
    labelFormatFunction: formatNumberAsDate
  });

  private readonly _throttledSetViewTimeExtent = throttle(
    (date: Date | null) => this.actions.setViewTimeExtent(date),
    500 /* ms */
  );

  render() {
    const histogramData = this._histogramData;
    const hasData = histogramData && histogramData.bins.length !== 0;

    let message = "No data loaded";
    let histogramElement: tsx.JSX.Element | null = null;
    if (hasData) {
      this._histogram.bins = histogramData.bins;
      this._histogram.min = histogramData.min;
      this._histogram.max = histogramData.max;
      this._histogram.values = [this._date?.valueOf() ?? 0];

      message = "Volume of water used by snow cannons";
      histogramElement = <div class="histogram-container">{this._histogram.render()}</div>;
    }

    return (
      <div class="statistics-time esri-widget">
        <p>{message}</p>
        {histogramElement}
      </div>
    );
  }
}

function formatNumberAsDate(timestamp: number) {
  return formatter.format(timestamp);
}

const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
