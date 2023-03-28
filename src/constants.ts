/**
 * Constants used in the application. All length values are in meters.
 */

/**
 * The title used for exported webscenes.
 */
export const sceneExportTitle = "Plan Export";

/**
 * The speed factor used for the animation of the camera when transitioning between screens.
 */
export const transitionCameraAnimationSpeedFactor = 0.5;

/**
 * The speed factor used for the animation of the camera in the background of the task selection screen.
 */
export const backgroundCameraAnimationSpeedFactor = 0.01;

/**
 * The date used for the view on the task selection screen.
 */
export const taskSelectionViewDate = new Date(Date.UTC(2022, 6, 1, 7, 30));

/**
 * The date used for the view on the planning screen.
 */
export const planningViewDate = new Date(1678878000000);

/**
 * Slope editor
 */
export const slopeBufferDistance = 15;
export const slopeMaxDeviation = 5;

/**
 * Lift editor
 */
export const cableColor = [120, 120, 120, 1];
export const towerColor = [128, 128, 128, 1];
export const liftInvalidPreviewColor = [255, 0, 0, 1];
export const cableOffset = 3;
export const initialTowerHeight = 10;
export const initialTowerSeparation = 200;
export const minTowerHeight = 5;
export const maxTowerHeight = 20;
export const minTowerSeparation = 50;
export const maxTowerSeparation = 1000;
export const towerDimensionOffset = 4;

/**
 * Hide trees that are within this distance from slopes and lifts.
 */
export const treeFilterDistance = 20;

/**
 * Time interval between clock updates.
 */
export const clockIntervalMs = 100;

/**
 * Time interval between filter updates. Not updating the filter too frequently will keep updates appearing responsive.
 */
export const filterUpdateIntervalMs = 100;

/**
 * Dates used in the live view.
 */
export const startTimeMorning = Date.UTC(2022, 2, 1, 9, 30);
export const startTimeEvening = Date.UTC(2022, 6, 1, 17, 0);
