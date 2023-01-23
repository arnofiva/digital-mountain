// const swisstopoUrl =
//   "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";

import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";

const swisstopoUrl =
  "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-karte-farbe/default/current/3857/{z}/{x}/{y}.png";

const swisstopoBasemap = new Basemap({
  title: "swisstopo",
  baseLayers: [
    new WebTileLayer({
      title: "swisstopo",
      urlTemplate: swisstopoUrl
    })
  ]
});

export default swisstopoBasemap;
