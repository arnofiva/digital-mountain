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
    latitude: 46.8197562,
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
    x: 1028296.683133663,
    y: 5911958.03045774,
    z: 1862.1876768777147
  },
  heading: 321.00056064594423,
  tilt: 80.2425705684597
});

export const planningScreenDetailCamera = new Camera({
  position: {
    spatialReference: {
      wkid: 102100
    },
    x: 1027101.7673122805,
    y: 5913179.97643817,
    z: 1958.02695877105
  },
  heading: 321.7750714515087,
  tilt: 57.915831658534536
});

export const statisticsScreenStartCamera = new Camera({
  position: {
    longitude: 9.23899066,
    latitude: 46.8412579,
    z: 1915.18369
  },
  heading: 270.56,
  tilt: 75.3
});
