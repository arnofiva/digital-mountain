import Basemap from "@arcgis/core/Basemap";
import TileLayer from "@arcgis/core/layers/TileLayer";



const summerImageryBasemap = new Basemap({
  title: "Summer (Imagery)",
  baseLayers: [
    new TileLayer({
      portalItem: {
        id: "10df2279f9684e4a9f6a7f08febac2a9"
      }
    })
  ]
  // referenceLayers: [vtl]
});

export default summerImageryBasemap;