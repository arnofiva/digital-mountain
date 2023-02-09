import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import App from "./components/App";
import { webSceneId } from "./data";
import { Store } from "./stores";

const map = new WebScene({ portalItem: { id: webSceneId, portal: { url: "https://zurich.maps.arcgis.com/" } } });
const view = (window["view"] = new SceneView({ container: "view", map }));

const store = new Store({ view });
store.openTaskSelectionScreen({ animateCameraToStart: false });
new App({ container: document.getElementById("app"), store });
