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

import { liftColor, liftInvalidPreviewColor, maxTowerHeight } from "./constants";

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
export const routeCableSymbol = new LineSymbol3D({ symbolLayers: [routeCableSymbolLayer()] });
export const invalidRouteCableSymbol = new LineSymbol3D({
  symbolLayers: [routeCableSymbolLayer({ color: liftInvalidPreviewColor })]
});

function routeCableSymbolLayer(options?: { color?: number[] }): PathSymbol3DLayer {
  return new PathSymbol3DLayer({
    profile: "circle",
    width: 0.5,
    height: 0.5,
    material: { color: options?.color ?? liftColor },
    profileRotation: "heading"
  });
}

/**
 * Symbols used for lift towers.
 */
export const towerPreviewSymbol = new PointSymbol3D({ symbolLayers: towerSymbolLayers({ showCrossarm: false }) });
export const invalidTowerPreviewSymbol = new PointSymbol3D({
  symbolLayers: towerSymbolLayers({ color: liftInvalidPreviewColor, showCrossarm: false })
});

export function towerSymbolLayers(options?: {
  heading?: number;
  tilt?: number;
  roll?: number;
  color?: number[];
  showCrossarm?: boolean;
}): ObjectSymbol3DLayer[] {
  const symbolLayers = [
    new ObjectSymbol3DLayer({
      anchor: "top",
      resource: {
        primitive: "cylinder"
      },
      material: { color: options?.color ?? liftColor },
      height: maxTowerHeight,
      heading: options?.heading,
      tilt: options?.tilt,
      roll: options?.roll,
      width: 1,
      depth: 1
    })
  ];
  if ((options?.showCrossarm ?? true) === true) {
    symbolLayers.push(
      new ObjectSymbol3DLayer({
        anchor: "center",
        resource: {
          primitive: "cylinder"
        },
        material: { color: options?.color ?? liftColor },
        roll: 90,
        heading: options?.heading,
        height: 6,
        width: 1,
        depth: 1
      })
    );
  }
  return symbolLayers;
}
