import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import Query from "@arcgis/core/rest/support/Query";
import StreamLayerEvent from "./webSocketEvents";

// each new object id used for a client-side stream layer update must be unique
let nextObjectId = new Date().getTime();

class StreamServiceMock {
  private _events: StreamLayerEvent[] = [];
  private _initializePromise: Promise<void>;
  private _abortController = new AbortController();

  constructor(private _streamLayer: StreamLayer, private _featureLayer: FeatureLayer) {
    this._initializePromise = this._initializeFeatures();
  }

  setEvents(events: StreamLayerEvent[]) {
    this.stop();
    this._events = events;
  }

  async start(resetMessages: StreamLayerEvent["message"][] = []) {
    this._abortController.abort();
    const { signal } = (this._abortController = new AbortController());

    await this._initializePromise;

    if (signal.aborted || !this._events || this._events.length === 0) {
      return;
    }

    const events = [...this._events];
    await this._reset(resetMessages, signal);

    if (signal.aborted) {
      return;
    }

    const startTime = performance.now();
    const loop = async () => {
      const now = performance.now();
      const msSinceStart = now - startTime;
      while (events[0].msAfterStart < msSinceStart) {
        const nextEvent = events.shift();
        const track_id = nextEvent.message.attributes.track_id;

        const result = await this._featureLayer.queryFeatures(
          new Query({
            returnGeometry: true,
            outFields: ["*"],
            where: `track_id = ${track_id}`
          })
        );

        if (signal.aborted) {
          return;
        }

        const attributes = result.features[0]?.attributes ?? {};
        const geometry = result.features[0]?.geometry;

        const message = {
          attributes: { ...attributes, ...nextEvent.message.attributes },
          geometry: nextEvent.message.geometry || geometry
        };
        message.attributes[this._streamLayer.objectIdField] = nextObjectId++;

        this._streamLayer.sendMessageToClient({
          type: "features",
          features: [message]
        });

        if (events.length === 0) {
          return;
        }
      }
      const duration = events[0].msAfterStart - msSinceStart;
      setTimeout(loop, duration);
    };

    loop();
  }

  stop() {
    this._abortController.abort();
  }

  private async _initializeFeatures(): Promise<void> {
    const result = await this._featureLayer.queryFeatures(
      new Query({
        returnGeometry: true,
        outFields: ["*"],
        where: "1=1"
      })
    );
    this._streamLayer.sendMessageToClient({
      type: "features",
      features: result.features.map((f) => {
        const attributes = { ...f.attributes };
        attributes[this._streamLayer.objectIdField] = nextObjectId++;
        return { attributes, geometry: f.geometry };
      })
    });
  }

  private async _reset(resetMessages: StreamLayerEvent["message"][], signal: AbortSignal): Promise<void> {
    if (resetMessages.length === 0) {
      return;
    }

    const resetMessagesMap = new Map();
    for (const message of resetMessages) {
      resetMessagesMap.set(message.attributes.track_id, message);
    }

    const result = await this._featureLayer.queryFeatures(
      new Query({
        returnGeometry: true,
        outFields: ["*"],
        where: `track_id IN (${Array.from(resetMessagesMap.keys()).join(",")})`
      })
    );

    if (signal.aborted) {
      return;
    }

    for (const { attributes, geometry } of result.features) {
      const resetMessage = resetMessagesMap.get(attributes.track_id);
      const message = {
        attributes: { ...attributes, ...resetMessage.attributes },
        geometry: resetMessage.geometry || geometry
      };
      this._streamLayer.sendMessageToClient({
        type: "features",
        features: [message]
      });
    }
  }
}

export default StreamServiceMock;
