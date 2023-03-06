import { Polyline } from "@arcgis/core/geometry";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import StreamLayerEvent from "../layers/webSocketEvents";

export const convertPathToEvents = (
  line: Polyline,
  updateRate: number,
  speed: number,
  attributes: any | { track_id: number }
) => {
  const spatialReference = line.spatialReference;
  const densifiedLine = geometryEngine.densify(line, updateRate * speed, "meters") as Polyline;

  const events = densifiedLine.paths[0].map((v, idx) => ({
    message: {
      attributes,
      geometry: {
        x: v[0],
        y: v[1],
        spatialReference
      }
    },
    msAfterStart: idx * updateRate * 1000 + 500 * Math.random()
  }));

  console.log("Events", events.length, { events });

  return events as StreamLayerEvent[];
};

export const mergeEvents = (...allEvents: StreamLayerEvent[][]) => {
  const concatenatedEvents = allEvents.flat();
  return concatenatedEvents.sort((a, b) => a.msAfterStart - b.msAfterStart);
};
