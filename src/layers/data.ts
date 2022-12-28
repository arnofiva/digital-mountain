import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import { Chart } from "chart.js/auto"; // https://www.chartjs.org/docs/latest/getting-started/integration.html
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

import differenceInDays from "date-fns/differenceInDays";

import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import { HeatmapRenderer, SimpleRenderer } from "@arcgis/core/renderers";
import { IconSymbol3DLayer, PointSymbol3D } from "@arcgis/core/symbols";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import 'chartjs-adapter-date-fns';
import { addDays, isWeekend } from "date-fns";

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
  
  private accidents = new FeatureLayer({
    title: "Accidents (Location)",
    portalItem: {
      id: "f13721858ab1466381da1045ed1b121a"
    },
    elevationInfo: {
      mode: "on-the-ground"
    },
    renderer: new SimpleRenderer({
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              primitive: "circle"
            },
            size: 6,
            material: {
              color: [120, 240, 30]
            },
            outline: {
              color: "black",
              size: 1
            }
          })
        ]
      })
    })
    // opacity: 0.7
  });
  
  public dataLayers = new GroupLayer({
    title: "Winter Resort Data",
    visible: true,
    layers: [this.accidentsHeat, this.accidents]
  });
  
  constructor(public view: SceneView) {
    
    whenOnce(() => this.dataLayers.visible).then(() => this.addChart());
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

    this.view.ui.add(
      new Expand({
        content: accidentsWidget,
        view: this.view,
        expanded: true,
        expandIconClass: "esri-icon-chart"
        // group: "environment"
      }),
      "bottom-right"
    );

    this.updateChart(accidentsChart);
  }

  private async updateChart(accidentsChart: HTMLCanvasElement) {
    const field = "Alarmzeit";

    await this.accidents.load();
    const query = this.accidents.createQuery();
    query.outFields = ["*"];
    query.returnGeometry = false;
    const result = await this.accidents.queryFeatures(query);

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

    const scatterchart = new Chart(accidentsChart.getContext("2d"), {
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

    scatterchart.resize(1000, 200);

    console.log("updated-chart");
  }


}

