import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import { Chart } from "chart.js/auto"; // https://www.chartjs.org/docs/latest/getting-started/integration.html
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

import differenceInDays from "date-fns/differenceInDays";

import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { HeatmapRenderer, SimpleRenderer } from "@arcgis/core/renderers";
import { IconSymbol3DLayer, PointSymbol3D } from "@arcgis/core/symbols";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import 'chartjs-adapter-date-fns';
import { addDays, isWeekend } from "date-fns";
import { skiSlopesArea } from "./resort";

const colorStops = [
  { ratio: 0 / 12, color: "rgba(25, 43, 51, 0.6)" },
  { ratio: 2 / 12, color: "rgba(30, 140, 160, 1)" },
  { ratio: 3 / 12, color: "rgba(58, 165, 140, 1)" },
  { ratio: 4 / 12, color: "rgba(64, 184, 156, 1)" },
  { ratio: 5 / 12, color: "rgba(68, 199, 168, 1)" },
  { ratio: 6 / 12, color: "rgba(73, 214, 181, 1)" },
  { ratio: 7 / 12, color: "rgba(78, 230, 194, 1)" },
  { ratio: 8 / 12, color: "rgba(83, 245, 207, 1)" },
  { ratio: 9 / 12, color: "rgba(85, 250, 211, 1)" },
  { ratio: 10 / 12, color: "rgba(102, 255, 219, 1)" },
  { ratio: 11 / 12, color: "rgba(121, 237, 210, 1)" },
  { ratio: 12 / 12, color: "rgba(158, 255, 233, 1)" }
];

Chart.register(MatrixController, MatrixElement);

const START = new Date(2021, 11, 1, 0, 0, 0, 0);
const END = new Date(2022, 2, 10, 0, 0, 0, 0);

const HOURS = [/*10, 11,*/ 12, 13, 14, 15, 16, 17, 24];

const heatmapRenderer = new HeatmapRenderer({
  colorStops,
  maxDensity: 0.0035,
  radius: 25,
  minDensity: 0,
  // referenceScale: 20000,
  referenceScale: 65000
});

type SlopeFilterProps = {
  view: SceneView;
}

const accidents = new FeatureLayer({
  title: "Accidents (Location)",
  portalItem: {
    id: "f13721858ab1466381da1045ed1b121a"
  },
  hasZ: false,
  elevationInfo: {
    mode: "relative-to-scene",
    featureExpressionInfo: {
      expression: "0"
    }
  },
  outFields: ["*"],
  screenSizePerspectiveEnabled: true,
  // featureReduction: {
  //   type: "selection"
  // },
  renderer: new SimpleRenderer({
    // symbol: new WebStyleSymbol({
    //   name: "Hospital",
    //   styleName: "EsriIconsStyle"
    // }),
    symbol: new PointSymbol3D({
      verticalOffset: {
        screenLength: 25,
        maxWorldLength: 200,
        minWorldLength: 1
      },
  
      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: [0, 100, 0],
        size: 1.2,
        // border: {
        //   color: [50, 50, 50]
        // }
      }, 
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: {
            primitive: "circle"
          },
          size: 12,
          material: {
            color: [0, 100, 0],
          },
          // outline: {
          //   color: "black",
          //   size: 1
          // }
        }),
        new IconSymbol3DLayer({
          resource: {
            href: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/Hospital.svg"
          },
          material: {
            color: "white"
          },
          outline: {
            color: "black",
            size: 5
          },
          size: 8,
        }),
      ]
    })
  })
  // opacity: 0.7
});

@subclass()
class SlopeFilter extends Accessor {

  @property()
  enabled = false;

  @property({
    constructOnly: true
  })
  view: SceneView;

  @property()
  slopeId: string;

  @property()
  slopes: Graphic[];

  @property()
  accidentIds: number[];

  @property()
  private slopeHighlight = {remove: () => {}};

  @property()
  private accidentHighlight = {remove: () => {}};

  constructor(props: SlopeFilterProps) {
    super(props);

    let viewHandle: {remove: () => void} | undefined;

    watch(() => this.enabled, () => {
      if (viewHandle) {
        viewHandle.remove();
      }

      viewHandle = this.view.on("pointer-move", (e) => this.updateFilter(e));
    });
  }

  private parseSlopeId(slope: Graphic) {
    const IDENT = slope.getAttribute("IDENT");
    const IDENTNO = Number.parseInt(IDENT);
    if (Number.isNaN(IDENTNO)) {
      return `${IDENT}`;
    } else {
      return `${IDENTNO}`;
    }
  }

