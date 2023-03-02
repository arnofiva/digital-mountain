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

export const liveScreenStartCamera = new Camera({
  position: {
    longitude: 9.25326442,
    latitude: 46.81975620,
    z: 3368.54016
  },
  heading: 306.84,
  tilt: 72.59
});

export const planningScreenStartCamera = new Camera({
  position: {
    spatialReference: {
      wkid: 102100
    },
    x: 1028212,
    y: 5912052,
    z: 1833
  },
  heading: 321,
  tilt: 81
});

export const planningScreenDetailCamera = new Camera({
  position: {
    spatialReference: {
      wkid: 102100
    },
    x: 1027062,
    y: 5913212,
    z: 1877
  },
  heading: 321,
  tilt: 81
});

export const statisticsScreenStartCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1028789,
    y: 5913876,
    z: 2519
  },
  heading: 310,
  tilt: 78
});
