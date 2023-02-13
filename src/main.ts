import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import App from "./components/App";
import { portalUrl, webSceneId } from "./data";
import { Store } from "./stores";

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
const view = (window["view"] = new SceneView({ container: "view", map }));

const store = new Store({ view });
store.openTaskSelectionScreen({ animateCameraToStart: false });
new App({ container: document.getElementById("app"), store });
