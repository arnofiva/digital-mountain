import "@esri/calcite-components/dist/calcite/calcite.css";
import { setAssetPath } from "@esri/calcite-components/dist/components";

import Graphic from "@arcgis/core/Graphic";
import WebScene from "@arcgis/core/WebScene";
import "@arcgis/core/assets/esri/themes/light/main.css";
import esriConfig from "@arcgis/core/config";
import { Point } from "@arcgis/core/geometry";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { IconSymbol3DLayer, PointSymbol3D } from "@arcgis/core/symbols";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";
import SceneView from "@arcgis/core/views/SceneView";

import App from "./components/App";
import { taskSelectionViewDate } from "./constants";
import { portalUrl, webSceneId } from "./data";
import AppStore from "./stores/AppStore";
import { setViewUI } from "./utils";

setAssetPath(window.document.URL);
esriConfig.assetsPath = "./assets";

const oAuthInfo = new OAuthInfo({
  appId: "KojZjH6glligLidj",
  popup: true,
  popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
  portalUrl
});

IdentityManager.registerOAuthInfos([oAuthInfo]);

(window as any).setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};

const map = new WebScene({ portalItem: { id: webSceneId, portal: { url: portalUrl } } });
const view = new SceneView({
  container: "view",
  map,
  environment: {
    lighting: {
      type: "sun",
      date: taskSelectionViewDate,
      directShadowsEnabled: true
    },
    weather: { type: "cloudy", cloudCover: 0.2 }
  },
  padding: { top: 100 }, // include padding from application header
  qualityProfile: "high",
  ui: { components: ["attribution"] }
});
setViewUI(view.ui);

(window as any).view = view;

view.popup.defaultPopupTemplateEnabled = true;

const store = new AppStore({ view });
store.openTaskSelectionScreen({ animateCameraToStart: false });
new App({ container: document.getElementById("app"), store });

// example icon for ski patrol
const layer = new GraphicsLayer();
const graphic = new Graphic({
  geometry: new Point({ x: 1025876, y: 5915161, spatialReference: { wkid: 102100 } }),
  symbol: new PointSymbol3D({
    callout: new LineCallout3D({
      size: 0.5,
      color: [0, 0, 0]
    }),
    verticalOffset: {
      screenLength: 50,
      maxWorldLength: 200,
      minWorldLength: 5
    },
    symbolLayers: [
      new IconSymbol3DLayer({
        resource: { primitive: "circle" },
        material: { color: [230, 180, 180] },
        size: 40
      }),
      new IconSymbol3DLayer({
        resource: { href: "./icons/skiing-48.svg" },
        size: 30,
        anchor: "relative",
        anchorPosition: { x: 0.03, y: 0.03 }
      })
    ]
  })
});
layer.add(graphic);
