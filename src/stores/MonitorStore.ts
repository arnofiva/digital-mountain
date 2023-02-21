import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Collection from "@arcgis/core/core/Collection";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import Query from "@arcgis/core/rest/support/Query";

import { monitorScreenStartCamera } from "../cameras";
import { AlertData, AlertType, ScreenType, SlopeStreamEvent } from "../interfaces";
import { findSlopesGroupLayer, findSlopesLayer } from "../data";
import createAssetsStream from "../layers/liveAssets";
import createSlopeStream from "../layers/liveSlopes";
import assetEvents from "../streamServiceMock/events/assetEvents";
import slopeEvents from "../streamServiceMock/events/slopeEvents";
import StreamServiceMock from "../streamServiceMock/layers/streamServiceMock";
import { ignoreAbortErrors } from "../utils";
import ScreenStore from "./ScreenStore";

@subclass("digital-mountain.MonitorStore")
class MonitorStore extends ScreenStore {
  readonly type = ScreenType.Monitor;

  private readonly _view: SceneView;
  private readonly _assetsStream: StreamLayer;
  private readonly _slopeStream: StreamLayer;
  private readonly _streamMock: StreamServiceMock;

  private _goToAlertAbortController: AbortController | null = null;

  constructor({ view }: { view: SceneView }) {
    super();
    this._view = view;

    this.goToTaskScreenStart(monitorScreenStartCamera, view);

    // Slopes will be displayed by the stream layer
    const slopesGroupLayer = findSlopesGroupLayer(view.map);
    slopesGroupLayer.visible = false;
    this.addHandles({ remove: () => (slopesGroupLayer.visible = true) });

    const { signal } = this.createAbortController();
    this._assetsStream = createAssetsStream();
    this._slopeStream = createSlopeStream();
    const assetsMock = new StreamServiceMock(
      this._assetsStream.url,
      "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowCat_StreamLayer4/FeatureServer/0"
    );
    const slopeMock = new StreamServiceMock(
      this._slopeStream.url,
      "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/Laax_Pisten/FeatureServer/6"
    );
    assetsMock.setEvents(assetEvents);
    slopeMock.setEvents(slopeEvents);
    view.map.add(this._assetsStream);
    view.map.add(this._slopeStream);
    view.whenLayerView(this._assetsStream).then((lv) => {
      if (signal.aborted) {
        return;
      }
      assetsMock.start(lv);
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
              date: new Date(),
              slopeId: e.attributes.track_id
            };
            this._alerts.add(alertData, 0);
          }
        })
      );
      slopeMock.start(lv);
    });
    this.addHandles({
      remove: () => {
        view.map.remove(this._assetsStream);
        view.map.remove(this._slopeStream);
        assetsMock.stop();
        slopeMock.stop();
      }
    });

    const expand = new Expand({
      view,
      content: new LayerList({ view })
    });
    view.ui.add(expand, "bottom-left");
    this.addHandles({ remove: () => view.ui.remove(expand) });
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
    // placeholder alerts
    { type: AlertType.Accident, date: new Date(), slopeId: 23 },
    { type: AlertType.AccidentArrival, date: new Date(), slopeId: 23 },
    { type: AlertType.Avalanche, date: new Date() },
    { type: AlertType.SlopeOpen, date: new Date(), slopeId: 23 },
    { type: AlertType.SlopeClose, date: new Date(), slopeId: 23 }
  ]);

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
}

export default MonitorStore;
