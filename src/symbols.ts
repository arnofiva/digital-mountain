import {
  FillSymbol3DLayer,
  LineSymbol3D,
  LineSymbol3DLayer,
  ObjectSymbol3DLayer,
  PathSymbol3DLayer,
  PointSymbol3D,
  PolygonSymbol3D
} from "@arcgis/core/symbols";

import { maxTowerHeight } from "./constants";

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
 * Symbols used for lift cables.
 */
export const routeCableSymbol = new LineSymbol3D({ symbolLayers: [routeCableSymbolLayer()] });
export const invalidRouteCableSymbol = new LineSymbol3D({
  symbolLayers: [routeCableSymbolLayer({ color: [255, 0, 0, 1] })]
});

function routeCableSymbolLayer(options?: { color?: number[] }): PathSymbol3DLayer {
  return new PathSymbol3DLayer({
    profile: "quad", // creates a rectangular shape
    width: 4, // path width in meters
    height: 0.1, // path height in meters
    material: { color: options?.color ?? [0, 0, 0, 1] },
    cap: "butt",
    profileRotation: "heading"
  });
}

/**
 * Symbols used for lift towers.
 */
export const towerPreviewSymbol = new PointSymbol3D({ symbolLayers: [towerSymbolLayer({ roll: 180 })] });
export const invalidTowerPreviewSymbol = new PointSymbol3D({
  symbolLayers: [towerSymbolLayer({ roll: 180, color: [255, 0, 0, 1] })]
});

export function towerSymbolLayer(options?: {
  heading?: number;
  tilt?: number;
  roll?: number;
  color?: number[];
}): ObjectSymbol3DLayer {
  return new ObjectSymbol3DLayer({
    width: 2,
    depth: 2,
    height: maxTowerHeight,
    heading: options?.heading,
    tilt: options?.tilt,
    roll: options?.roll,
    resource: { primitive: "cylinder" },
    material: { color: options?.color ?? [0, 0, 0, 1] }
  });
}
