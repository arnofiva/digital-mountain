import Camera from "@arcgis/core/Camera";

export const backgroundCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1035322.3255799332,
    y: 5895126.290169052,
    z: 4100.961265514605
  },
  heading: 333.2937029718289,
  tilt: 81.34980895091589
});

export const backgroundAnimationTargetCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1043715.8992755726,
    y: 5911892.004557021,
    z: 3839.550917587243
  },
  heading: 275.4284714805313,
  tilt: 81.01481716117439
});

export const monitorScreenStartCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1031400,
    y: 5910895,
    z: 3205
  },
  heading: 319,
  tilt: 76
});

export const planScreenStartCamera = new Camera({
  position: {
    spatialReference: {
      wkid: 102100
    },
    x: 1028206,
    y: 5912053,
    z: 1855
  },
  heading: 321,
  tilt: 81
});

export const visitScreenStartCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1028789,
    y: 5913876,
    z: 2519
  },
  heading: 310,
  tilt: 78
});
