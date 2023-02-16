import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-icon";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-panel";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { MeasurementSystem } from "@arcgis/core/core/units";
import { tsx } from "@arcgis/core/widgets/support/widget";

import convert from "convert";

import { cableCostPerMeter, slopeCostPerMeterSquared, towerCost } from "../constants";
import { Widget } from "./Widget";

type ConstructProperties = Pick<
  PlanOverview,
  "cableLength" | "measurementSystem" | "slopeSurfaceArea" | "towerCount"
>;

@subclass("digital-mountain.PlanOverview")
class PlanOverview extends Widget<ConstructProperties> {
  @property()
  cableLength: number;

  @property()
  slopeSurfaceArea: number;

  @property()
  towerCount: number;

  @property()
  measurementSystem: MeasurementSystem;

  render() {
    return (
      <div class="plan-overview">
        <calcite-panel heading="Plan Overview">
          <calcite-block collapsible heading="Costs" open>
            <calcite-icon slot="icon" scale="s" icon="credits"></calcite-icon>
            <calcite-label layout="inline-space-between">
              Cables<strong>{this._costToString(this.cableLength * cableCostPerMeter)}</strong>
            </calcite-label>
            <calcite-label layout="inline-space-between">
              Towers<strong>{this._costToString(this.towerCount * towerCost)}</strong>
            </calcite-label>
            <calcite-label layout="inline-space-between">
              Slopes
              <strong>
                {this._costToString(this.slopeSurfaceArea * slopeCostPerMeterSquared)}
              </strong>
            </calcite-label>
          </calcite-block>
          <calcite-block collapsible heading="Quantities" open>
            <calcite-icon slot="icon" scale="s" icon="measure"></calcite-icon>
            <calcite-label layout="inline-space-between">
              Cable length<strong>{this._lengthToString(this.cableLength)}</strong>
            </calcite-label>
            <calcite-label layout="inline-space-between">
              Tower count<strong>{this.towerCount}</strong>
            </calcite-label>
            <calcite-label layout="inline-space-between">
              Slope surface area<strong>{this._surfaceAreaToString(this.slopeSurfaceArea)}</strong>
            </calcite-label>
          </calcite-block>
        </calcite-panel>
      </div>
    );
  }

  private _costToString(dollars: number): string {
    return dollarsFormatter.format(dollars);
  }

  private _lengthToString(meters: number): string {
    switch (this.measurementSystem) {
      case "imperial": {
        const feet = convert(meters, "m").to("ft");
        const miles = convert(meters, "m").to("mi");
        return miles < 1 ? feetFormatter.format(feet) : milesFormatter.format(miles);
      }
      case "metric": {
        const kilometers = convert(meters, "m").to("km");
        return kilometers < 1
          ? metersFormatter.format(meters)
          : kilometersFormatter.format(kilometers);
      }
    }
  }

  private _surfaceAreaToString(metersSquared: number): string {
    switch (this.measurementSystem) {
      case "imperial": {
        const feetSquared = convert(metersSquared, "m2").to("ft2");
        const milesSquared = convert(metersSquared, "m2").to("mi2");
        return (
          (feetSquared < 1e6
            ? feetFormatter.format(feetSquared)
            : milesFormatter.format(milesSquared)) + "²"
        );
      }
      case "metric": {
        const kilometersSquared = convert(metersSquared, "m2").to("km2");
        return (
          (metersSquared < 1e6
            ? metersFormatter.format(metersSquared)
            : kilometersFormatter.format(kilometersSquared)) + "²"
        );
      }
    }
  }
}

const dollarsFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const metersFormatter = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "meter",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const kilometersFormatter = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "kilometer",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const feetFormatter = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "foot",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const milesFormatter = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "mile",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export default PlanOverview;