  private async queryAccidentsByGeometry(lv: FeatureLayerView) {
    if (this.slopes) {
      const geometry = geometryEngine.union(this.slopes.map(slope => slope.geometry));
      const query = lv.createQuery();
      query.geometry = geometry;
      return await lv.queryObjectIds(query);
    } else {
      return [];
    }
  }

  private async queryAccidentsBySlopeId(lv: FeatureLayerView) {
    if (this.slopeId) {
      const query = lv.createQuery();
      query.where = `Pistennummer LIKE '${this.slopeId}'`;
      return await lv.queryObjectIds(query);
    } else {
      return [];
    }
  }

  private async highlightAccidents() {
    const lv = await this.view.whenLayerView(accidents);
    
    const [ids1, ids2] = await Promise.all([
      this.queryAccidentsByGeometry(lv),
      this.queryAccidentsBySlopeId(lv)
    ]);

    const accidentIds = [...ids1, ...ids2];
    this.accidentIds = accidentIds;
    this.accidentHighlight = lv.highlight(accidentIds);
  }

  private updateFilter = promiseUtils.debounce(async (e: __esri.ViewPointerMoveEvent) =>   {
    if (this.view.popup.visible) {
      this.deselect();
      return;
    }
    const hitTest = await this.view.hitTest(e);
    const slopeHit = hitTest.results.find(result => result.layer === skiSlopesArea);

    if (slopeHit && slopeHit.type === "graphic") {
      const slope = slopeHit.graphic;

      const slopeId = this.parseSlopeId(slope);

      if (slopeId !== this.slopeId) {
        const lv = await this.view.whenLayerView(skiSlopesArea);

        const query = lv.createQuery();
        query.where = `IDENT LIKE '${slopeId}' OR IDENT LIKE '${slopeId}.%'`;
        const queryResult = await lv.queryFeatures(query);
        const slopes = queryResult.features;

        this.deselect();
        this.slopeId = slopeId;
        this.slopes = slopes;
        this.slopeHighlight = lv.highlight(slopes);
        this.highlightAccidents();
        console.log("HIGHTLIGHT", {slopeId});
      }
    } else {
      this.deselect();
    }
  })

  private deselect() {
    this.slopeId = undefined;
    this.slopes = null;
    this.accidentIds = null;
    this.slopeHighlight.remove();
    this.accidentHighlight.remove();
  }


}


export default class AccidentsChart {

  private accidentsHeat = new FeatureLayer({
    title: "Accidents (Heatmap)",
    portalItem: {
      id: "f13721858ab1466381da1045ed1b121a"
    },
    elevationInfo: {
      mode: "on-the-ground"
    },
    visible: false,
    renderer: heatmapRenderer,
    opacity: 0.7,
    popupEnabled: false
  });

  private filter: SlopeFilter;

  private chart: Chart;
  
  public dataLayers = new GroupLayer({
    title: "Winter Resort Data",
    visible: true,
    layers: [this.accidentsHeat, accidents]
  });
  
  constructor(public view: SceneView) {
    
    whenOnce(() => this.dataLayers.visible).then(() => this.addChart());

    this.filter = new SlopeFilter({view});
  }

  public addLayers() {
    this.view.map.add(this.dataLayers, 0);
  }

  public removeLayers() {
    this.view.map.remove(this.dataLayers);
  }

  private addChart() {

    const accidentsChart = document.createElement("canvas");
    accidentsChart.classList.add("accidents-chart");

    const timeSLiderDiv = document.createElement("div");
    const timeSlider = new TimeSlider({
      view: this.view,
      container: timeSLiderDiv,
      mode: "time-window",
      layout: "compact",
      stops: {
        interval: {
          value: 1,
          unit: "days"
        } as any
      },
      fullTimeExtent: {
        start: START,
        end: END
      },
      timeExtent: {
        start: START,
        end: END
      },
      labelFormatFunction: () => {},
    });

    const accidentsWidget = document.createElement("div");
    accidentsWidget.classList.add("accidents-widget");
    accidentsWidget.appendChild(accidentsChart);
    accidentsWidget.appendChild(timeSLiderDiv);

    const expand = new Expand({
      content: accidentsWidget,
      view: this.view,
      expanded: false,
      expandIconClass: "esri-icon-chart"
      // group: "environment"
    });

    watch(() => expand.expanded, (expanded) => {
      this.filter.enabled = expanded;
    });

    this.view.ui.add(
      expand,
      "bottom-right"
    );

    const updateChart = promiseUtils.debounce(() => this.updateChart(accidentsChart));

    updateChart();
    watch(() => this.filter.accidentIds, () => {
      updateChart();
    });
    watch(() => timeSlider.timeExtent, () => {
      updateChart();
    });
  }


