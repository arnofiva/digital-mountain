import Accessor from "@arcgis/core/core/Accessor";
import { when } from "@arcgis/core/core/reactiveUtils";
import { Point, SpatialReference } from "@arcgis/core/geometry";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import SceneView from "@arcgis/core/views/SceneView";
import { headingBetweenPoints, pointLerp, tiltBetweenPoints } from "./utils/smoothUtils";

type Snapshot = {
  start: Point;
  startTime: number;
  finish: Point;
  finishTime: number;
  tilt: number;
};

class SmoothSnowGroomer extends Accessor {
  private readonly snapshots = new Map<number, Snapshot>();
  private objectIdCounter = 0;
  private elevationSampler;

  public readonly smoothLayer: StreamLayer;

  constructor(public readonly source: StreamLayer, public readonly view: SceneView) {
    super();

    if (!source.loaded) {
      throw new Error("Source layer must be loaded");
    }

    this.elevationSampler = view.groundView.elevationSampler;

    this.smoothLayer = new StreamLayer({
      spatialReference: SpatialReference.WebMercator,
      title: "Smooth Snow Groomer",
      elevationInfo: {
        mode: "on-the-ground"
      },
      objectIdField: source.objectIdField,
      fields: source.fields,
      timeInfo: source.timeInfo,
      updateInterval: 20,
      geometryType: "point",
      renderer: source.renderer
    });

    view.whenLayerView(source).then(async (lv) => {
      this.addHandles(
        lv.on("data-received", (e) => {
          this.updateFeature(e);
        })
      );

      const loop = () => {
        if (view.destroyed) {
          return;
        }

        this.interpolateFeatures();
        setTimeout(loop, 50);
      };

      loop();
    });

    when(
      () => source.destroyed,
      () => this.destroy
    );
  }

  private updateFeature(feature: __esri.StreamLayerViewDataReceivedEvent) {
    const now = performance.now();
    const { x, y } = feature.geometry;
    const point = new Point({ x, y, spatialReference: this.source.spatialReference });
    const trackIdField = this.source.timeInfo.trackIdField;
    const trackId = feature.attributes[trackIdField];

    if (this.snapshots.has(trackId)) {
      const snapshot = this.snapshots.get(trackId);
      snapshot.start = snapshot.finish;
      snapshot.startTime = snapshot.finishTime;
      snapshot.finish = point;
      snapshot.finishTime = now;

      const pointA = this.elevationSampler.queryElevation(snapshot.start) as Point;
      const pointB = this.elevationSampler.queryElevation(snapshot.finish) as Point;
      const tilt = tiltBetweenPoints(pointA, pointB);
      snapshot.tilt = tilt;
    } else {
      this.snapshots.set(trackId, {
        start: point,
        startTime: now,
        finish: point,
        finishTime: now,
        tilt: 0
      });
    }
  }

  private interpolateFeatures = () => {
    const now = performance.now();

    const trackIdField = this.source.timeInfo.trackIdField;

    const features = Array.from(this.snapshots).map(([trackId, snapshot]) => {
      const duration = snapshot.finishTime - snapshot.startTime;
      const t = Math.min(1, (now - snapshot.finishTime) / duration);

      const position = pointLerp(snapshot.start, snapshot.finish, t);
      const heading = headingBetweenPoints(snapshot.start, snapshot.finish);

      const OBJECTID = this.objectIdCounter++;

      const attributes = {
        OBJECTID,
        heading,
        tilt: snapshot.tilt
      };
      attributes[trackIdField] = trackId;

      return {
        attributes,
        geometry: {
          x: position.x,
          y: position.y
        }
      };
    });

    this.smoothLayer.sendMessageToClient({
      type: "features",
      features
    });
  };
}

export default SmoothSnowGroomer;
