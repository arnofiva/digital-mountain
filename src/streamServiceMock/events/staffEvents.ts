import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import { convertPathToEvents, mergeEvents } from "./utils";

const track1 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths: [
    [
      [1022327.6184410999,5917311.093086836],
      [1022372.9224418537,5917427.679703503],
      [1022456.0064294757,5917431.883332761],
      [1022532.0885934599,5917471.965354327],
      [1022622.2794450126,5917505.991623]
    ]
  ]
});

const track2 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths:[
    [
      [1026036.1163403563,5914670.900222809],
      [1025994.7341607229,5914511.875725723],
      [1026104.6140354769,5914326.958193153],
      [1026047.7838146292,5914213.139797104]
    ]
  ]
});

const track4 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths:[
    [
      [1026397.8850810226,5918125.5483466415],
      [1026361.6534352645,5917964.696815144],
      [1026286.0631980042,5917837.151606967]
    ]
  ]
});

const track1Events = convertPathToEvents(track1, 1, 7, { track_id: 1, name: "Vorab 001" });
const track2Events = convertPathToEvents(track2, 1, 7, { track_id: 2, name: "Vorab 002" });
const track4Events = convertPathToEvents(track4, 1, 12, { track_id: 4, name: "Vorab 008" });

const staffEvents = mergeEvents(track1Events, track2Events, track4Events);

export default staffEvents;
