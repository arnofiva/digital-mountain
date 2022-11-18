import SceneView from "@arcgis/core/views/SceneView";

import Basemap from "@arcgis/core/Basemap";
import Color from "@arcgis/core/Color";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Map from "@arcgis/core/Map";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import MeshSymbol3D from "@arcgis/core/symbols/MeshSymbol3D";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Daylight from "@arcgis/core/widgets/Daylight";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";

import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import esriConfig from "@arcgis/core/config";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import {
  LineSymbol3D,
  LineSymbol3DLayer,
  ObjectSymbol3DLayer,
  PathSymbol3DLayer,
  PointSymbol3D,
  WebStyleSymbol
} from "@arcgis/core/symbols";
import LineStylePattern3D from "@arcgis/core/symbols/patterns/LineStylePattern3D";
import Home from "@arcgis/core/widgets/Home";
import Weather from "@arcgis/core/widgets/Weather";
import { sources as contourSources } from "./vector/contours";
import { layers as topoLayers, sources as topoSources } from "./vector/topo";
import { connect as connectLiftEditor } from "./liftEditor";
import { connect as connectSlopeEditor } from "./slopeEditor";
import { AppState } from "./appState";

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

// const params = new URLSearchParams(document.location.search.slice(1));
// const someParam = params.has("someParam");

// IdentityManager.registerOAuthInfos([
//   new OAuthInfo({
//     appId: "",
//     popup: true,
//     popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
//   }),
// ]);

// (window as any).setOAuthResponseHash = (responseHash: string) => {
//   IdentityManager.setOAuthResponseHash(responseHash);
// };

esriConfig.apiKey =
  "AAPK4021da52134346b7bb16aaaef2e378e7jSoa-zYBTpm8627wfHulkfMJMm9QwSGgQdAvuFSATu9YLReA58rrEhtnRpf8zXKm";

const skiLifts = new FeatureLayer({
  portalItem: {
    id: "dac535c60f214447af467393838ce36b"
  },
  title: "Ski Lifts",
  elevationInfo: {
    mode: "absolute-height"
  },
  renderer: new SimpleRenderer({
    symbol: new LineSymbol3D({
      symbolLayers: [
        new PathSymbol3DLayer({
          profile: "quad", // creates a rectangular shape
          width: 15, // path width in meters
          height: 0.1, // path height in meters
          material: { color: [0, 0, 0, 0.4] },
          cap: "square",
          profileRotation: "heading"
        })
      ]
    })
  })
});

const skiLiftPoles = new SceneLayer({
  portalItem: {
    id: "2e2d5046dff7498b9103c3be9760f1b0"
  },
  title: "Ski Lift Poles",
  elevationInfo: {
    mode: "absolute-height"
  },

  renderer: new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          width: 1.5, // diameter of the object from east to west in meters
          height: 15, // height of the object in meters
          depth: 1.5, // diameter of the object from north to south in meters
          roll: 90,
          heading: 90,
          anchor: "center",
          resource: { primitive: "cylinder" },
          material: { color: "black" }
        }),
        new ObjectSymbol3DLayer({
          width: 3, // diameter of the object from east to west in meters
          height: 100, // height of the object in meters
          depth: 3, // diameter of the object from north to south in meters
          roll: 180,
          resource: { primitive: "cylinder" },
          material: { color: "black" }
        })
      ]
    })
  })
});

