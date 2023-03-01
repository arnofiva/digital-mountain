import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import { convertPathToEvents, mergeEvents } from "./utils";

const track1 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths: [
    [
      [1022192.3230596791, 5917095.585874769],
      [1022287.2233732756, 5917225.15689032],
      [1022337.4713546905, 5917330.762285813],
      [1022363.7128115904, 5917416.7341999225],
      [1022445.763113827, 5917456.069524946],
      [1022520.866985108, 5917444.164267427],
      [1022622.2794450126, 5917505.991623]
    ]
  ]
});

const track1Events = convertPathToEvents(track1, 1, 7, {track_id: 1});

const staffEvents = mergeEvents(track1Events);

export default staffEvents;