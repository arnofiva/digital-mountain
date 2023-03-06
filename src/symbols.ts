import Color from "@arcgis/core/Color";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { RasterStretchRenderer } from "@arcgis/core/rasterRenderers";
import { SimpleRenderer } from "@arcgis/core/renderers";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import RotationVariable from "@arcgis/core/renderers/visualVariables/RotationVariable";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import AlgorithmicColorRamp from "@arcgis/core/rest/support/AlgorithmicColorRamp";
import MultipartColorRamp from "@arcgis/core/rest/support/MultipartColorRamp";
import {
  FillSymbol3DLayer,
  IconSymbol3DLayer,
  LineSymbol3D,
  LineSymbol3DLayer,
  ObjectSymbol3DLayer,
  PathSymbol3DLayer,
  PointSymbol3D,
  PolygonSymbol3D
} from "@arcgis/core/symbols";
import LabelSymbol3D from "@arcgis/core/symbols/LabelSymbol3D";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";

import { cableColor, liftInvalidPreviewColor, maxTowerHeight, towerColor } from "./constants";

/**
 * Symbols used to visualize slopes based on status.
 */
export const defaultSlopeSymbol = new PolygonSymbol3D({
  symbolLayers: [new FillSymbol3DLayer({ material: { color: [127, 127, 127, 0.5] } })]
});

export const openSlopeSymbol = new PolygonSymbol3D({
  symbolLayers: [new FillSymbol3DLayer({ material: { color: [79, 160, 227, 0.5] } })]
});

export const preparingSlopeSymbol = new PolygonSymbol3D({
  symbolLayers: [new FillSymbol3DLayer({ material: { color: [242, 140, 40, 0.5] } })]
});

/**
 * Symbol used to visualize the area within which lifts and slopes can be created or updated.
 */
export const parcelSymbol = new PolygonSymbol3D({
  symbolLayers: [
    new FillSymbol3DLayer({
      outline: {
        size: 2,
        color: [50, 50, 50, 255]
      },
      material: {
        color: [0, 0, 0, 0]
      }
    })
  ]
});

/**
 * Symbol used for line graphics that must be editable by Sketch and for hit testing, but which will otherwise not be displayed.
 */
export const hiddenLineSymbol = new LineSymbol3D({ symbolLayers: [new LineSymbol3DLayer({ size: 20 })] });

/**
 * Symbols used to visualize slope and lift routes while they are being created.
 */
export const sketchPreviewLineSymbol = new LineSymbol3D({
  symbolLayers: [
    new LineSymbol3DLayer({
      material: {
        color: [0, 200, 0, 1]
      },
      join: "bevel",
      cap: "round",
      size: 4
    })
  ]
});

export const invalidSketchPreviewLineSymbol = new LineSymbol3D({
  symbolLayers: [
    new LineSymbol3DLayer({
      material: {
        color: [200, 0, 0, 1]
      },
      join: "bevel",
      cap: "round",
      size: 4
    })
  ]
});

export const sketchPreviewPointSymbol = new PointSymbol3D({
  symbolLayers: [
    new IconSymbol3DLayer({ material: { color: [0, 200, 0, 1] }, resource: { primitive: "circle" }, size: 15 })
  ]
});

export const invalidSketchPreviewPointSymbol = new PointSymbol3D({
  symbolLayers: [
    new IconSymbol3DLayer({ material: { color: [200, 0, 0, 1] }, resource: { primitive: "circle" }, size: 15 })
  ]
});

/**
 * Symbols used for lift cables.
 */
export const routeCableSymbol = new LineSymbol3D({ symbolLayers: routeCableSymbolLayers() });
export const invalidRouteCableSymbol = new LineSymbol3D({
  symbolLayers: routeCableSymbolLayers({ color: liftInvalidPreviewColor })
});

function routeCableSymbolLayers(options?: { color?: number[] }): (LineSymbol3DLayer | PathSymbol3DLayer)[] {
  return [
    new LineSymbol3DLayer({
      material: { color: options?.color ?? cableColor },
      size: 2
    }),
    new PathSymbol3DLayer({
      material: { color: options?.color ?? cableColor },
      profile: "circle",
      width: 0.25,
      height: 0.25,
      profileRotation: "heading",
      castShadows: false
    })
  ];
}

/**
 * Symbols used for lift towers.
 */