const skiSlopes = new FeatureLayer({
  portalItem: {
    id: "d6ae4391937d4f61975ea97d91960284"
  },
  //visible: false,
  title: "Ski Slopes",
  elevationInfo: {
    mode: "on-the-ground"
  },
  renderer: new UniqueValueRenderer({
    field: "piste_diff",
    defaultLabel: "Other",
    uniqueValueInfos: [
      {
        label: "novice",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [0, 122, 194, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),
            new LineSymbol3DLayer({
              material: {
                color: [0, 122, 194, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5,
              pattern: new LineStylePattern3D({
                style: "dash"
              })
            })
          ]
        }),
        value: "novice"
      },
      {
        label: "easy",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [0, 122, 194, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),
            new LineSymbol3DLayer({
              material: {
                color: [0, 122, 194, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5
            })
          ]
        }),
        value: "easy"
      },
      {
        label: "intermediate",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [217, 0, 18, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),

            new LineSymbol3DLayer({
              material: {
                color: [217, 0, 18, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5
            })
          ]
        }),
        value: "intermediate"
      },
      {
        label: "advanced",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),

            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5
            })
          ]
        }),
        value: "advanced"
      },
      {
        label: "expert",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),

            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5
            })
          ]
        }),
        value: "expert"
      },
      {
        label: "extreme",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),

            new LineSymbol3DLayer({
              material: {
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5,
              pattern: new LineStylePattern3D({
                style: "dash"
              })
            })
          ]
        }),
        value: "extreme"
      },
      {
        label: "freeride",
        symbol: new LineSymbol3D({
          symbolLayers: [
            new LineSymbol3DLayer({
              material: {
                color: [22, 130, 18, 0.1]
              },
              join: "bevel",
              cap: "round",
              size: 5
            }),

            new LineSymbol3DLayer({
              material: {
                color: [22, 130, 18, 1]
              },
              join: "bevel",
              cap: "round",
              size: 0.5
            })
          ]
        }),
        value: "freeride"
      }
    ]
  })
});

const buildings = new SceneLayer({
  portalItem: {
    id: "a714a2ca145446b79d97aaa7b895ff95"
  },
  renderer: new SimpleRenderer({
    symbol: new MeshSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: [80, 80, 80],
            colorMixMode: "replace"
          }
        })
      ]
    })
  })
});

const treesVariableHeight = new SceneLayer({
  portalItem: {
    id: "8d8d3e94f3d7430bb112b32b4d3c0130"
  },
  renderer: new SimpleRenderer({
    symbol: new WebStyleSymbol({
      name: "Laurus",
      styleName: "EsriRealisticTreesStyle"
    }),
    visualVariables: [
      new SizeVariable({
        axis: "height",
        field: "Height"
      })
    ]
  }),
  title: "3D Trees Variable Height"
});

const trees = new SceneLayer({
  portalItem: {
    id: "e6811797f4c74c77bf34ab1e15f24631"
  },
  visible: false,
  renderer: new SimpleRenderer({
    symbol: new WebStyleSymbol({
      name: "Larix",
      styleName: "EsriRealisticTreesStyle"
    })
  }),
  title: "3D Trees"
});

const rocks = new VectorTileLayer({
  portalItem: {
    id: "f13423a1ff78401c96ac3aeed819bb6e"
  },
  style: {
    version: 10.81,
    sources: {
      esri: {
        type: "vector",
        url: "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/VTL__3857__Grison_Rocks/VectorTileServer/"
      }
    },
    layers: [
      {
        "id": "FL__3857__Grison__Rocks/1",
        "type": "fill",
        "source": "esri",
        "source-layer": "FL__3857__Grison__Rocks",
        "layout": {},
        "paint": { "fill-color": "#999999" }
      }
    ]
  },
  visible: false,
  title: "Rocks"
});

const urlTemplate =
  "https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer/tile/{level}/{row}/{col}";

// const urlTemplate =
//   "https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{level}/{row}/{col}";

const color = new Color("#3A4754");

const hillshade = new TileLayer({
  portalItem: { id: "1b243539f4514b6ba35e7d995890db1d" }, // Light
  blendMode: "multiply",
  listMode: "hide-children",
  visible: false,
  title: "World Hillshade (Blended)"
});

// hillshade.load().then(() => {
//   console.log({ hillshade });

//   const lods = hillshade.tileInfo.lods.slice(0, 16);
//   hillshade.tileInfo.lods = lods;
// });

