import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import Query from "@arcgis/core/rest/support/Query";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";

import { liveScreenStartCamera } from "../cameras";
import { clockIntervalMs } from "../constants";
import {
  findElectricalLayer,
  findFiberOpticLayer,
  findGalaaxyLOD2Layer,
  findSlopesGroupLayer,
  findSlopesLayer,
  findSnowCannonsLayer,
  findSnowGroomerLayer,
  findStaffLayer,
  findWaterPipesLayer
} from "../data";
import { AlertData, AlertType, ScreenType, SlopeStreamEvent } from "../interfaces";
import createSlopeStream from "../layers/liveSlopes";
import assetEvents from "../streamServiceMock/events/assetEvents";

import Camera from "@arcgis/core/Camera";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { LabelSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import { startTimeEvening, startTimeMorning } from "../constants";
import SmoothSnowGroomer from "../layers/smoothSnowGrommer";
import {
  slopeEventsEvening,
  slopeEventsMorning,
  slopeEventsOpening,
  slopeResetMessagesEvening,
  slopeResetMessagesMorning
} from "../streamServiceMock/events/slopeEvents";
import staffEvents from "../streamServiceMock/events/staffEvents";
import StreamServiceMock from "../streamServiceMock/layers/streamServiceMock";
import { ignoreAbortErrors } from "../utils";
import ScreenStore from "./ScreenStore";

enum StartTime {
  Morning,
  Evening
}

const mockHandlesKey = "mock-data-received-key";

@subclass("digital-mountain.LiveStore")
class LiveStore extends ScreenStore {
  readonly type = ScreenType.Live;

  private readonly _view: SceneView;
  private readonly _assetsStream: StreamLayer;
  private readonly _slopeStream: StreamLayer;
  private readonly _staffStream: StreamLayer;

  private readonly _assetsMock: StreamServiceMock;
  private readonly _slopeMock: StreamServiceMock;
  private readonly _staffMock: StreamServiceMock;

  @property()
  public codeSnippetVisible = false;

  private _goToAlertAbortController: AbortController | null = null;

  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;

    const slopesGroupLayer = findSlopesGroupLayer(view.map);
    const staffLayer = findStaffLayer(view.map);
    const snowGroomerLayer = findSnowGroomerLayer(view.map);

    this.overrideLayerVisibilities(() => {
      findWaterPipesLayer(view.map).visible = false;
      findElectricalLayer(view.map).visible = false;
      findFiberOpticLayer(view.map).visible = false;
      findGalaaxyLOD2Layer(view.map).visible = true;

      // Slopes will be displayed by the stream layer
      slopesGroupLayer.visible = false;
      staffLayer.visible = false;
    }, view);

    this.goToCamera(liveScreenStartCamera, view, false);

    this._assetsStream = new StreamLayer({
      url: "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowGroomers/StreamServer",
      renderer: snowGroomerLayer.renderer,
      opacity: 0
    });
    this._slopeStream = createSlopeStream();
    this._assetsMock = new StreamServiceMock(this._assetsStream.url, snowGroomerLayer);
    this._slopeMock = new StreamServiceMock(
      this._slopeStream.url,
      "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/Laax_Pisten_View/FeatureServer/6"
    );

    this._staffStream = new StreamLayer({
      url: "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/staff/StreamServer",
      labelingInfo: staffLayer.labelingInfo,
      labelsVisible: true
    });

    this._staffMock = new StreamServiceMock(this._staffStream.url, staffLayer);

    view.map.add(this._assetsStream);
    view.map.add(this._slopeStream);
    view.map.add(this._staffStream);

    this._assetsStream.load().then(() => {
      const smoothSnowGroomer = new SmoothSnowGroomer(this._assetsStream, view);
      view.map.add(smoothSnowGroomer.smoothLayer);

      this.addHandles({
        remove: () => {
          view.map.remove(smoothSnowGroomer.smoothLayer);
          smoothSnowGroomer.destroy();
        }
      });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") {
        view
          .goTo(
            new Camera({
              position: {
                longitude: 9.20478243,
                latitude: 46.8537139,
                z: 2984.49087
              },
              heading: 244.2,
              tilt: 66.24
            })
          )
          .then(async () => {
            const lv = await view.whenLayerView(this._slopeStream);
            this._slopeMock.setEvents(slopeEventsOpening);
            this._slopeMock.start(lv);
          });
      } else if (e.key === "2") {
        view.goTo(
          new Camera({
            position: {
              longitude: 9.25579187,
              latitude: 46.83355769,
              z: 2357.94722
            },
            heading: 288.79,
            tilt: 84.26
          })
        );
      } else if (e.key === "3") {
        view
          .goTo(
            new Camera({
              position: {
                longitude: 9.2281655,
                latitude: 46.84097062,
                z: 1881.33641
              },
              heading: 56.06,
              tilt: 67.89
            })
          )
          .then(() => {
            const snowCannons = findSnowCannonsLayer(view.map);

            snowCannons.labelingInfo = [
              new LabelClass({
                labelExpressionInfo: {
                  expression:
                    "Replace($feature.Name_Nummer, 'Schacht', 'Hydrant') + TextFormatting.NewLine + FromCharCode(128313) + '150L/min'"
                },
                labelPlacement: "above-center",
                symbol: new LabelSymbol3D({
                  symbolLayers: [
                    new TextSymbol3DLayer({
                      material: {
                        color: [250, 253, 255, 1]
                      },
                      halo: {
                        color: [0, 0, 0, 0.2],
                        size: 0
                      },
                      font: {
                        size: 9,
                        weight: "bolder",
                        family: '"Avenir Next","Helvetica Neue",Helvetica,Arial,sans-serif'
                      },
                      background: { color: [255, 255, 255, 0.2] }
                    })
                  ],
                  verticalOffset: {
                    screenLength: 20,
                    maxWorldLength: 200,
                    minWorldLength: 0
                  },
                  callout: {
                    type: "line",
                    size: 0.75,
                    color: [255, 255, 255, 0.5],
                    border: {
                      color: [0, 0, 0, 0]
                    }
                  }
                })
              })
            ];
            snowCannons.labelsVisible = true;
          });
      } else if (e.key === "4") {
        view.goTo(
          new Camera({
            position: {
              longitude: 9.23656129,
              latitude: 46.84158115,
              z: 1890.89974
            },
            heading: 264.72,
            tilt: 79.81
          })
        );
      } else if (e.key === "c") {
        this.codeSnippetVisible = !this.codeSnippetVisible;
      }
    };
    window.addEventListener("keydown", onKeyDown);

    this.addHandles({
      remove: () => {
        this.removeHandles(mockHandlesKey);
        view.map.remove(this._assetsStream);
        view.map.remove(this._slopeStream);
        view.map.remove(this._staffStream);
        this._assetsMock.stop();
        this._slopeMock.stop();
        this._staffMock.stop();
        window.removeEventListener("keydown", onKeyDown);
      }
    });

    const expand = new Expand({
      view,
      content: new LayerList({ view })
    });
    view.ui.add(expand, "bottom-left");
    this.addHandles({ remove: () => view.ui.remove(expand) });

    this._resetAlerts();
    this._resetTime();
  }

  /**
   * Data for alerts, sorted from newest to oldest.
   */
  @property()
  get alerts(): Collection<AlertData> {
    return this._alerts;
  }

  @property()
  private _alerts = new Collection<AlertData>([
    // { type: AlertType.Accident, date: new Date(), slopeId: 23 },
    // { type: AlertType.AccidentArrival, date: new Date(), slopeId: 23 },
    // { type: AlertType.Avalanche, date: new Date() },
    // { type: AlertType.SlopeOpen, date: new Date(), slopeId: 23 },
    // { type: AlertType.SlopeClose, date: new Date(), slopeId: 23 }
  ]);

  @property()
  get date(): Date {
    return new Date(this._utcDate);
  }

  @property()
  private _utcDate = startTimeMorning;

  @property()
  private _startTime = StartTime.Morning;

  async goToAlert(data: AlertData): Promise<void> {
    this._goToAlertAbortController?.abort();
    const { signal } = (this._goToAlertAbortController = this.createAbortController());
    const slopesLayer = findSlopesLayer(this._view.map);
    switch (data.type) {
      case AlertType.SlopeClose:
      case AlertType.SlopeOpen: {
        const [feature] = (
          await ignoreAbortErrors(
            slopesLayer.queryFeatures(
              new Query({
                returnGeometry: true,
                objectIds: [data.slopeId],
                outSpatialReference: this._view.spatialReference
              }),
              { signal }
            )
          )
        ).features;
        const extent = feature?.geometry?.extent;
        if (extent && !signal.aborted) {
          ignoreAbortErrors(this._view.goTo(extent, { signal }));
        }
      }
    }
  }

  toggleStartTime() {
    switch (this._startTime) {
      case StartTime.Morning: {
        this._startTime = StartTime.Evening;
        this._utcDate = startTimeEvening;
        break;
      }
      case StartTime.Evening: {
        this._startTime = StartTime.Morning;
        this._utcDate = startTimeMorning;
        break;
      }
    }
    this._resetAlerts();
    this._resetTime();
  }

  private _timeInterval: number | null = null;
  private _resetTime() {
    const startTime = performance.now();
    const initialDate = this._utcDate;
    if (this._timeInterval) {
      clearInterval(this._timeInterval);
    }
    const updateViewDate = (date: Date | null) => {
      const { lighting } = this._view.environment;
      if (lighting.type === "sun") {
        lighting.date = date;
      }
    };
    this._timeInterval = window.setInterval(() => {
      this._utcDate = initialDate + (performance.now() - startTime);
      updateViewDate(this.date);
    }, clockIntervalMs);
    this.addHandles({
      remove: () => {
        clearInterval(this._timeInterval);
      }
    });
  }

  private _mockAbortController: AbortController | null = null;
  private _resetAlerts() {
    this._mockAbortController?.abort();
    const { signal } = (this._mockAbortController = this.createAbortController());

    for (const mock of [this._assetsMock, this._slopeMock]) {
      mock.stop();
    }
    this._alerts.removeAll();
    this.removeHandles(mockHandlesKey);

    const view = this._view;
    view.whenLayerView(this._assetsStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      this._assetsMock.setEvents(assetEvents);
      this._assetsMock.start(lv);
    });
    view.whenLayerView(this._staffStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      this._staffMock.setEvents(staffEvents);
      this._staffMock.start(lv);
    });
    view.whenLayerView(this._slopeStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      this.addHandles(
        lv.on("data-received", (e: SlopeStreamEvent) => {
          if (e.attributes.showAlert) {
            const alertData = {
              type: e.attributes.STATUS.toLowerCase() === "offen" ? AlertType.SlopeOpen : AlertType.SlopeClose,
              date: new Date(this.date.getTime()),
              slopeId: e.attributes.track_id
            };
            this._alerts.add(alertData, 0);
          }
        }),
        mockHandlesKey
      );
      this._slopeMock.setEvents(this._startTime === StartTime.Morning ? slopeEventsMorning : slopeEventsEvening);
      this._slopeMock.start(
        lv,
        this._startTime === StartTime.Morning ? slopeResetMessagesMorning : slopeResetMessagesEvening
      );
    });
  }
}

export default LiveStore;
