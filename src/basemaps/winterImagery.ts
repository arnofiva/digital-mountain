import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";

const winterImageryBasemap = new Basemap({
  title: "Winter (Imagery)",
  baseLayers: [
    new WebTileLayer({
      urlTemplate: "https://tiles.platform.fatmap.com/winter-imagery/{z}/{x}/{y}.jpg"
      //subDomains: ["a", "b", "c", "d"]
    })
  ]
});

export default winterImageryBasemap;