export const towerPreviewSymbol = new PointSymbol3D({ symbolLayers: towerSymbolLayers() });
export const invalidTowerPreviewSymbol = new PointSymbol3D({
  symbolLayers: towerSymbolLayers({ color: liftInvalidPreviewColor })
});

export function towerSymbolLayers(options?: {
  heading?: number;
  tilt?: number;
  roll?: number;
  color?: number[];
  modelParameters?: { relativeElevation: number };
}): ObjectSymbol3DLayer[] {
  return options?.modelParameters
    ? [
        new ObjectSymbol3DLayer({
          resource: {
            href: "https://arnofiva.github.io/winter-resort/ski-lift-tower.glb"
          },
          anchor: "relative",
          anchorPosition: { x: 0, y: 0, z: 0.4 },
          material: { color: options?.color ?? towerColor },
          height: options.modelParameters.relativeElevation + 2,
          width: 4.5,
          depth: 4.5,
          heading: (options?.heading ?? 0) + 90,
          // model is rotated by 90 degrees, so adjust tilt/roll
          tilt: options?.roll,
          roll: options?.tilt
        })
      ]
    : [
        new ObjectSymbol3DLayer({
          anchor: "top",
          resource: {
            primitive: "cylinder"
          },
          material: { color: options?.color ?? towerColor },
          height: maxTowerHeight,
          heading: options?.heading,
          tilt: options?.tilt,
          roll: options?.roll,
          width: 1,
          depth: 1
        })
      ];
}

export function configureWaterMaxLayer(layer: FeatureLayer, waterLayer: FeatureLayer) {
  // get maximum size of cylinders from the water pits layer renderer
  const height = (
    (waterLayer.renderer as ClassBreaksRenderer).visualVariables.find(
      (vv) => vv instanceof SizeVariable && vv.axis === "height"
    ) as SizeVariable
  ).maxSize as number;
  layer.renderer = new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          resource: {
            primitive: "cylinder"
          },
          castShadows: false,
          width: 1.5,
          depth: 1.5,
          height,
          material: {
            color: [100, 100, 150, 0.7]
          }
        })
      ]
    })
  });
  layer.labelingInfo = [
    new LabelClass({
      labelExpressionInfo: {
        expression: "Floor($feature.volumen/379*100) + '% (' + Floor($feature.volumen, 1) + ' m³)'"
      },
      labelPlacement: "above-right",
      symbol: new LabelSymbol3D({
        symbolLayers: [
          new TextSymbol3DLayer({
            material: {
              color: [100, 100, 130]
            },
            halo: {
              color: [255, 255, 255, 0.4],
              size: 0.5
            },
            font: {
              size: 12,
              weight: "bold",
              family: '"Avenir Next","Helvetica Neue",Helvetica,Arial,sans-serif'
            }
          })
        ]
      })
    })
  ];
}

export function configureSnowHeightLayer(layer: ImageryTileLayer) {
  layer.renderer = new RasterStretchRenderer({
    stretchType: "min-max",
    statistics: [[0, 2, 0.8551445263440985, 1.9532896461042648]],
    gamma: [1],
    computeGamma: false,
    useGamma: true,
    colorRamp: new MultipartColorRamp({
      colorRamps: [
        new AlgorithmicColorRamp({
          algorithm: "hsv",
          fromColor: new Color([255, 0, 0, 255]),
          toColor: new Color([255, 255, 0, 255])
        }),
        new AlgorithmicColorRamp({
          algorithm: "hsv",
          fromColor: new Color([255, 255, 0, 255]),
          toColor: new Color([0, 255, 255, 255])
        }),
        new AlgorithmicColorRamp({
          algorithm: "hsv",
          fromColor: new Color([0, 255, 255, 255]),
          toColor: new Color([0, 0, 255, 255])
        })
      ]
    })
  });
}

export function configureStatisticsTreeLayer(layer: SceneLayer) {
  layer.renderer = new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          resource: {
            href: "https://ralucanicola.github.io/3d-models/Norway_Spruce.glb"
          },
          material: {
            // color: [206, 230, 184]
            color: [255, 255, 255]
          },
          castShadows: false
        })
      ]
    }),
    visualVariables: [
      new SizeVariable({
        axis: "height",
        valueExpression: "$feature.height"
      }),
      new RotationVariable({
        valueExpression: "Random() * 360"
      })
    ]
  });
}
