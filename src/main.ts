import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import App from "./components/App";

const container = document.createElement("div");
document.getElementById("app").appendChild(container);
new App({ container });
