

import Basemap from "@arcgis/core/Basemap";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import { RasterShadedReliefRenderer } from "@arcgis/core/rasterRenderers";
import MultipartColorRamp from "@arcgis/core/rest/support/MultipartColorRamp";

const url =
  "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer";

  const winterColors = [
    // [49, 130, 189],
    // [107, 174, 214],
    [189, 215, 231],
    [189, 190, 231],
    [255, 255, 255]
  ];

const createColorRamps = (colors: number[][]) => {
  const colorRamps: any[] = [];
  colors.forEach((color, index) => {
    if (index < colors.length - 1) {
      colorRamps.push({
        fromColor: color,
        toColor: colors[index + 1]
      });
    }
  });
  console.log(colorRamps);
  return MultipartColorRamp.fromJSON({
    type: "multipart",
    colorRamps
  });
};


const renderer = new RasterShadedReliefRenderer({
  // const renderer = new RasterStretchRenderer({
  colorRamp: createColorRamps(winterColors),
  altitude: 90,
  hillshadeType: "traditional",
  scalingType: "adjusted",
  pixelSizeFactor: 0.001,
  pixelSizePower: 0.0001
  // stretchType: "min-max",
  // statistics: [[800, 3200]]
});

const layer = new ImageryTileLayer({
  url: url,
  renderer: renderer,
  opacity: 1
});


const winterBasemap = new Basemap({
  title: "Winter (ImageryTileLayer)",
  baseLayers: [
    new ImageryTileLayer({
      url: url,
      renderer: renderer,
      opacity: 1
    }),
    new WebTileLayer({
      urlTemplate: "https://tiles.platform.fatmap.com/winter-imagery/{z}/{x}/{y}.jpg",
      blendMode: "soft-light"
      //subDomains: ["a", "b", "c", "d"]
    })
  ]
});

export default winterBasemap;
