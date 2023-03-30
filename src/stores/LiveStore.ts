import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import Query from "@arcgis/core/rest/support/Query";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import { SpatialReference } from "@arcgis/core/geometry";

import { liveScreenStartCamera, snowCannonsCamera } from "../cameras";
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
import assetEvents from "../streamServiceMock/events/assetEvents";

import { startTimeEvening, startTimeMorning } from "../constants";
import SmoothSnowGroomer from "../layers/smoothSnowGrommer";
import {
  slopeEventsEvening,
  slopeEventsMorning,
  slopeResetMessagesEvening,
  slopeResetMessagesMorning
} from "../streamServiceMock/events/slopeEvents";
import staffEvents from "../streamServiceMock/events/staffEvents";
import StreamServiceMock from "../streamServiceMock/layers/streamServiceMock";
import { ignoreAbortErrors } from "../utils";
import ScreenStore from "./ScreenStore";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { slopeStreamLayerProperties } from "../layers/liveSlopes";
import { snowCannonLabelSymbol } from "../symbols";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { watch } from "@arcgis/core/core/reactiveUtils";

enum StartTime {
  Morning,
  Evening
}

const mockHandlesKey = "mock-data-received-key";

@subclass("digital-mountain.LiveStore")
class LiveStore extends ScreenStore {
  readonly type = ScreenType.Live;

  private readonly _view: SceneView;
  private readonly _slopeStream: StreamLayer;
  private readonly _assetsMock: StreamServiceMock;
  private readonly _slopeMock: StreamServiceMock;
  private readonly _staffMock: StreamServiceMock;

  private _goToAlertAbortController: AbortController | null = null;

  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;
    const { map } = view;

    const snowGroomerLayer = findSnowGroomerLayer(map);
    const slopesLayer = findSlopesLayer(map);
    const staffLayer = findStaffLayer(map);

    this.overrideLayerVisibilities(() => {
      findWaterPipesLayer(map).visible = false;
      findElectricalLayer(map).visible = false;
      findFiberOpticLayer(map).visible = false;
      findGalaaxyLOD2Layer(map).visible = true;

      // Features associated with these layers will be displayed by the stream layers instead
      snowGroomerLayer.visible = false;
      findSlopesGroupLayer(map).visible = false;
      staffLayer.visible = false;
    }, view);

    this.goToCamera(liveScreenStartCamera, view, false);

    const snowCannons = findSnowCannonsLayer(map);
    snowCannons.labelingInfo = [
      new LabelClass({
        labelExpressionInfo: {
          expression:
            "Replace($feature.Name_Nummer, 'Schacht', 'Hydrant') + TextFormatting.NewLine + FromCharCode(128313) + '150L/min'"
        },
        labelPlacement: "above-center",
        symbol: snowCannonLabelSymbol
      })
    ];
    this.addHandles([
      watch(
        () => this.snowCannonLabelsEnabled,
        (enabled) => {
          if (enabled) {
            this.goToCamera(snowCannonsCamera, view);
          }
          snowCannons.labelsVisible = enabled;
        },
        { initial: true }
      ),
      { remove: () => (snowCannons.labelsVisible = false) }
    ]);

    // the snow groomer will be displayed by a smoothed copy of the stream layer, so hide the original layer
    const assetsStream = createClientSideStreamLayer(snowGroomerLayer, { geometryType: "point", visible: false });
    this._assetsMock = new StreamServiceMock(assetsStream, snowGroomerLayer);

    this._slopeStream = createClientSideStreamLayer(slopesLayer, {
      geometryType: "polygon",
      ...slopeStreamLayerProperties()
    });
    this._slopeMock = new StreamServiceMock(this._slopeStream, slopesLayer);

    const staffStream = createClientSideStreamLayer(staffLayer, { geometryType: "point" });
    this._staffMock = new StreamServiceMock(staffStream, staffLayer);

    map.add(assetsStream);
    map.add(this._slopeStream);
    map.add(staffStream);

    assetsStream.load(this.createAbortController().signal).then(() => {
      const smoothSnowGroomer = new SmoothSnowGroomer(assetsStream, view);
      map.add(smoothSnowGroomer.smoothLayer);
      this.addHandles({
        remove: () => {
          map.remove(smoothSnowGroomer.smoothLayer);
          smoothSnowGroomer.destroy();
        }
      });
    });

    this.addHandles({
      remove: () => {
        this.removeHandles(mockHandlesKey);
        map.remove(assetsStream);
        map.remove(this._slopeStream);
        map.remove(staffStream);
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
  snowCannonLabelsEnabled = false;

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

    for (const mock of [this._assetsMock, this._slopeMock, this._staffMock]) {
      mock.stop();
    }
    this._alerts.removeAll();
    this.removeHandles(mockHandlesKey);

    const view = this._view;

    this._assetsMock.setEvents(assetEvents);
    this._assetsMock.start();

    this._staffMock.setEvents(staffEvents);
    this._staffMock.start();

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
        this._startTime === StartTime.Morning ? slopeResetMessagesMorning : slopeResetMessagesEvening
      );
    });
  }
}

function createClientSideStreamLayer(source: FeatureLayer, properties: Partial<StreamLayer>): StreamLayer {
  return new StreamLayer({
    labelingInfo: source.labelingInfo,
    labelsVisible: source.labelsVisible,
    fields: source.fields.slice(),
    timeInfo: { trackIdField: "track_id" },
    updateInterval: 10,
    spatialReference: SpatialReference.WebMercator,
    renderer: source.renderer,
    objectIdField: source.objectIdField,
    ...properties
  });
}

export default LiveStore;
