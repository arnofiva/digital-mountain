import Color from "@arcgis/core/Color";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import { Chart } from "chart.js/auto"; // https://www.chartjs.org/docs/latest/getting-started/integration.html
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

import differenceInDays from "date-fns/differenceInDays";

import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import { HeatmapRenderer } from "@arcgis/core/renderers";
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

const accidents = new FeatureLayer({
  portalItem: {
    id: "f13721858ab1466381da1045ed1b121a"
  },
  elevationInfo: {
    mode: "on-the-ground"
  },
  visible: false,
  renderer: new HeatmapRenderer({
    colorStops,
    maxDensity: 0.0035,
    radius: 35,
    minDensity: 0,
    referenceScale: 20000
  }),
  opacity: 0.7
});

const dataLayers = new GroupLayer({
  title: "Winter Resort Data",
  layers: [accidents]
});

export const accidentsChart = document.createElement("canvas");
accidentsChart.classList.add("accidents-chart");

Chart.register(MatrixController, MatrixElement);


const drawChart = promiseUtils.debounce(async () => {
  
  const field = "Alarmzeit";

  await accidents.load();
  const query = accidents.createQuery();
  query.outFields = ["*"];
  query.returnGeometry = false;
  const result = await accidents.queryFeatures(query);


  const START = new Date(2021, 11, 1, 0, 0, 0, 0);
  const END = new Date(2022, 2, 10, 0, 0, 0, 0);

  const days = differenceInDays(END, START);
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 24];
  
  const bins = [...Array(days).keys()].map(day =>
    hours.map(hour => ({
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

    const hourIdx = hours.findIndex((hour) => alarm.getHours() < hour);

    if (hourIdx < 0 || hours.length <= hourIdx) {
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
        return (a.bottom - a.top) / hours.length - 1;
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
        labels: hours.map(h => h.toString()),
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
});

whenOnce(() => accidents.visible).then(() => {

  drawChart();

});

export default dataLayers;