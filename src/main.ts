import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import App from "./components/App";
import Store from "./Store";

const view = (window["view"] = new SceneView({
  container: "view",
  map: new Map({
    basemap: "topo-vector",
    ground: "world-elevation"
  })
}));
const store = new Store({ view });
store.openTaskSelectionScreen({ animateCameraToStart: false });
new App({ container: document.getElementById("app"), store });
