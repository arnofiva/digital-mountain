import { Polyline, SpatialReference } from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { UniqueValueRenderer } from "@arcgis/core/rasterRenderers";
import { SimpleRenderer } from "@arcgis/core/renderers";
import {
  FillSymbol3DLayer,
  LineSymbol3D,
  LineSymbol3DLayer,
  MeshSymbol3D,
  ObjectSymbol3DLayer,
  PathSymbol3DLayer,
  PointSymbol3D,
  PolygonSymbol3D
} from "@arcgis/core/symbols";
import LineStylePattern3D from "@arcgis/core/symbols/patterns/LineStylePattern3D";
import { LiftType } from "../lifts/liftType";
import { createSag, sagToSpanRatio } from "../lifts/sag";
import { skiResortArea } from "../variables";

const skiLiftSymbol = new LineSymbol3D({
  symbolLayers: [
    new PathSymbol3DLayer({
      profile: "quad", // creates a rectangular shape
      width: 4, // path width in meters
      height: 0.1, // path height in meters
      material: { color: [0, 0, 0, 1] },
      cap: "butt",
      profileRotation: "heading"
    })
  ]
});

export const skiLifts = new FeatureLayer({
  portalItem: {
    id: "dac535c60f214447af467393838ce36b"
  },
  title: "Without Sag",
  elevationInfo: {
    mode: "absolute-height"
  },
  renderer: new SimpleRenderer({
    symbol: skiLiftSymbol
  }),
  visible: false
});

export const skiLiftsWithSag = new GraphicsLayer({
  title: "With Sag",
  elevationInfo: {
    mode: "absolute-height"
  }
});

export const skiLiftPoles = new SceneLayer({
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
          width: 2, // diameter of the object from east to west in meters
          height: 100, // height of the object in meters
          depth: 2, // diameter of the object from north to south in meters
          roll: 180,
          resource: { primitive: "cylinder" },
          material: { color: "black" }
        })
      ]
    })
  })
});

export const skiSlopesArea = new FeatureLayer({
  portalItem: {
    id: "4929a1da6e7c4b689d0d7ddee6949b22"
  },
  //visible: false,
  // popupEnabled: false,
  title: "Ski Slope Areas",
  elevationInfo: {
    mode: "on-the-ground"
  },
  minScale: 0,
  maxScale: 0,
  renderer: new UniqueValueRenderer({
    field: "Schwierigkeitsgrad",
    defaultLabel: "Other",
    defaultSymbol: new PolygonSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: [237, 237, 80, 0.25]
          },
          outline: {
            size: 1.2,
            color: [237, 237, 80]
          }
        })
      ]
    }),
    uniqueValueInfos: [
      { value: "Blau", color: [20, 158, 206] },
      { value: "Rot", color: [237, 81, 81] },
      { value: "Orange", color: [237, 166, 80] },
      { value: "Schwarz", color: [80, 80, 80] }
    ].map(({ value, color }) => ({
      label: value,
      symbol: new PolygonSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: [...color, 0.25]
            },
            outline: {
              size: 1.2,
              color
            }
          })
        ]
      }),
      value
    }))
  })
});

export const skiSlopes = new FeatureLayer({
  portalItem: {
    id: "d6ae4391937d4f61975ea97d91960284"
  },
  visible: false,
  title: "Ski Slopes",
  elevationInfo: {
    mode: "on-the-ground"
  },
  minScale: 0,
  maxScale: 0,
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
                color: [0, 122, 194, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2,
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
                color: [0, 122, 194, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2
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
                color: [217, 0, 18, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2
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
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2
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
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2
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
                color: [0, 0, 0, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2,
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
                color: [230, 230, 18, 1]
              },
              join: "bevel",
              cap: "round",
              size: 2
            })
          ]
        }),
        value: "freeride"
      }
    ]
  })
});

export const buildings = new SceneLayer({
  portalItem: {
    id: "a714a2ca145446b79d97aaa7b895ff95"
  },
  renderer: new SimpleRenderer({
    symbol: new MeshSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: [170, 170, 170],
            colorMixMode: "replace"
          }
        })
      ]
    })
  })
});

(async () => {
  const query = skiLifts.createQuery();
  // query.objectIds = [
  //   738, 774, // Urdenbahn
  //   737, 736, 2451, 926, 928, 911, 921, 554, 910, 929, // Rothorn
  //   2041, // Verbindung Obertor
  // ];
  query.geometry = skiResortArea;
  query.outSpatialReference = SpatialReference.WebMercator;
  query.outFields = ["*"];
  query.returnGeometry = true;
  query.returnZ = true;

  const result = await skiLifts.queryFeatures(query);

  const liftType = (f: Graphic) => {
    const objectArt = f.getAttribute("OBJEKTART");
    switch (objectArt) {
      case 0: // Urdenbahn
      case 1: // Rothorn
        return LiftType.CableCar;
      case 2:
        return LiftType.Chair;
      case 5:
        return LiftType.TBar;
      default:
        throw Error("Unknown lift type: " + objectArt + " " + f.getAttribute("NAME"));
    }
  };

  const sags = result.features
    .filter((f) => f.geometry.type === "polyline")
    .map((f) => createSag(f.geometry as Polyline, sagToSpanRatio(liftType(f))));

  skiLiftsWithSag.addMany(
    sags.map(
      (geometry) =>
        new Graphic({
          geometry,
          symbol: skiLiftSymbol
        })
    )
  );
})();
