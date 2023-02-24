import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

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

const densLineTrackId0 = geometryEngine.densify(lineTrackId0, 10.5, "meters") as Polyline;

const track0Messages = densLineTrackId0.paths[0].map((v, idx) => ({
  message: {
    attributes: {
      track_id: 0,
      x: v[0],
      y: v[1]
    },
    geometry: {
      x: v[0],
      y: v[1],
      spatialReference: densLineTrackId0.spatialReference.toJSON()
    }
  },
  msAfterStart: idx * 3000
}));

const track1Dense = geometryEngine.densify(lineTrackId1, 7, "meters") as Polyline;
const track1Messages = track1Dense.paths[0].map((v, idx) => ({
  message: {
    attributes: {
      track_id: 1,
      x: v[0],
      y: v[1]
    },
    geometry: {
      x: v[0],
      y: v[1],
      spatialReference: densLineTrackId0.spatialReference.toJSON()
    }
  },
  msAfterStart: idx * 1000
}));

const assetEvents = [...track0Messages, ...track1Messages].sort((a, b) => a.msAfterStart - b.msAfterStart);

export default assetEvents;
