import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import Query from "@arcgis/core/rest/support/Query";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";

import { liveScreenStartCamera } from "../cameras";
import { clockIntervalMs } from "../constants";
import { findSlopesGroupLayer, findSlopesLayer } from "../data";
import { AlertData, AlertType, ScreenType, SlopeStreamEvent } from "../interfaces";
import createAssetsStream from "../layers/liveAssets";
import createSlopeStream from "../layers/liveSlopes";
import assetEvents from "../streamServiceMock/events/assetEvents";

import { startTimeEvening, startTimeMorning } from "../constants";
import { slopeEventsEvening, slopeEventsMorning, slopeResetMessages } from "../streamServiceMock/events/slopeEvents";
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

  private _goToAlertAbortController: AbortController | null = null;

  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;

    this.goToTaskScreenStart(liveScreenStartCamera, view);

    // Slopes will be displayed by the stream layer
    const slopesGroupLayer = findSlopesGroupLayer(view.map);
    slopesGroupLayer.visible = false;
    this.addHandles({ remove: () => (slopesGroupLayer.visible = true) });

    this._assetsStream = createAssetsStream();
    this._slopeStream = createSlopeStream();
    this._assetsMock = new StreamServiceMock(
      this._assetsStream.url,
      "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowCat_StreamLayer4/FeatureServer/0"
    );
    this._slopeMock = new StreamServiceMock(
      this._slopeStream.url,
      "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/Laax_Pisten/FeatureServer/6"
    );

    const staffLayer = view.map.findLayerById("186989de564-layer-81") as FeatureLayer;
    const staffStreamLayerUrl = "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/staff_StreamLayer4/StreamServer";
    this._staffStream = new StreamLayer({
      url: staffStreamLayerUrl
    });
    this._staffMock = new StreamServiceMock(
      staffStreamLayerUrl,
      staffLayer
    );

    view.map.add(this._assetsStream);
    view.map.add(this._slopeStream);
    view.map.add(this._staffStream);

    this.addHandles({
      remove: () => {
        this.removeHandles(mockHandlesKey);
        view.map.remove(this._assetsStream);
        view.map.remove(this._slopeStream);
        view.map.remove(this._staffStream);
        this._assetsMock.stop();
        this._slopeMock.stop();
        this._staffMock.stop();

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
        updateViewDate(null);
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
      this._slopeMock.start(lv, slopeResetMessages);
    });
  }
}

export default LiveStore;
