import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import { convertPathToEvents, mergeEvents } from "./utils";

const lineTrackId0 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths: [
    [
      [1027346.9501443913, 5916224.255862014],
      [1027567.5299493477, 5916280.056826433],
      [1027783.0920996325, 5916316.222072321]
    ]
  ]
});

const lineTrackId1 = new Polyline({
  spatialReference: SpatialReference.WebMercator,
  paths: [
    [
      [1026009.8058628943, 5920667.152370067],
      [1025873.5004748334, 5920638.377053236],
      [1025782.5464213139, 5920518.475904019],
      [1025718.6841243431, 5920355.685148251],
      [1025712.4749260369, 5920318.2018302595],
      [1025829.58862274, 5920263.6518420605],
      [1025956.635863282, 5920191.491471202],
      [1026055.7033598219, 5920166.048383352]
    ]
  ]
});

const track0Events = convertPathToEvents(lineTrackId0, 3, 3.5, {track_id: 0});
const track1Events = convertPathToEvents(lineTrackId1, 1, 7, {track_id: 1});

const assetEvents = mergeEvents(track0Events, track1Events);

export default assetEvents;
