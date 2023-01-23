import Basemap from "@arcgis/core/Basemap";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import { contourSources } from "./vector/contours";
import { topoLayers, topoSources } from "./vector/topo";

const topoVTL = new VectorTileLayer({
  style: {
    version: 8,
    sprite:
      "https://cdn.arcgis.com/sharing/rest/content/items/7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/../sprites/sprite",
    glyphs:
      "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf",
    sources: {
      esri: topoSources,
      contours: contourSources
    },
    layers: [
      // Gravel
      ...topoLayers
      // Contours
      // ...contourLayers,
    ],
    metadata: {
      arcgisStyleUrl:
        "https://www.arcgis.com/sharing/rest/content/items/7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
      arcgisOriginalItemTitle: "World Topographic Map"
    }
  }
});

const vectorBasemap = new Basemap({
  title: "Winter (Vector)",
  baseLayers: [topoVTL]
  // referenceLayers: [vtl]
});

export default vectorBasemap;
