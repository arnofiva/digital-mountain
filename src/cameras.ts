import Camera from "@arcgis/core/Camera";

/**
 * Camera position used to start the task selection screen background animation.
 */
export const backgroundAnimationStartCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1035322.3255799332,
    y: 5895126.290169052,
    z: 4100.961265514605
  },
  heading: 333.2937029718289,
  tilt: 81.34980895091589
});

/**
 * Camera position used to end the task selection screen background animation.
 */
export const backgroundAnimationEndCamera = new Camera({
  position: {
    spatialReference: { wkid: 102100 },
    x: 1043715.8992755726,
    y: 5911892.004557021,
    z: 3839.550917587243
  },
  heading: 275.4284714805313,
  tilt: 81.01481716117439
});

/**
 * Initial camera position for the live task screen.
 */
export const liveScreenStartCamera = new Camera({
  position: {
    longitude: 9.25326442,
    latitude: 46.8197562,
    z: 3368.54016
  },
  heading: 306.84,
  tilt: 72.59
});

/**
 * Initial camera position for the planning task screen.
 */
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

/**
 * Initial camera position for the statistics task screen.
 */
export const statisticsScreenStartCamera = new Camera({
  position: {
    longitude: 9.23899066,
    latitude: 46.8412579,
    z: 1915.18369
  },
  heading: 270.56,
  tilt: 75.3
});

/**
 * Camera position used to frame snow cannons on live task screen.
 */
export const snowCannonsCamera = new Camera({
  position: {
    longitude: 9.2281655,
    latitude: 46.84097062,
    z: 1881.33641
  },
  heading: 56.06,
  tilt: 67.89
});