  private async updateChart(accidentsChart: HTMLCanvasElement) {
    const field = "Alarmzeit";

    await accidents.load();
    const lv = await this.view.whenLayerView(accidents);
    const query = lv.createQuery();
    const accidentIds = this.filter.accidentIds;
    if (accidentIds && accidentIds.length) {
      query.objectIds = accidentIds;
    }
    query.outFields = ["*"];
    query.returnGeometry = false;
    const result = await lv.queryFeatures(query);

    const days = differenceInDays(END, START);
    
    const bins = [...Array(days).keys()].map(day =>
      HOURS.map(hour => ({
        x: addDays(START, day),
        y: hour.toString(),
        accidents: [] as Graphic[]
      })));

    let maxAccidents = 0;
    result.features.forEach(f => {
      const alarmTS = f.getAttribute(field);
      const alarm = new Date(alarmTS);
      const dayIdx = differenceInDays(alarmTS, START);
      if (dayIdx < 0 || days <= dayIdx) {
        console.log("OOB", {alarm, objID: f.getObjectId()});
        return;
      }

      const hourIdx = HOURS.findIndex((hour) => alarm.getHours() < hour);

      if (hourIdx < 0 || HOURS.length <= hourIdx) {
        debugger;
        throw new Error("Invalid hour " + hourIdx);
      }
      bins[dayIdx][hourIdx].accidents.push(f);
      maxAccidents = Math.max(maxAccidents, bins[dayIdx][hourIdx].accidents.length);
    });

    const data = bins.flat();

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(accidentsChart.getContext("2d"), {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Accidents 21/22',
          data,
          backgroundColor(c) {
            const value = data[c.dataIndex].accidents.length;
            const alpha = Math.min(1, Math.pow(value * 1.5 / maxAccidents, 1.2));
            const color = isWeekend(data[c.dataIndex].x) ?  new Color("blue") : new Color("green");
            color.a = alpha;
            return `rgba(${color.toRgba().join(",")})`;
          },
          borderColor(c) {
            const value = data[c.dataIndex].accidents.length;
            const alpha = Math.min(1, Math.pow(value * 1.5 / maxAccidents, 1.2));
            const color = isWeekend(data[c.dataIndex].x) ?  new Color("dark-blue") : new Color("dark-green");
            color.a = alpha;
            return `rgba(${color.toRgba().join(",")})`;
          },
          borderWidth: 1,
          hoverBackgroundColor: 'yellow',
          hoverBorderColor: 'yellowgreen',
          width(c) {
            const a = c.chart.chartArea || {right: 0, left: 0};
            
            return (a.right - a.left) / days - 1;
          },
          height(c) {
            const a = c.chart.chartArea || {bottom: 0, top: 0};
            return (a.bottom - a.top) / HOURS.length - 1;
          }
        }]
      },
      options: {
        aspectRatio: 8,
        animation: {
          duration: 0
        },
        plugins: {
          // legend: false,
          tooltip: {
            displayColors: false,
            callbacks: {
              title() {
                return '';
              },
              label(context) {
                const v = data[context.dataIndex];
                const iso = v.x.toString().substring(0, 10);
                return ['day: ' + iso, 'hours: ' + v.y, 'accidents: ' + v.accidents.length, 'max: ' + maxAccidents];
              }
            }
          },
        },
        scales: {
          y: {
            type: 'category',
            offset: true,
            labels: HOURS.map(h => h.toString()),
            // time: {
            //   unit: 'hour',
            //   round: 'hour',
            //   isoWeekday: 1,
            //   // parser: 'HH',
            //   displayFormats: {
            //     day: 'MMM dd iiiiii'
            //   }
            // },
            reverse: false,
            position: 'right',
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              padding: 1,
              font: {
                size: 9
              }
            },
            grid: {
              display: false,
              // drawBorder: false,
              tickLength: 0
            }
          },
          x: {
            type: 'time',
            position: 'bottom',
            offset: true,
            time: {
              unit: 'day',
              round: 'day',
              isoWeekday: 1,
              displayFormats: {
                week: 'MMM dd'
              }
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              font: {
                size: 9
              }
            },
            grid: {
              display: false,
              // drawBorder: false,
              tickLength: 0,
            }
          }
        },
        layout: {
          padding: {
            top: 10
          },
        }
      }
    });

    this.chart.resize(1000, 200);

    console.log("updated-chart");
  }


}

