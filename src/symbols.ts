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

import { towerColor, liftInvalidPreviewColor, maxTowerHeight, cableColor } from "./constants";

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
      profileRotation: "heading"
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
