import Camera from "@arcgis/core/Camera";

export const backgroundCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1033987,
    y: 5905139,
    z: 5359
  },
  heading: 336,
  tilt: 62
});

export const backgroundAnimationTargetCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1040217,
    y: 5912189,
    z: 4396
  },
  heading: 284,
  tilt: 69
});

export const taskScreenStartCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1028789,
    y: 5913876,
    z: 2519
  },
  heading: 310,
  tilt: 78
});
