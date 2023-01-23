import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";

const osmURL = "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer";

const osmSprite =
  "https://cdn.arcgis.com/sharing/rest/content/items/3e1a00aeae81496587988075fe529f71/resources/sprites/sprite";

const osmStyle = {
  sprite: osmSprite,
  layers: [
    // {
    //   id: "landcover/forest",
    //   type: "fill",
    //   source: "esri",
    //   "source-layer": "landcover",
    //   filter: ["==", "_symbol", 51],
    //   minzoom: 9,
    //   layout: {},
    //   paint: {
    //     "fill-opacity": 0.7,
    //     "fill-antialias": false,
    //     "fill-color": "#5C683D"
    //   }
    // },

    // {
    //   id: "water area/water",
    //   type: "fill",
    //   source: "esri",
    //   "source-layer": "water area",
    //   filter: ["!=", "_symbol", 0],
    //   minzoom: 0,
    //   layout: {},
    //   paint: {
    //     "fill-antialias": false,
    //     "fill-color": "#BFD9F2"
    //   }
    // },

    {
      "id": "tracks/line",
      "type": "line",
      "source": "esri",
      "source-layer": "track",
      // filter: ["==", "_symbol", 3],
      // minzoom: 13,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "rgba(0, 0, 0, 0.3)",
        "line-width": 2
        // "line-dasharray": [6.0, 3.0]
      }
    },

    {
      "id": "path/footway (unpaved)/line",
      "type": "line",
      "source": "esri",
      "source-layer": "path",
      // "filter": [
      //   "==",
      //   "_symbol",
      //   4
      // ],
      // "minzoom": 13,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "rgba(0, 0, 0, 0.3)",
        "line-width": 2,
        "line-dasharray": [2, 4]
      }
    },
    {
      "id": "road/tertiary/casing",
      "type": "line",
      "source": "esri",
      "source-layer": "road",
      // "filter": [
      //   "==",
      //   "_symbol",
      //   4
      // ],
      "minzoom": 11,
      "layout": {
        "line-join": "round"
      },
      "paint": {
        "line-color": "#8F8F8F",
        "line-width": {
          base: 1.2,
          stops: [
            [11, 2.5],
            [12, 4],
            [13, 5],
            [14, 9],
            [15, 10],
            [16, 18],
            [17, 21],
            [18, 27]
          ]
        }
      }
    },
    {
      "id": "road/tertiary/line",
      "type": "line",
      "source": "esri",
      "source-layer": "road",
      // "filter": [
      //   "==",
      //   "_symbol",
      //   4
      // ],
      "minzoom": 9,
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": {
          stops: [
            [10.5, "#bbbbbb"],
            [10.6, "#ffffff"]
          ]
        },
        "line-width": {
          base: 1.2,
          stops: [
            [9, 0.7],
            [10, 0.7],
            [11, 1.9],
            [12, 3],
            [13, 3.9],
            [14, 7.8],
            [15, 8.8],
            [16, 16.4],
            [17, 19.4],
            [18, 25.4]
          ]
        }
      }
    }

    // line("road", 2, "#FFFF00", true),
    // line("road", 2, "#FFFFFF"),
    // line("road (bridge)", 2, "#FFFF00", true),
    // line("road (bridge)", 2, "#FFFFFF"),

    // line("railway", 2, "#FF0000", true),
    // line("railway", 2, "#FFFFFF"),
    // line("railway (bridge)", 2, "#FF0000", true),
    // line("railway (bridge)", 2, "#FFFFFF"),
    //line("aerialway", 2, "#FF0000", false),

    // line("road", 2, "#FFFF00", true),
    // line("road", 2, "#FFFFFF"),
    // line("road/primary/line", "#FFFFFF", 1, false)
    // {
    //   id: "road/primary/casing",
    //   type: "line",
    //   source: "esri",
    //   "source-layer": "road",
    //   filter: ["==", "_symbol", 2],
    //   minzoom: 0,
    //   layout: {
    //     visibility: "visible",
    //     "line-miter-limit": 2,
    //     "line-round-limit": 1.05,
    //     "line-cap": "butt",
    //     "line-join": "round"
    //   },
    //   paint: {
    //     "line-opacity": 1,
    //     "line-color": "#FFFF00",
    //     "line-width": stop(1.2, 11, 18),
    //     "line-gap-width": 0,
    //     "line-blur": stop(2.4, 11, 18),
    //     "line-translate-anchor": "map",
    //     "line-offset": 0,
    //     "line-translate": [0, 0]
    //   }
    // }
    // {
    //   id: "road/primary/line",
    //   type: "line",
    //   source: "esri",
    //   "source-layer": "road",
    //   filter: ["==", "_symbol", 2],
    //   minzoom: 0,
    //   layout: {
    //     visibility: "visible",
    //     "line-miter-limit": 2,
    //     "line-round-limit": 1.05,
    //     "line-cap": "round",
    //     "line-join": "round"
    //   },
    //   paint: {
    //     "line-opacity": 1,
    //     "line-color": "#FFFFFF",
    //     "line-width": stop(0.2, 11, 18),
    //     "line-gap-width": 0,
    //     "line-blur": 0,
    //     "line-translate-anchor": "map",
    //     "line-offset": 0,
    //     "line-translate": [0, 0]
    //   }
    // }

    // {
    //   id: "landcover/residential/fill",
    //   type: "fill",
    //   source: "esri",
    //   "source-layer": "landcover",
    //   filter: ["==", "_symbol", 26],
    //   minzoom: 7,
    //   layout: {},
    //   paint: {
    //     "fill-antialias": false,
    //     "fill-opacity": 0.5,
    //     "fill-color": {
    //       stops: [
    //         [7, "#FFFF00"],
    //         [11, "#FFFF00"],
    //         [12, "#FFFF00"]
    //       ]
    //     }
    //   }
    // },
    // {
    //   id: "OSM building/fill",
    //   type: "fill",
    //   source: "esri",
    //   "source-layer": "OSM building",
    //   // minzoom: 14,
    //   layout: {},
    //   paint: {
    //     "fill-color": "#FFFF00",
    //     "fill-opacity": 0.8
    //   }
    // }
  ],
  sources: {
    esri: {
      url: osmURL,
      type: "vector"
    }
  }
};

const osmFeatures = new VectorTileLayer({
  title: "OSM Features",
  style: osmStyle
  // url: styleUrl
});

export default osmFeatures;
