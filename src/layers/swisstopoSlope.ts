import WebTileLayer from "@arcgis/core/layers/WebTileLayer";


const swisstopoSlope = new WebTileLayer({
  title: "swisstopo Slope",
  urlTemplate: "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hangneigung-ueber_30/default/current/3857/{z}/{x}/{y}.png",
  visible: false
});

export default swisstopoSlope;