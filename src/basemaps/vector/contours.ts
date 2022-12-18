export const contourSources = {
  type: "vector",
  url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer",
  tiles: ["https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf"]
};

export const contourLayers = [
  {
    "id": "Contour_11_main/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index3", 1], ["==", "Index5", 1]],
    "minzoom": 11,
    "maxzoom": 12,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.4,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 1],
          [19, 2.5]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Contour_11/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index3", 1], ["==", "Index5", 0]],
    "minzoom": 11,
    "maxzoom": 12,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.35,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 0.7],
          [19, 1.3]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Depression_11",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index3", 1], ["in", "Index5", 1, 0], ["==", "DEPRESSION", 1]],
    "minzoom": 11,
    "maxzoom": 12,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": {
        stops: [
          [11, 4],
          [12, 8],
          [13, 16],
          [16, 20]
        ]
      },
      "icon-image": "Depression/0",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-size": {
        stops: [
          [11, 0.5],
          [16, 1]
        ]
      }
    },
    "paint": {}
  },
  {
    "id": "Contour_12_main/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index2", 1], ["==", "Index4", 1]],
    "minzoom": 12,
    "maxzoom": 14,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 1],
          [19, 2.5]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Contour_12/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index2", 1], ["==", "Index4", 0]],
    "minzoom": 12,
    "maxzoom": 14,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 0.7],
          [19, 1.3]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Depression_12",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index2", 1], ["in", "Index4", 1, 0], ["==", "DEPRESSION", 1]],
    "minzoom": 12,
    "maxzoom": 14,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": {
        stops: [
          [11, 4],
          [12, 8],
          [13, 16],
          [16, 20]
        ]
      },
      "icon-image": "Depression/0",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-size": {
        stops: [
          [11, 0.5],
          [16, 1]
        ]
      }
    },
    "paint": {}
  },
  {
    "id": "Contour_13_main/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index1", 1], ["==", "Index3", 1]],
    "minzoom": 14,
    "maxzoom": 16,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 1],
          [19, 2.5]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Contour_13/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index1", 1], ["==", "Index3", 0]],
    "minzoom": 14,
    "maxzoom": 16,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 0.7],
          [19, 1.3]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Depression_13",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index1", 1], ["in", "Index3", 1, 0], ["==", "DEPRESSION", 1]],
    "minzoom": 14,
    "maxzoom": 16,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": {
        stops: [
          [11, 4],
          [12, 8],
          [13, 16],
          [16, 20]
        ]
      },
      "icon-image": "Depression/0",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-size": {
        stops: [
          [11, 0.5],
          [16, 1]
        ]
      }
    },
    "paint": {}
  },
  {
    "id": "Contour_14_main/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["==", "Index2", 1],
    "minzoom": 16,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 1],
          [19, 2.5]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Contour_14/0",
    "type": "line",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["==", "Index2", 0],
    "minzoom": 16,
    "paint": {
      "line-color": "#768265",
      "line-opacity": 0.33,
      "line-width": {
        base: 1.2,
        stops: [
          [11, 0.7],
          [19, 1.3]
        ]
      }
    },
    "layout": {}
  },
  {
    "id": "Depression_14",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["in", "Index2", 1, 0], ["==", "DEPRESSION", 1]],
    "minzoom": 16,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": {
        stops: [
          [11, 4],
          [12, 8],
          [13, 16],
          [16, 20]
        ]
      },
      "icon-image": "Depression/0",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-size": {
        stops: [
          [11, 0.5],
          [16, 1]
        ]
      }
    },
    "paint": {}
  },

  // Labels
  {
    "id": "Contour_11_main_text",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index3", 1], ["==", "Index5", 1]],
    "minzoom": 11,
    "maxzoom": 12,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 700,
      "text-letter-spacing": 0.1,
      "text-font": ["Avenir Next LT Pro Demi Italic", "Arial Unicode MS Regular"],
      "text-field": "{Contour} {Unit}",
      "text-size": {
        stops: [
          [11, 9.5],
          [16, 10.5]
        ]
      }
    },
    "paint": {
      "text-color": "#6A735E",
      "text-halo-color": "rgba(255, 255, 255, 0.75)",
      "text-halo-width": 0.5,
      "text-halo-blur": 1
    }
  },
  {
    "id": "Contour_12_main_text",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index2", 1], ["==", "Index4", 1]],
    "minzoom": 12,
    "maxzoom": 14,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 700,
      "text-letter-spacing": 0.1,
      "text-font": ["Avenir Next LT Pro Demi Italic", "Arial Unicode MS Regular"],
      "text-field": "{Contour} {Unit}",
      "text-size": {
        stops: [
          [11, 9.5],
          [16, 10.5]
        ]
      }
    },
    "paint": {
      "text-color": "#6A735E",
      "text-halo-color": "rgba(255, 255, 255, 0.75)",
      "text-halo-width": 0.5,
      "text-halo-blur": 1
    }
  },
  {
    "id": "Contour_13_main_text",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["all", ["==", "Index1", 1], ["==", "Index3", 1]],
    "minzoom": 14,
    "maxzoom": 16,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 700,
      "text-letter-spacing": 0.1,
      "text-font": ["Avenir Next LT Pro Demi Italic", "Arial Unicode MS Regular"],
      "text-field": "{Contour} {Unit}",
      "text-size": {
        stops: [
          [11, 9.5],
          [16, 10.5]
        ]
      }
    },
    "paint": {
      "text-color": "#6A735E",
      "text-halo-color": "rgba(255, 255, 255, 0.75)",
      "text-halo-width": 0.5,
      "text-halo-blur": 1
    }
  },
  {
    "id": "Contour_14_main_text",
    "type": "symbol",
    "source": "contours",
    "source-layer": "Contour",
    "filter": ["==", "Index2", 1],
    "minzoom": 16,
    "layout": {
      "symbol-placement": "line",
      "symbol-spacing": 700,
      "text-letter-spacing": 0.1,
      "text-font": ["Avenir Next LT Pro Demi Italic", "Arial Unicode MS Regular"],
      "text-field": "{Contour} {Unit}",
      "text-size": {
        stops: [
          [11, 9.5],
          [16, 10.5]
        ]
      }
    },
    "paint": {
      "text-color": "#6A735E",
      "text-halo-color": "rgba(255, 255, 255, 0.75)",
      "text-halo-width": 0.5,
      "text-halo-blur": 1
    }
  }
];