const line = (
  sourceLayer: string,
  filter: number,
  color: string,
  blur = false,
  base = blur ? 12 : 2,
  minzoom = 0,
  maxzoom = 22
) => {
  return {
    "id": `${sourceLayer}`,
    "type": "line",
    "source": "esri",
    "source-layer": sourceLayer,
    // filter: ["==", "_symbol", 2],
    "minzoom": 0,
    "layout": {
      "visibility": "visible",
      "line-miter-limit": 2,
      "line-round-limit": 1.05,
      "line-cap": blur ? "butt" : "round",
      "line-join": "round"
    },
    "paint": {
      // "line-opacity": 1,
      // "line-opacity": stop(1, 6, 22),
      "line-color": color,
      // "line-width": stop(base, minzoom, maxzoom),
      "line-width": base,
      "line-gap-width": 0,
      // "line-blur": blur ? stop(base * 2, minzoom, maxzoom) : 0,
      "line-blur": blur ? base : 0,
      "line-translate-anchor": "map",
      "line-offset": 0,
      "line-translate": [0, 0]
    }
  };
};

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
        "line-color": "rgba(0, 0, 0, 1)",
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
        "line-color": "rgba(0, 0, 0, 1)",
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

// const swisstopoUrl =
//   "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";

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

const osmFeatures = new VectorTileLayer({
  title: "OSM Features",
  style: osmStyle
  // url: styleUrl
});

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
      //...contourLayers,
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

const winterBasemap = new Basemap({
  title: "Winter (Imagery)",
  baseLayers: [
    new WebTileLayer({
      urlTemplate: "https://tiles.platform.fatmap.com/winter-imagery/{z}/{x}/{y}.jpg"
      //subDomains: ["a", "b", "c", "d"]
    })
  ]
});

const summerBasemap = new Basemap({
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

const view = new SceneView({
  qualityProfile: "high",
  container: "viewDiv",

  camera: {
    position: {
      longitude: 9.50898363,
      latitude: 46.83073544,
      z: 6112.11573
    },
    heading: 154.97,
    tilt: 62.39
  },

  map: new Map({
    layers: [
      //
      rocks,
      hillshade,
      trees,
      buildings,
      osmFeatures,
      skiSlopes,
      skiLifts,
      skiLiftPoles
      // basemap
    ],
    basemap: vectorBasemap,
    ground: "world-elevation"
  }),

  // alphaCompositingEnabled: true,

  environment: {
    lighting: {
      directShadowsEnabled: true
    },
    atmosphereEnabled: true,
    atmosphere: {
      quality: "high"
    }
    // starsEnabled: false,
    // background: {
    //   type: "color",
    //   color
    // }
  }
});

const basemapList = new BasemapGallery({
  view,
  source: [vectorBasemap, summerBasemap, winterBasemap, swisstopoBasemap]
});

view.ui.add(
  new Expand({
    view,
    content: basemapList
  }),
  "bottom-right"
);

view.ui.add(
  new Home({
    view
  }),
  "top-left"
);

view.map.ground.surfaceColor = new Color("white");

view.popup.autoOpenEnabled = true;
view.popup.defaultPopupTemplateEnabled = true;

view.ui.add(
  new Expand({
    content: new Weather({ view }),
    view,
    group: "environment"
  }),
  "top-right"
);

view.ui.add(
  new Expand({
    content: new Daylight({ view }),
    view,
    group: "environment"
  }),
  "top-right"
);

view.ui.add(
  new Expand({
    content: new LayerList({ view }),
    view
  }),
  "bottom-left"
);

const appState = new AppState();

view.ui.add("edit-buttons", "bottom-left");
connectLiftEditor(view, appState);
connectSlopeEditor(view, appState);

whenOnce(() => !view.updating).then(() => {
  const loader = document.getElementById("loader");
  loader?.parentElement?.removeChild(loader);
});

window["view"] = view;
