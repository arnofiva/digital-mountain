import config from "@arcgis/core/config";
import { SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import request from "@arcgis/core/request";
import Query from "@arcgis/core/rest/support/Query";
import StreamLayerView from "@arcgis/core/views/layers/StreamLayerView";
import StreamLayerEvent from "./webSocketEvents";

const connections = new Map<string | URL, WebSocketMock>();

function delay(handler: TimerHandler, duration = 10) {
  setTimeout(handler, duration);
}

// e.g. https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer
const regex = /[https|wss]:\/\/((.*)\/([a-zA-Z0-9_]*)\/StreamServer)/;
function parseStreamUrl(streamUrl: string) {
  const urlParts = regex.exec(streamUrl);
  return {
    streamName: urlParts[3], // snowCat_StreamLayer4
    webSocketUrl: `wss://${urlParts[1]}` // wss://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer
  };
}

class WebSocketMock {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public onopen: () => void;
  public onmessage: (message: any) => void;

  public readyState = WebSocketMock.CONNECTING;

  constructor(private url: string) {
    const { webSocketUrl } = parseStreamUrl(url);

    delay(() => {
      this.readyState = WebSocketMock.OPEN;
      this.onopen();
    });

    connections.set(webSocketUrl, this);
  }

  send(data: any) {
    if (typeof data === "string") {
      const parsedData = JSON.parse(data);
      if (parsedData.filter) {
        delay(() => {
          this.onmessage({
            data
          });
        });
      }
    }
  }

  close() {
    this.readyState = WebSocketMock.CLOSED;
    connections.delete(this.url);
  }
}

//   wss://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer/subscribe?outSR=102100&token=MOCK_TOKEN
// https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer

class StreamServiceMock {
  private readonly _webSocketUrl: string;
  private _featureLayerSourceJSON: Promise<any>;
  private _events: StreamLayerEvent[] = [];
  private _startTime: number;

  constructor(_streamUrl: string, private _featureLayerUrl: string) {
    window.WebSocket = WebSocketMock as any;

    const { streamName, webSocketUrl } = parseStreamUrl(_streamUrl);

    this._webSocketUrl = webSocketUrl;

    config.request.interceptors.push({
      urls: [_streamUrl, _featureLayerUrl],

      before: async (params) => {
        const url = params.url;
        if (url === _streamUrl) {
          const sourceJSON = await this.loadFeatureLayerJSON(params.requestOptions);
          return {
            capabilities: "broadcast,subscribe",
            currentVersion: 11,
            description: null,
            displayField: "x",
            drawingInfo: sourceJSON.drawingInfo,
            fields: sourceJSON.fields.filter((f: any) => f.name !== "objectid"),
            geometryField: null,
            geometryType: sourceJSON.geometryType,
            globalIdField: "globalid",
            hasZ: sourceJSON.hasZ,
            keepLatest: {
              dataSourceLayerName: streamName,
              dataSourceName: streamName,
              datastoreUrl: "",
              flushInterval: 50,
              maxTransactionSize: 1000
            },
            keepLatestArchive: {
              featuresUrl: this._featureLayerUrl,
              maximumFeatureAge: 0,
              updateInterval: 30
            },
            objectIdField: null,
            portalProperties: {
              /* TODO */
            },
            spatialReference: SpatialReference.WebMercator.toJSON(),
            streamUrls: [
              {
                token: "MOCK_TOKEN",
                transport: "ws",
                urls: [webSocketUrl]
              }
            ],
            timeInfo: {
              trackIdField: "track_id"
            }
          };
        }
      }
    });
  }

  private loadFeatureLayerJSON(requestOptions: __esri.RequestOptions) {
    if (!this._featureLayerSourceJSON) {
      this._featureLayerSourceJSON = request(this._featureLayerUrl, requestOptions).then((response) => {
        return response.data;
      });
    }

    return this._featureLayerSourceJSON;
  }

  setEvents(events: StreamLayerEvent[]) {
    this.stop();
    this._events = events;
  }

  async start(layerView: StreamLayerView, resetMessages: StreamLayerEvent["message"][] = []) {
    if (!this._events || this._events.length === 0) {
      return;
    }

    const startTime = performance.now();
    this._startTime = startTime;

    const events = [...this._events];
    await this._reset(layerView, resetMessages);

    const loop = async () => {
      if (startTime !== this._startTime) {
        return;
      }

      let duration = 10;

      const connection = connections.get(this._webSocketUrl);

      if (connection && connection.onmessage) {
        const now = performance.now();
        const msSinceStart = now - startTime;
        while (events[0].msAfterStart < msSinceStart) {
          const nextEvent = events.shift();

          const track_id = nextEvent.message.attributes.track_id;

          const result = await layerView.queryFeatures(
            new Query({
              returnGeometry: true,
              outFields: ["*"],
              where: `track_id = ${track_id}`
            })
          );

          const attributes = (result.features.length && result.features[0].attributes) || {};
          const geometry = result.features.length && result.features[0].geometry;

          const message = {
            attributes: { ...attributes, ...nextEvent.message.attributes },
            geometry: nextEvent.message.geometry || geometry
          };

          connection.onmessage?.({
            data: JSON.stringify(message)
          });

          if (events.length === 0) {
            return;
          }
        }
        duration = events[0].msAfterStart - msSinceStart;
      }

      delay(loop, duration);
    };

    loop();
  }

  stop() {
    this._startTime = 0;
  }

  private async _reset(layerView: StreamLayerView, resetMessages: StreamLayerEvent["message"][]): Promise<void> {
    if (resetMessages.length === 0) {
      return;
    }

    const resetMessagesMap = new Map();
    for (const message of resetMessages) {
      resetMessagesMap.set(message.attributes.track_id, message);
    }

    const result = await layerView.queryFeatures(
      new Query({
        returnGeometry: true,
        outFields: ["*"],
        where: `track_id IN (${Array.from(resetMessagesMap.keys()).join(",")})`
      })
    );

    const connection = connections.get(this._webSocketUrl);
    for (const { attributes, geometry } of result.features) {
      const resetMessage = resetMessagesMap.get(attributes.track_id);
      const message = {
        attributes: { ...attributes, ...resetMessage.attributes },
        geometry: resetMessage.geometry || geometry
      };
      connection.onmessage?.({
        data: JSON.stringify(message)
      });
    }
  }
}

export default StreamServiceMock;
