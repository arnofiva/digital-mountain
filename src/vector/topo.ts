export const sources = {
  type: "vector",
  url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
  tiles: ["https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf"]
};

export const layers = [
  {
    "id": "Special area of interest/Rock or gravel",
    "type": "fill",
    "source": "esri",
    "source-layer": "Special area of interest",
    "filter": ["==", "_symbol", 16],
    // minzoom: 10,
    "layout": {},
    "paint": {
      "fill-opacity": 1,
      "fill-color": "#dcd7d6",
      "fill-antialias": true,
      "fill-translate": [0, 0],
      "fill-translate-anchor": "map"
    }
  },
  // Sand
  // {
  //   "id": "Special area of interest/Rock or gravel",
  //   "type": "fill",
  //   "source": "esri",
  //   "source-layer": "Special area of interest",
  //   "filter": ["==", "_symbol", 6],
  //   // minzoom: 10,
  //   "layout": {},
  //   "paint": {
  //     "fill-opacity": 1,
  //     "fill-color": "#eeeeee",
  //     "fill-antialias": true,
  //     "fill-translate": [0, 0],
  //     "fill-translate-anchor": "map"
  //   }
  // },
  // Forest
  {
    "id": "Openspace or forest",
    "type": "fill",
    "source": "esri",
    "source-layer": "Openspace or forest",
    "minzoom": 9,
    "layout": {},
    "paint": {
      "fill-color": "#a8bfb6",
      "fill-opacity": 1,
      "fill-antialias": false
    }
  },
  // Water
  {
    "id": "Water area/Lake, river or bay",
    "type": "fill",
    "source": "esri",
    "source-layer": "Water area",
    "filter": ["==", "_symbol", 7],
    "minzoom": 11,
    "layout": {},
    "paint": {
      "fill-color": "#a6bfdb",
      "fill-outline-color": "#a6bfdb"
    }
  }
];
